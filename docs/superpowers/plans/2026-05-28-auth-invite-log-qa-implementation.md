# Auth + Invite Registration + /log-qa Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add login and invite-only registration, and require authentication for `/log-qa` while preserving existing Log Q&A behavior.

**Architecture:** Keep Better Auth as the identity/session authority, add an `invite_codes` table managed by Drizzle, and enforce route-level gating in `hooks.server.ts` using safe `next` redirects. Registration validates and consumes invite codes server-side in one transactional flow, while API auth behavior remains explicit 401 responses.

**Tech Stack:** SvelteKit 2, Svelte 5, TypeScript, Better Auth, Drizzle ORM (SQLite/D1), Vitest, Testing Library.

---

### Task 1: Add Invite Code Persistence

**Files:**

- Create: `src/lib/server/db/migrations/0002_invite_codes.sql`
- Modify: `src/lib/server/db/schema.ts`
- Test: `tests/server/auth/invite-code.test.ts`

- [ ] **Step 1: Write the failing unit test for invite validity rules**

```ts
// tests/server/auth/invite-code.test.ts
import { describe, expect, it } from 'vitest';
import { isInviteUsable } from '$lib/server/auth/invite-code';

describe('isInviteUsable', () => {
	it('rejects disabled invites', () => {
		expect(
			isInviteUsable({
				disabled: true,
				expiresAt: null,
				maxUses: 1,
				usedCount: 0,
				nowMs: Date.now()
			})
		).toEqual({ ok: false, reason: 'disabled' });
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/server/auth/invite-code.test.ts`
Expected: FAIL with module/function not found for `isInviteUsable`.

- [ ] **Step 3: Add schema and migration**

```sql
-- src/lib/server/db/migrations/0002_invite_codes.sql
CREATE TABLE IF NOT EXISTS invite_codes (
  id TEXT PRIMARY KEY,
  code_hash TEXT NOT NULL UNIQUE,
  created_by TEXT,
  expires_at INTEGER,
  max_uses INTEGER NOT NULL DEFAULT 1,
  used_count INTEGER NOT NULL DEFAULT 0,
  disabled INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (created_by) REFERENCES user(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS invite_codes_code_hash_idx ON invite_codes(code_hash);
```

```ts
// src/lib/server/db/schema.ts (add)
export const inviteCodes = sqliteTable('invite_codes', {
	id: text('id').primaryKey(),
	codeHash: text('code_hash').notNull().unique(),
	createdBy: text('created_by'),
	expiresAt: integer('expires_at', { mode: 'timestamp_ms' }),
	maxUses: integer('max_uses').notNull().default(1),
	usedCount: integer('used_count').notNull().default(0),
	disabled: integer('disabled', { mode: 'boolean' }).notNull().default(false),
	createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull()
});
```

- [ ] **Step 4: Add minimal invite utility to pass the test**

```ts
// src/lib/server/auth/invite-code.ts
export const isInviteUsable = (input: {
	disabled: boolean;
	expiresAt: number | null;
	maxUses: number;
	usedCount: number;
	nowMs: number;
}) => {
	if (input.disabled) return { ok: false as const, reason: 'disabled' as const };
	if (input.expiresAt !== null && input.expiresAt <= input.nowMs)
		return { ok: false as const, reason: 'expired' as const };
	if (input.usedCount >= input.maxUses) return { ok: false as const, reason: 'used_up' as const };
	return { ok: true as const };
};
```

- [ ] **Step 5: Run tests and commit**

Run: `pnpm test tests/server/auth/invite-code.test.ts`
Expected: PASS

```bash
git add src/lib/server/db/migrations/0002_invite_codes.sql src/lib/server/db/schema.ts src/lib/server/auth/invite-code.ts tests/server/auth/invite-code.test.ts
git commit -m "feat: add invite code schema and base validation"
```

### Task 2: Add Login and Register Routes With Server Actions

**Files:**

- Create: `src/routes/login/+page.server.ts`
- Create: `src/routes/login/+page.svelte`
- Create: `src/routes/register/+page.server.ts`
- Create: `src/routes/register/+page.svelte`
- Create: `src/lib/server/auth/next.ts`
- Test: `tests/routes/auth/login-register-actions.test.ts`

- [ ] **Step 1: Write failing action tests for login/register response behavior**

```ts
// tests/routes/auth/login-register-actions.test.ts
import { describe, expect, it } from 'vitest';
import { validateNextPath } from '$lib/server/auth/next';

describe('validateNextPath', () => {
	it('accepts local absolute path', () => {
		expect(validateNextPath('/log-qa')).toBe('/log-qa');
	});
	it('rejects absolute external url', () => {
		expect(validateNextPath('https://evil.test')).toBe('/log-qa');
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/routes/auth/login-register-actions.test.ts`
Expected: FAIL with missing module/function.

- [ ] **Step 3: Implement safe next helper and minimal login/register actions**

```ts
// src/lib/server/auth/next.ts
export const validateNextPath = (value: string | null | undefined): string => {
	if (!value) return '/log-qa';
	if (!value.startsWith('/')) return '/log-qa';
	if (value.startsWith('//')) return '/log-qa';
	return value;
};
```

