# Graph Report - toologdidntread  (2026-05-28)

## Corpus Check
- 33 files · ~5,710 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 222 nodes · 202 edges · 29 communities (20 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e942d1d5`
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

## God Nodes (most connected - your core abstractions)
1. `scripts` - 16 edges
2. `compilerOptions` - 11 edges
3. `Second Life Log Q&A Design` - 11 edges
4. `File Structure` - 8 edges
5. `Task 3: Validation + Prompt Utilities (TDD)` - 8 edges
6. `Task 5: Ask Endpoint With Auth, Validation, Quota, and Provider Errors` - 7 edges
7. `files` - 6 edges
8. `Task 1: Test Harness + Dependencies` - 6 edges
9. `createAuth()` - 5 edges
10. `Available Svelte MCP Tools:` - 5 edges

## Surprising Connections (you probably didn't know these)
- `handleBetterAuth()` --calls--> `createAuth()`  [EXTRACTED]
  src/hooks.server.ts → src/lib/server/auth.ts
- `createAuth()` --calls--> `getDb()`  [EXTRACTED]
  src/lib/server/auth.ts → src/lib/server/db/index.ts

## Communities (29 total, 9 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (33): devDependencies, better-auth, @better-auth/cli, drizzle-kit, drizzle-orm, eslint, @eslint/compat, eslint-config-prettier (+25 more)

### Community 1 - "Community 1"
Cohesion: 0.14
Nodes (13): files, code, document, image, paper, video, graphifyignore_patterns, needs_graph (+5 more)

### Community 2 - "Community 2"
Cohesion: 0.10
Nodes (20): name, private, scripts, auth:schema, build, check, check:watch, db:generate (+12 more)

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (12): compilerOptions, allowJs, checkJs, esModuleInterop, forceConsistentCasingInFileNames, moduleResolution, resolveJsonModule, rewriteRelativeImportExtensions (+4 more)

### Community 4 - "Community 4"
Cohesion: 0.21
Nodes (8): getDb(), logQaUsage, task, auth, createAuth(), Locals, Platform, handleBetterAuth()

### Community 5 - "Community 5"
Cohesion: 0.22
Nodes (8): Building, code:sh (# create a new project), code:sh (# recreate this project), code:sh (npm run dev), code:sh (npm run build), Creating a project, Developing, sv

### Community 6 - "Community 6"
Cohesion: 0.25
Nodes (7): account, accountRelations, session, sessionRelations, user, userRelations, verification

### Community 7 - "Community 7"
Cohesion: 0.25
Nodes (7): 1. list-sections, 2. get-documentation, 3. svelte-autofixer, 4. playground-link, Available Svelte MCP Tools:, graphify, Project Configuration

### Community 8 - "Community 8"
Cohesion: 0.25
Nodes (7): 1. list-sections, 2. get-documentation, 3. svelte-autofixer, 4. playground-link, Available Svelte MCP Tools:, graphify, Project Configuration

### Community 9 - "Community 9"
Cohesion: 0.07
Nodes (26): code:json ({), code:ts (// tests/server/log-qa/usage.test.ts), code:ts (// src/lib/server/log-qa/usage.ts), code:ts (// src/lib/server/log-qa/provider.ts), code:bash (pnpm add -D vitest @testing-library/svelte jsdom @vitest/cov), code:bash (git add src/lib/server/log-qa/usage.ts src/lib/server/log-qa), code:ts (// tests/routes/log-qa-page.test.ts), code:svelte (<!-- src/routes/log-qa/+page.svelte -->) (+18 more)

### Community 10 - "Community 10"
Cohesion: 0.40
Nodes (4): mcpServers, svelte, type, url

### Community 11 - "Community 11"
Cohesion: 0.50
Nodes (3): mcpServers, svelte, url

### Community 23 - "Community 23"
Cohesion: 0.17
Nodes (11): AI Prompting, Architecture, Data Storage, Decisions, Goals, Non-Goals, Second Life Log Q&A Design, Summary (+3 more)

### Community 24 - "Community 24"
Cohesion: 0.25
Nodes (8): code:ts (// tests/server/log-qa/validation.test.ts), code:ts (// tests/server/log-qa/prompt.test.ts), code:ts (// src/lib/server/log-qa/constants.ts), code:ts (// src/lib/server/log-qa/line-number.ts), code:ts (// src/lib/server/log-qa/validation.ts), code:ts (// src/lib/server/log-qa/prompt.ts), code:bash (git add src/lib/server/log-qa/constants.ts src/lib/server/lo), Task 3: Validation + Prompt Utilities (TDD)

### Community 25 - "Community 25"
Cohesion: 0.29
Nodes (7): code:ts (// tests/routes/api/log-qa-ask.test.ts), code:ts (// src/routes/api/log-qa/ask/+server.ts (shape)), code:ts (// src/lib/server/log-qa/usage.ts), code:ts (// src/lib/server/log-qa/provider.ts), code:env (# .env.example), code:bash (git add src/routes/api/log-qa/ask/+server.ts src/lib/server/), Task 5: Ask Endpoint With Auth, Validation, Quota, and Provider Errors

## Knowledge Gaps
- **159 isolated node(s):** `gitignorePath`, `extends`, `rewriteRelativeImportExtensions`, `allowJs`, `checkJs` (+154 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Community 0` to `Community 2`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `File Structure` connect `Community 9` to `Community 24`, `Community 25`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `gitignorePath`, `extends`, `rewriteRelativeImportExtensions` to the rest of the system?**
  _159 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `Community 9` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._