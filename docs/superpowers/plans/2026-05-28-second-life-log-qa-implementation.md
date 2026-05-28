# Second Life Log Q&A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a logged-in SvelteKit page where users upload one `.txt`/`.log` Second Life chat log and ask up to 20 Gemini-backed questions per UTC day, with session-only raw log handling.

**Architecture:** Keep raw log text in client memory only and submit it to a server endpoint per question. Split server logic into small modules: validation, line-numbering/prompt build, usage quota persistence, and Gemini provider adapter. Persist only daily usage counters in D1 and enforce auth + quota in the endpoint.

**Tech Stack:** SvelteKit 2, Svelte 5, TypeScript, Better Auth, Drizzle ORM + Cloudflare D1, Gemini API wrapper, Vitest, @testing-library/svelte

---

## File Structure

- Create: `src/lib/server/log-qa/constants.ts` (limits and shared config)
- Create: `src/lib/server/log-qa/validation.ts` (file/question/request validation)
- Create: `src/lib/server/log-qa/line-number.ts` (line-numbering utility)
- Create: `src/lib/server/log-qa/prompt.ts` (grounded JSON prompt construction)
- Create: `src/lib/server/log-qa/usage.ts` (D1 quota query + increment)
- Create: `src/lib/server/log-qa/provider.ts` (provider interface + Gemini implementation)
- Create: `src/routes/log-qa/+page.svelte` (upload + Q&A UI with privacy copy)
- Create: `src/routes/api/log-qa/ask/+server.ts` (JSON endpoint orchestration)
- Modify: `src/lib/server/db/schema.ts` (new `logQaUsage` table)
- Create: `src/lib/server/db/migrations/0001_log_qa_usage.sql` (D1 table migration)
- Create: `tests/setup.ts` (Vitest test setup)
- Create: `tests/server/log-qa/validation.test.ts`
- Create: `tests/server/log-qa/prompt.test.ts`
- Create: `tests/server/log-qa/usage.test.ts`
- Create: `tests/routes/api/log-qa-ask.test.ts`
- Create: `tests/routes/log-qa-page.test.ts`
- Modify: `vite.config.ts` (Vitest config)
- Modify: `package.json` (test scripts + test deps)
- Modify: `.env.example` (Gemini env vars + size limit var)

### Task 1: Test Harness + Dependencies

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Create: `tests/setup.ts`

- [ ] **Step 1: Add failing test command first**

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 2: Run tests before installing deps**

Run: `pnpm test`  
Expected: FAIL with missing `vitest` command.

- [ ] **Step 3: Install minimal test dependencies**

```bash
pnpm add -D vitest @testing-library/svelte jsdom @vitest/coverage-v8
```

- [ ] **Step 4: Wire Vitest into Vite config**

```ts
// vite.config.ts
export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	test: {
		environment: 'jsdom',
		setupFiles: ['./tests/setup.ts'],
		include: ['tests/**/*.test.ts']
	}
});
```

- [ ] **Step 5: Add setup file**

```ts
// tests/setup.ts
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/svelte';

afterEach(() => cleanup());
```

- [ ] **Step 6: Run tests and verify harness works**

Run: `pnpm test`  
Expected: PASS with 0 tests found (or no failing harness errors).

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml vite.config.ts tests/setup.ts
git commit -m "chore: add vitest test harness"
```

### Task 2: D1 Usage Counter Schema

**Files:**
- Modify: `src/lib/server/db/schema.ts`
- Create: `src/lib/server/db/migrations/0001_log_qa_usage.sql`

- [ ] **Step 1: Write failing usage table test**

```ts
// tests/server/log-qa/usage.test.ts (initial)
import { describe, it, expect } from 'vitest';
import { logQaUsage } from '$lib/server/db/schema';

describe('logQaUsage schema', () => {
	it('exposes table metadata', () => {
		expect(logQaUsage).toBeDefined();
	});
});
```

- [ ] **Step 2: Run targeted test and verify fail**

Run: `pnpm test tests/server/log-qa/usage.test.ts`  
Expected: FAIL because `logQaUsage` export does not exist.

- [ ] **Step 3: Add table to Drizzle schema**

```ts
// src/lib/server/db/schema.ts
export const logQaUsage = sqliteTable(
	'log_qa_usage',
	{
		userId: text('user_id').notNull(),
		utcDay: text('utc_day').notNull(),
		questionCount: integer('question_count').notNull().default(0),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull()
	},
	(table) => [primaryKey({ columns: [table.userId, table.utcDay] })]
);
```

- [ ] **Step 4: Add SQL migration**

```sql
-- src/lib/server/db/migrations/0001_log_qa_usage.sql
CREATE TABLE IF NOT EXISTS log_qa_usage (
  user_id TEXT NOT NULL,
  utc_day TEXT NOT NULL,
  question_count INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, utc_day)
);
```

- [ ] **Step 5: Run targeted test and verify pass**

Run: `pnpm test tests/server/log-qa/usage.test.ts`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/server/db/schema.ts src/lib/server/db/migrations/0001_log_qa_usage.sql tests/server/log-qa/usage.test.ts
git commit -m "feat: add log qa usage counter schema"
```