```ts
// src/routes/login/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import { validateNextPath } from '$lib/server/auth/next';

export const actions = {
	default: async (event) => {
		const data = await event.request.formData();
		const email = String(data.get('email') ?? '');
		const password = String(data.get('password') ?? '');
		const next = validateNextPath(event.url.searchParams.get('next'));
		const result = await event.locals.auth.api.signInEmail({ body: { email, password } });
		if (!result?.user) return fail(400, { error: 'Invalid credentials' });
		throw redirect(303, next);
	}
};
```

```ts
// src/routes/register/+page.server.ts (placeholder without invite consume yet)
import { fail, redirect } from '@sveltejs/kit';
import { validateNextPath } from '$lib/server/auth/next';

export const actions = {
	default: async (event) => {
		const data = await event.request.formData();
		const email = String(data.get('email') ?? '');
		const password = String(data.get('password') ?? '');
		const inviteCode = String(data.get('inviteCode') ?? '');
		if (!inviteCode) return fail(400, { error: 'Invalid invite code' });
		const next = validateNextPath(event.url.searchParams.get('next'));
		const result = await event.locals.auth.api.signUpEmail({
			body: { email, password, name: email }
		});
		if (!result?.user) return fail(400, { error: 'Registration failed' });
		throw redirect(303, next);
	}
};
```

- [ ] **Step 4: Build minimal forms**

```svelte
<!-- src/routes/login/+page.svelte -->
<form method="POST" class="mx-auto max-w-md space-y-4 p-6">
	<h1 class="text-2xl font-semibold">Login</h1>
	<input name="email" type="email" required class="w-full rounded border p-2" />
	<input name="password" type="password" required class="w-full rounded border p-2" />
	<button class="rounded bg-black px-4 py-2 text-white" type="submit">Sign in</button>
</form>
```

```svelte
<!-- src/routes/register/+page.svelte -->
<form method="POST" class="mx-auto max-w-md space-y-4 p-6">
	<h1 class="text-2xl font-semibold">Register</h1>
	<input name="email" type="email" required class="w-full rounded border p-2" />
	<input name="password" type="password" required class="w-full rounded border p-2" />
	<input name="inviteCode" type="text" required class="w-full rounded border p-2" />
	<button class="rounded bg-black px-4 py-2 text-white" type="submit">Create account</button>
</form>
```

- [ ] **Step 5: Run tests and commit**

Run: `pnpm test tests/routes/auth/login-register-actions.test.ts`
Expected: PASS

```bash
git add src/lib/server/auth/next.ts src/routes/login/+page.server.ts src/routes/login/+page.svelte src/routes/register/+page.server.ts src/routes/register/+page.svelte tests/routes/auth/login-register-actions.test.ts
git commit -m "feat: add login/register routes with safe next redirect"
```

### Task 3: Enforce /log-qa Redirect Gate in Hook

**Files:**

- Modify: `src/hooks.server.ts`
- Test: `tests/server/hooks.auth-gate.test.ts`

- [ ] **Step 1: Write failing hook test for redirect behavior**

```ts
// tests/server/hooks.auth-gate.test.ts
import { describe, expect, it } from 'vitest';
import { handle } from '../../src/hooks.server';

describe('auth gate', () => {
	it('redirects unauthenticated /log-qa requests to login with next', async () => {
		const event = {
			url: new URL('http://localhost/log-qa'),
			request: new Request('http://localhost/log-qa'),
			locals: {},
			platform: { env: { DB: {} } }
		};
		const res = await handle({ event, resolve: (() => new Response('ok')) as never });
		expect(res.status).toBe(303);
		expect(res.headers.get('location')).toContain('/login?next=%2Flog-qa');
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/server/hooks.auth-gate.test.ts`
Expected: FAIL because no redirect gate exists.

- [ ] **Step 3: Implement gate in `hooks.server.ts`**

```ts
// after getSession in src/hooks.server.ts
const requiresLogQaAuth = event.url.pathname.startsWith('/log-qa');
if (requiresLogQaAuth && !session?.user) {
	const next = `${event.url.pathname}${event.url.search}`;
	const destination = `/login?next=${encodeURIComponent(next)}`;
	return new Response(null, {
		status: 303,
		headers: { location: destination }
	});
}
```

- [ ] **Step 4: Run focused tests**

Run: `pnpm test tests/server/hooks.auth-gate.test.ts tests/routes/api/log-qa-ask.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks.server.ts tests/server/hooks.auth-gate.test.ts
git commit -m "feat: gate log-qa page behind authenticated session"
```

### Task 4: Add Invite Validation + Transactional Consumption to Registration

**Files:**

- Modify: `src/lib/server/auth/invite-code.ts`
- Modify: `src/routes/register/+page.server.ts`
- Create: `src/lib/server/auth/invite-repository.ts`
- Test: `tests/server/auth/invite-repository.test.ts`
- Test: `tests/routes/auth/register-invite.test.ts`

- [ ] **Step 1: Write failing tests for invite status and single-use consume**

