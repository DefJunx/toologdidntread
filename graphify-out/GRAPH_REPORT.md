# Graph Report - toologdidntread  (2026-05-28)

## Corpus Check
- 58 files · ~11,177 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 437 nodes · 501 edges · 43 communities (33 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2739515d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]

## God Nodes (most connected - your core abstractions)
1. `scripts` - 17 edges
2. `scripts` - 16 edges
3. `Auth + Invite Registration + /log-qa Gate Design` - 15 edges
4. `compilerOptions` - 12 edges
5. `Second Life Log Q&A Design` - 12 edges
6. `POST()` - 11 edges
7. `getDb()` - 10 edges
8. `Auth + Invite Registration + /log-qa Gate Implementation Plan` - 10 edges
9. `createAuth()` - 8 edges
10. `Task 2: Add Login and Register Routes With Server Actions` - 8 edges

## Surprising Connections (you probably didn't know these)
- `buildPromptPayload()` --calls--> `withLineNumbers()`  [EXTRACTED]
  src/lib/server/log-qa/prompt.ts → .worktrees/task-3-log-qa-validation-prompt/src/lib/server/log-qa/line-number.ts
- `POST()` --calls--> `buildPromptPayload()`  [EXTRACTED]
  src/routes/api/log-qa/ask/+server.ts → src/lib/server/log-qa/prompt.ts
- `getDailyCount()` --calls--> `getDb()`  [EXTRACTED]
  src/lib/server/log-qa/usage.ts → src/lib/server/db/index.ts
- `incrementDailyCount()` --calls--> `getDb()`  [EXTRACTED]
  src/lib/server/log-qa/usage.ts → src/lib/server/db/index.ts
- `consumeInviteCode()` --calls--> `getDb()`  [EXTRACTED]
  src/lib/server/auth/invite-repository.ts → src/lib/server/db/index.ts

## Communities (43 total, 10 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (33): devDependencies, better-auth, @better-auth/cli, drizzle-kit, drizzle-orm, eslint, @eslint/compat, eslint-config-prettier (+25 more)

### Community 1 - "Community 1"
Cohesion: 0.20
Nodes (13): files, code, document, image, paper, video, graphifyignore_patterns, needs_graph (+5 more)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (16): scripts, auth:schema, build, check, check:watch, db:generate, db:migrate, db:push (+8 more)

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (12): compilerOptions, allowJs, checkJs, esModuleInterop, forceConsistentCasingInFileNames, moduleResolution, resolveJsonModule, rewriteRelativeImportExtensions (+4 more)

### Community 4 - "Community 4"
Cohesion: 0.25
Nodes (7): getDb(), auth, createAuth(), mocks, Locals, Platform, handleBetterAuth()

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (18): Building, code:sh (# create a new project), code:sh (# recreate this project), code:sh (npm run dev), code:sh (npm run build), Creating a project, Developing, Log Q&A (+10 more)

### Community 6 - "Community 6"
Cohesion: 0.39
Nodes (7): account, accountRelations, session, sessionRelations, user, userRelations, verification

### Community 7 - "Community 7"
Cohesion: 0.28
Nodes (7): 1. list-sections, 2. get-documentation, 3. svelte-autofixer, 4. playground-link, Available Svelte MCP Tools:, graphify, Project Configuration

### Community 8 - "Community 8"
Cohesion: 0.28
Nodes (7): 1. list-sections, 2. get-documentation, 3. svelte-autofixer, 4. playground-link, Available Svelte MCP Tools:, graphify, Project Configuration

### Community 9 - "Community 9"
Cohesion: 0.05
Nodes (41): code:json ({), code:ts (// tests/server/log-qa/validation.test.ts), code:ts (// tests/server/log-qa/prompt.test.ts), code:ts (// src/lib/server/log-qa/constants.ts), code:ts (// src/lib/server/log-qa/line-number.ts), code:ts (// src/lib/server/log-qa/validation.ts), code:ts (// src/lib/server/log-qa/prompt.ts), code:bash (git add src/lib/server/log-qa/constants.ts src/lib/server/lo) (+33 more)

### Community 10 - "Community 10"
Cohesion: 0.33
Nodes (4): mcpServers, svelte, type, url

### Community 11 - "Community 11"
Cohesion: 0.40
Nodes (3): mcpServers, svelte, url

### Community 23 - "Community 23"
Cohesion: 0.15
Nodes (11): AI Prompting, Architecture, Data Storage, Decisions, Goals, Non-Goals, Second Life Log Q&A Design, Summary (+3 more)

### Community 24 - "Community 24"
Cohesion: 0.06
Nodes (34): Auth + Invite Registration + /log-qa Gate Implementation Plan, code:ts (// tests/server/auth/invite-code.test.ts), code:svelte (<!-- src/routes/login/+page.svelte -->), code:svelte (<!-- src/routes/register/+page.svelte -->), code:bash (git add src/lib/server/auth/next.ts src/routes/login/+page.s), code:ts (// tests/server/hooks.auth-gate.test.ts), code:ts (// after getSession in src/hooks.server.ts), code:bash (git add src/hooks.server.ts tests/server/hooks.auth-gate.tes) (+26 more)

### Community 25 - "Community 25"
Cohesion: 0.06
Nodes (34): devDependencies, better-auth, @better-auth/cli, drizzle-kit, drizzle-orm, eslint, @eslint/compat, eslint-config-prettier (+26 more)

### Community 29 - "Community 29"
Cohesion: 0.14
Nodes (17): AskEvent, mocks, POST(), inviteCodes, logQaUsage, task, MAX_LOG_BYTES, SUPPORTED_EXTENSIONS (+9 more)

### Community 30 - "Community 30"
Cohesion: 0.09
Nodes (24): name, private, scripts, auth:schema, build, check, check:watch, db:generate (+16 more)

### Community 31 - "Community 31"
Cohesion: 0.39
Nodes (3): withLineNumbers(), buildPromptPayload(), payload

### Community 36 - "Community 36"
Cohesion: 0.07
Nodes (28): Acceptance Criteria, API Gating, Architecture, Auth Action Tests, Auth + Invite Registration + /log-qa Gate Design, Auth Source of Truth, Constraints, Data Flow (+20 more)

### Community 37 - "Community 37"
Cohesion: 0.21
Nodes (10): hashInviteCode(), InviteRejectReason, isInviteUsable(), mapInviteError(), normalizeInviteCode(), consumeInviteCode(), ConsumeInviteResult, validateNextPath() (+2 more)

## Knowledge Gaps
- **239 isolated node(s):** `rewriteRelativeImportExtensions`, `allowJs`, `checkJs`, `esModuleInterop`, `forceConsistentCasingInFileNames` (+234 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Community 25` to `Community 30`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Community 0` to `Community 30`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **What connects `rewriteRelativeImportExtensions`, `allowJs`, `checkJs` to the rest of the system?**
  _239 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `Community 9` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._