### Task 3: Validation + Prompt Utilities (TDD)

**Files:**
- Create: `src/lib/server/log-qa/constants.ts`
- Create: `src/lib/server/log-qa/validation.ts`
- Create: `src/lib/server/log-qa/line-number.ts`
- Create: `src/lib/server/log-qa/prompt.ts`
- Create: `tests/server/log-qa/validation.test.ts`
- Create: `tests/server/log-qa/prompt.test.ts`

- [ ] **Step 1: Add failing validation tests**

```ts
// tests/server/log-qa/validation.test.ts
import { describe, expect, it } from 'vitest';
import { validateLogFileName, validateLogText, validateQuestion } from '$lib/server/log-qa/validation';

describe('validation', () => {
	it('accepts .txt and .log file names', () => {
		expect(() => validateLogFileName('chat.txt')).not.toThrow();
		expect(() => validateLogFileName('chat.log')).not.toThrow();
	});

	it('rejects unsupported extension', () => {
		expect(() => validateLogFileName('chat.csv')).toThrow(/Unsupported file type/);
	});

	it('rejects empty and oversized logs', () => {
		expect(() => validateLogText('')).toThrow(/empty/i);
		expect(() => validateLogText('x'.repeat(10_000_001))).toThrow(/too large/i);
	});

	it('rejects empty question', () => {
		expect(() => validateQuestion('   ')).toThrow(/Question is required/);
	});
});
```

- [ ] **Step 2: Add failing prompt test**

```ts
// tests/server/log-qa/prompt.test.ts
import { describe, expect, it } from 'vitest';
import { buildPromptPayload } from '$lib/server/log-qa/prompt';

describe('prompt payload', () => {
	it('includes question, line-numbered log, and evidence instruction', () => {
		const payload = buildPromptPayload({ question: 'Who spoke?', logText: 'A: hi\nB: hello' });
		expect(payload.user).toContain('Who spoke?');
		expect(payload.user).toContain('1| A: hi');
		expect(payload.user).toContain('2| B: hello');
		expect(payload.system).toContain('If the log does not support the answer');
		expect(payload.system).toContain('evidence');
	});
});
```

- [ ] **Step 3: Run tests to verify failures**

Run: `pnpm test tests/server/log-qa/validation.test.ts tests/server/log-qa/prompt.test.ts`  
Expected: FAIL due to missing modules.

- [ ] **Step 4: Implement minimal utilities**

```ts
// src/lib/server/log-qa/constants.ts
export const MAX_LOG_BYTES = Number(process.env.LOG_QA_MAX_BYTES ?? 2_000_000);
export const MAX_QUESTIONS_PER_UTC_DAY = 20;
export const SUPPORTED_EXTENSIONS = ['.txt', '.log'] as const;
```

```ts
// src/lib/server/log-qa/line-number.ts
export const withLineNumbers = (input: string) =>
	input
		.split('\n')
		.map((line, i) => `${i + 1}| ${line}`)
		.join('\n');
```

```ts
// src/lib/server/log-qa/validation.ts
import { MAX_LOG_BYTES, SUPPORTED_EXTENSIONS } from './constants';

export const validateLogFileName = (fileName: string) => {
	const lower = fileName.toLowerCase();
	if (!SUPPORTED_EXTENSIONS.some((ext) => lower.endsWith(ext))) throw new Error('Unsupported file type');
};

export const validateLogText = (logText: string) => {
	if (!logText.trim()) throw new Error('Uploaded log is empty');
	if (new TextEncoder().encode(logText).byteLength > MAX_LOG_BYTES) throw new Error('Uploaded log is too large');
};

export const validateQuestion = (question: string) => {
	if (!question.trim()) throw new Error('Question is required');
};
```

```ts
// src/lib/server/log-qa/prompt.ts
import { withLineNumbers } from './line-number';

export const buildPromptPayload = ({ question, logText }: { question: string; logText: string }) => ({
	system:
		'Answer using only the supplied Second Life log. If the log does not support the answer, say you cannot tell from the log. Return JSON with keys: answer (string) and evidence (array of short snippets or line references).',
	user: `Question:\n${question}\n\nSecond Life log:\n${withLineNumbers(logText)}`
});
```