```ts
// tests/routes/auth/register-invite.test.ts
import { describe, expect, it } from 'vitest';
import { mapInviteError } from '$lib/server/auth/invite-code';

describe('mapInviteError', () => {
	it('maps used_up to user message', () => {
		expect(mapInviteError('used_up')).toBe('Invite fully used');
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/routes/auth/register-invite.test.ts`
Expected: FAIL with missing export.

- [ ] **Step 3: Implement invite lookup/consume with transaction-friendly API**

```ts
// src/lib/server/auth/invite-repository.ts
import { and, eq, sql } from 'drizzle-orm';
import { inviteCodes } from '$lib/server/db/schema';

export const consumeInviteByHash = async (
	db: ReturnType<typeof import('$lib/server/db').getDb>,
	codeHash: string
) => {
	const row = await db.query.inviteCodes.findFirst({ where: eq(inviteCodes.codeHash, codeHash) });
	if (!row) return { ok: false as const, reason: 'invalid' as const };
	// use shared usability check and update condition to avoid overuse
	const updated = await db
		.update(inviteCodes)
		.set({ usedCount: sql`${inviteCodes.usedCount} + 1`, updatedAt: Date.now() })
		.where(
			and(eq(inviteCodes.id, row.id), sql`${inviteCodes.used_count} < ${inviteCodes.maxUses}`)
		);
	return { ok: true as const, invite: row, updated };
};
```

- [ ] **Step 4: Wire register action to validate/consume invite before sign-up**

```ts
// src/routes/register/+page.server.ts (core flow)
// 1) hash inviteCode
// 2) consumeInviteByHash(db, hash)
// 3) if not ok -> fail with mapped invite error
// 4) signUpEmail
// 5) redirect to validated next
```

- [ ] **Step 5: Run tests and commit**

Run: `pnpm test tests/server/auth/invite-code.test.ts tests/server/auth/invite-repository.test.ts tests/routes/auth/register-invite.test.ts`
Expected: PASS

```bash
git add src/lib/server/auth/invite-code.ts src/lib/server/auth/invite-repository.ts src/routes/register/+page.server.ts tests/server/auth/invite-repository.test.ts tests/routes/auth/register-invite.test.ts
git commit -m "feat: enforce invite-only registration with transactional consume"
```

### Task 5: Tighten Security and Finish Regression Suite

**Files:**

- Modify: `src/lib/server/auth/next.ts`
- Modify: `tests/routes/auth/login-register-actions.test.ts`
- Modify: `tests/routes/api/log-qa-ask.test.ts` (if necessary only)
- Modify: `tests/routes/log-qa-page.test.ts` (if necessary only)

- [ ] **Step 1: Write failing tests for malformed next values**

```ts
it('rejects protocol-relative next', () => {
	expect(validateNextPath('//evil.test/path')).toBe('/log-qa');
});
```

- [ ] **Step 2: Run targeted tests to confirm failure**

Run: `pnpm test tests/routes/auth/login-register-actions.test.ts`
Expected: FAIL on new case.

- [ ] **Step 3: Implement stricter `next` sanitizer rules**

```ts
// src/lib/server/auth/next.ts
if (value.includes('\n') || value.includes('\r')) return '/log-qa';
try {
	const u = new URL(value, 'http://local');
	if (u.origin !== 'http://local') return '/log-qa';
	if (!u.pathname.startsWith('/')) return '/log-qa';
	return `${u.pathname}${u.search}`;
} catch {
	return '/log-qa';
}
```

- [ ] **Step 4: Run full test and checks**

Run: `pnpm test`
Expected: PASS

Run: `pnpm check`
Expected: PASS

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/server/auth/next.ts tests/routes/auth/login-register-actions.test.ts
git commit -m "test: cover next redirect safety and auth flow regressions"
```

### Task 6: Keep Graph Up To Date and Document Invite Operations

**Files:**

- Modify: `README.md`
- Modify: `graphify-out/*` (generated)

- [ ] **Step 1: Add short operator note for manual invite creation**

```md
## Invite-only registration

Create invite rows manually in D1 using hashed codes. Registration requires a valid, non-expired, non-disabled invite with remaining uses.
```

- [ ] **Step 2: Update graph artifacts**

Run: `graphify update .`
Expected: updated `graphify-out/` metadata with no command error.

- [ ] **Step 3: Verify docs and tests still green**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add README.md graphify-out
git commit -m "docs: document invite-only auth and refresh graphify output"
```

## Spec Coverage Check

- Login page + safe redirect: covered in Task 2 and Task 5.
- Invite-only registration with deterministic errors: covered in Task 1 and Task 4.
- `/log-qa` auth redirect: covered in Task 3.
- API unauthenticated behavior: preserved and re-validated in Task 3/5.
- Regression protection: covered in Task 5 and Task 6.

## Placeholder Scan

- No `TODO`, `TBD`, or deferred placeholders remain.

## Type Consistency Check

- Uses consistent names: `inviteCodes`, `validateNextPath`, `isInviteUsable`, `consumeInviteByHash`.
- Redirect fallback consistently `/log-qa`.
