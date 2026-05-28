# Auth + Invite Registration + /log-qa Gate Design

## Summary

Add authentication screens and invite-only registration, then enforce auth access for `/log-qa` and its API.

Approved behavior:

- Unauthenticated users visiting `/log-qa` are redirected to `/login?next=/log-qa`.
- After successful login, users return to the safe `next` path.
- Registration is invite-only.
- Invite codes are generated manually in DB for MVP.

## Goals

- Add login and registration pages that fit existing SvelteKit + Better Auth setup.
- Enforce auth gate for `/log-qa` UI and keep API protection for `/api/log-qa/ask`.
- Support invite-code validation with secure storage and deterministic error handling.

## Non-Goals

- Admin invite-management UI.
- Email invite links or passwordless auth.
- Broader RBAC/permissions model beyond authenticated user gating.

## Constraints

- Keep existing log-qa behavior and tests intact.
- Avoid account enumeration in login errors.
- Avoid open-redirect via `next` parameter validation.

## Architecture

### Auth Source of Truth

- Better Auth remains the session and credential authority.
- Existing server-side session reading in `hooks.server.ts` continues as the gate entry point.

### Invite Code Model

Add a DB table for invite code inventory and lifecycle.

Proposed table: `invite_codes`

- `id` (pk)
- `code_hash` (unique, indexed)
- `created_by` (nullable user reference for manual ops)
- `expires_at` (nullable)
- `max_uses` (integer, default 1)
- `used_count` (integer, default 0)
- `disabled` (boolean, default false)
- `created_at`
- `updated_at`

Storage/security:

- Never persist raw invite code; only persist hash.
- Registration hashes input code and compares against `code_hash` lookup.

## Routes and Components

### `/login`

- Form fields: email, password.
- Handles sign-in via server action.
- Reads optional `next` query parameter.
- On success, redirect to validated `next` or fallback `/log-qa`.

### `/register`

- Form fields: email, password, invite code.
- Server action validates invite state before account creation.
- On success: create account, consume invite usage, then sign-in and redirect (or fallback to `/login` if sign-in fails).

## Data Flow

### Login Flow

1. User submits email/password to login action.
2. Action calls Better Auth sign-in.
3. If invalid, return generic `invalid credentials` message.
4. If valid, redirect to safe `next` or fallback `/log-qa`.

### Registration Flow

1. User submits email/password/invite code.
2. Normalize input code.
3. Hash normalized code.
4. Query matching invite row by `code_hash`.
5. Reject when:

- not found
- `disabled = true`
- `expires_at` in the past
- `used_count >= max_uses`

6. In one DB transaction:

- create user credentials/account
- increment `used_count`

7. Establish session and redirect.

## Gating / Authorization Behavior

### Page Gating

- In `hooks.server.ts`, for path prefix `/log-qa` with no session:
- redirect to `/login?next=<encoded_original_path_with_query>`.

### API Gating

- Keep protected behavior for `/api/log-qa/ask`.
- Unauthenticated requests return `401` JSON response.

### Safe `next` handling

- Only allow local absolute paths starting with `/`.
- Reject external origins, protocol-relative URLs, and malformed values.
- On invalid `next`, fallback to `/log-qa`.

## Error Handling

- Login: generic failure message only.
- Register invite failures:
- invalid code
- expired code
- disabled code
- invite fully used
- Unexpected server failures return stable generic server error response.

## Security Considerations

- Hashed invite codes at rest.
- Atomic consume-on-register in transaction to prevent race overuse.
- Keep auth and invite validation server-only.
- Add lightweight per-IP/per-email throttling for auth actions (MVP guardrail).

## Testing Strategy

### Unit Tests

- Invite validation outcomes:
- valid
- invalid
- expired
- disabled
- maxed usage

### Route/API Tests

- `/log-qa` unauthenticated request redirects to `/login?next=/log-qa`.
- `/api/log-qa/ask` unauthenticated request returns `401`.

### Auth Action Tests

- Login success/failure behavior.
- Registration success with valid invite.
- Registration failures for each invite rejection condition.
- `next` parameter safety checks.

### Regression

- Existing log-qa tests continue passing (quota/validation/prompt behavior unchanged).

## Delivery Phasing

1. Add invite table schema + migration.
2. Add `/login` and `/register` pages with server actions.
3. Wire invite validation + transactional consumption into register action.
4. Update `hooks.server.ts` gating redirect behavior for `/log-qa`.
5. Add/adjust tests.

## Risks and Mitigations

- Race conditions on invite usage:
- Mitigation: transactional increment with row-level lock/update condition.
- Open redirect via `next`:
- Mitigation: strict local-path validation.
- Auth UX friction:
- Mitigation: clear errors and preserve intended destination after login.

## Acceptance Criteria

- Unauthenticated `/log-qa` navigation always redirects to login with safe return path.
- Authenticated users can access `/log-qa` as before.
- Registration requires a valid invite code; invalid states are rejected deterministically.
- Invite usage increments exactly once per successful registration.
- Existing log-qa functionality and tests remain intact.