- [ ] **Step 5: Run tests and verify pass**

Run: `pnpm test tests/server/log-qa/validation.test.ts tests/server/log-qa/prompt.test.ts`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/server/log-qa/constants.ts src/lib/server/log-qa/validation.ts src/lib/server/log-qa/line-number.ts src/lib/server/log-qa/prompt.ts tests/server/log-qa/validation.test.ts tests/server/log-qa/prompt.test.ts
git commit -m "feat: add log qa validation and prompt utilities"
```

### Task 4: Quota Service + Provider Adapter

**Files:**
- Create: `src/lib/server/log-qa/usage.ts`
- Create: `src/lib/server/log-qa/provider.ts`
- Modify: `tests/server/log-qa/usage.test.ts`

- [ ] **Step 1: Expand usage tests for daily quota**

```ts
// tests/server/log-qa/usage.test.ts
import { describe, expect, it } from 'vitest';
import { getUtcDay, assertWithinQuota } from '$lib/server/log-qa/usage';

describe('usage', () => {
	it('computes stable UTC day', () => {
		expect(getUtcDay(new Date('2026-05-28T23:59:59Z'))).toBe('2026-05-28');
	});

	it('blocks the 21st question', () => {
		expect(() => assertWithinQuota(20)).toThrow(/Daily limit reached/);
	});
});
```

- [ ] **Step 2: Run targeted test and verify fail**

Run: `pnpm test tests/server/log-qa/usage.test.ts`  
Expected: FAIL due to missing exports.

- [ ] **Step 3: Implement usage primitives and provider interface**

```ts
// src/lib/server/log-qa/usage.ts
import { MAX_QUESTIONS_PER_UTC_DAY } from './constants';

export const getUtcDay = (date = new Date()) => date.toISOString().slice(0, 10);

export const assertWithinQuota = (currentCount: number) => {
	if (currentCount >= MAX_QUESTIONS_PER_UTC_DAY) throw new Error('Daily limit reached (20 questions per UTC day)');
};
```

```ts
// src/lib/server/log-qa/provider.ts
export interface LogQaProvider {
	ask(input: { system: string; user: string }): Promise<{ answer: string; evidence: string[] }>;
}

export const createGeminiProvider = (): LogQaProvider => ({
	async ask() {
		throw new Error('Gemini provider not implemented');
	}
});
```

- [ ] **Step 4: Run test and verify pass**

Run: `pnpm test tests/server/log-qa/usage.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/server/log-qa/usage.ts src/lib/server/log-qa/provider.ts tests/server/log-qa/usage.test.ts
git commit -m "feat: add quota primitives and provider interface"
```

### Task 5: Ask Endpoint With Auth, Validation, Quota, and Provider Errors

**Files:**
- Create: `src/routes/api/log-qa/ask/+server.ts`
- Modify: `src/lib/server/log-qa/usage.ts`
- Modify: `src/lib/server/log-qa/provider.ts`
- Create: `tests/routes/api/log-qa-ask.test.ts`
- Modify: `.env.example`

- [ ] **Step 1: Write failing endpoint tests**

```ts
// tests/routes/api/log-qa-ask.test.ts
import { describe, expect, it } from 'vitest';
import { POST } from '$routes/api/log-qa/ask/+server';

describe('POST /api/log-qa/ask', () => {
	it('rejects unauthenticated requests', async () => {
		const res = await POST({ request: new Request('http://x', { method: 'POST', body: '{}' }), locals: {} } as any);
		expect(res.status).toBe(401);
	});

	it('returns 429 for quota overflow', async () => {
		// build event with mocked auth user + mocked usage count=20 and assert 429
	});

	it('returns safe 502 when provider fails', async () => {
		// mock provider throw, assert generic provider failure message
	});
});
```

- [ ] **Step 2: Run endpoint tests to verify fail**

Run: `pnpm test tests/routes/api/log-qa-ask.test.ts`  
Expected: FAIL due to missing endpoint/module behavior.

- [ ] **Step 3: Implement endpoint orchestration**

```ts
// src/routes/api/log-qa/ask/+server.ts (shape)
// 1) parse JSON body
// 2) require locals.user
// 3) validate fileName/logText/question
// 4) read daily count from D1, block if >=20
// 5) build prompt and call provider
// 6) increment count in D1
// 7) return { answer, evidence }
// 8) map known errors: 400/401/429/502, default 500
```

- [ ] **Step 4: Implement D1 usage read/increment helpers**

```ts
// src/lib/server/log-qa/usage.ts
// add:
// - getDailyCount(db, userId, utcDay): Promise<number>
// - incrementDailyCount(db, userId, utcDay): Promise<number>
```

- [ ] **Step 5: Implement Gemini provider with env-based API key**

```ts
// src/lib/server/log-qa/provider.ts
// add fetch call to Gemini 2.5 Flash-Lite endpoint, parse JSON response:
// { answer: string, evidence: string[] }
// throw sanitized Error('AI provider unavailable') on provider/network parse failure
```

- [ ] **Step 6: Add required env docs**

```env
# .env.example
GEMINI_API_KEY=""
LOG_QA_MAX_BYTES="2000000"
```

- [ ] **Step 7: Run endpoint tests and verify pass**

Run: `pnpm test tests/routes/api/log-qa-ask.test.ts`  
Expected: PASS for 401, 429, provider-safe-error cases.

- [ ] **Step 8: Commit**

```bash
git add src/routes/api/log-qa/ask/+server.ts src/lib/server/log-qa/usage.ts src/lib/server/log-qa/provider.ts tests/routes/api/log-qa-ask.test.ts .env.example
git commit -m "feat: add log qa ask endpoint with auth quota and provider handling"
```

### Task 6: Log Q&A Page UI + Session-Only State

**Files:**
- Create: `src/routes/log-qa/+page.svelte`
- Create: `tests/routes/log-qa-page.test.ts`

- [ ] **Step 1: Write failing page test for privacy copy + path hints**

```ts
// tests/routes/log-qa-page.test.ts
import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Page from '$routes/log-qa/+page.svelte';

describe('/log-qa page', () => {
	it('shows required privacy and provider copy', () => {
		render(Page);
		expect(screen.getByText(/used only for this active session/i)).toBeInTheDocument();
		expect(screen.getByText(/paid Gemini API tier/i)).toBeInTheDocument();
	});

	it('shows common second life log paths', () => {
		render(Page);
		expect(screen.getByText(/SecondLife\/logs/i)).toBeInTheDocument();
	});
});
```

- [ ] **Step 2: Run page test to verify fail**

Run: `pnpm test tests/routes/log-qa-page.test.ts`  
Expected: FAIL (page missing).

- [ ] **Step 3: Implement page with upload + ask flow**

```svelte
<!-- src/routes/log-qa/+page.svelte -->
<!-- include:
1) file input accept=".txt,.log"
2) drag/drop handlers
3) local state: fileName, logText, question, answers[]
4) POST to /api/log-qa/ask with {fileName, logText, question}
5) display answer + evidence list
6) prominent privacy copy and common SL path hints -->
```

- [ ] **Step 4: Run svelte-autofixer and resolve all issues**

Run: `svelte-autofixer src/routes/log-qa/+page.svelte`  
Expected: no issues/suggestions remaining.

- [ ] **Step 5: Run page test and verify pass**

Run: `pnpm test tests/routes/log-qa-page.test.ts`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/routes/log-qa/+page.svelte tests/routes/log-qa-page.test.ts
git commit -m "feat: add log qa page with upload and session history"
```

### Task 7: End-to-End Verification + Graph Update

**Files:**
- Modify: `README.md` (short feature + env section)

- [ ] **Step 1: Add README usage notes**

```md
## Log Q&A
- Route: `/log-qa`
- Raw log text is session-only and never stored by this app.
- Requires `GEMINI_API_KEY` and Better Auth login for AI questions.
```

- [ ] **Step 2: Run full test suite**

Run: `pnpm test`  
Expected: PASS.

- [ ] **Step 3: Run static checks**

Run: `pnpm check`  
Expected: PASS.

- [ ] **Step 4: Run lint**

Run: `pnpm lint`  
Expected: PASS.

- [ ] **Step 5: Update graph artifacts**

Run: `graphify update .`  
Expected: graph update completes successfully.

- [ ] **Step 6: Commit**

```bash
git add README.md graphify-out
git commit -m "docs: add log qa usage notes and refresh graphify output"
```

## Self-Review

- Spec coverage: upload UX, session-only raw logs, auth requirement, quota 20/day UTC, grounded prompt with evidence, provider-safe errors, and required privacy copy all map to Tasks 2-6.
- Placeholder scan: no TODO/TBD markers or “similar to previous task” shortcuts remain; each task includes explicit files, commands, and expected outcomes.
- Type consistency: shared names are consistent (`validateLogFileName`, `buildPromptPayload`, `assertWithinQuota`, `MAX_QUESTIONS_PER_UTC_DAY`, `/api/log-qa/ask`, `/log-qa`).

