import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	getDailyCount: vi.fn(),
	assertWithinQuota: vi.fn(),
	incrementDailyCount: vi.fn(),
	createGeminiProvider: vi.fn()
}));

vi.mock('$lib/server/log-qa/usage', async () => {
	const actual = await vi.importActual<typeof import('$lib/server/log-qa/usage')>(
		'$lib/server/log-qa/usage'
	);
	return {
		...actual,
		getDailyCount: mocks.getDailyCount,
		assertWithinQuota: mocks.assertWithinQuota,
		incrementDailyCount: mocks.incrementDailyCount
	};
});

vi.mock('$lib/server/log-qa/provider', () => ({
	createGeminiProvider: mocks.createGeminiProvider
}));

import { POST } from '../../../src/routes/api/log-qa/ask/+server';
type AskEvent = Parameters<typeof POST>[0];

describe('POST /api/log-qa/ask', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getDailyCount.mockResolvedValue(0);
		mocks.assertWithinQuota.mockImplementation(() => undefined);
		mocks.incrementDailyCount.mockResolvedValue(1);
		mocks.createGeminiProvider.mockReturnValue({
			ask: vi.fn().mockResolvedValue({ answer: 'ok', evidence: [] })
		});
	});

	it('rejects unauthenticated requests', async () => {
		const res = await POST({
			request: new Request('http://x', { method: 'POST', body: '{}' }),
			locals: {}
		} as unknown as AskEvent);
		expect(res.status).toBe(401);
	});

	it('returns 429 for quota overflow', async () => {
		mocks.getDailyCount.mockResolvedValue(20);
		mocks.assertWithinQuota.mockImplementation(() => {
			throw new Error('Daily limit reached (20 questions per UTC day)');
		});

		const res = await POST({
			request: new Request('http://x', {
				method: 'POST',
				body: JSON.stringify({ fileName: 'chat.log', logText: 'A: hi', question: 'Who spoke?' })
			}),
			locals: { user: { id: 'u1' } },
			platform: { env: { DB: {} } }
		} as unknown as AskEvent);

		expect(res.status).toBe(429);
	});

	it('returns safe 502 when provider fails', async () => {
		mocks.createGeminiProvider.mockReturnValue({
			ask: vi.fn().mockRejectedValue(new Error('AI provider unavailable'))
		});

		const res = await POST({
			request: new Request('http://x', {
				method: 'POST',
				body: JSON.stringify({ fileName: 'chat.log', logText: 'A: hi', question: 'Who spoke?' })
			}),
			locals: { user: { id: 'u1' } },
			platform: { env: { DB: {} } }
		} as unknown as AskEvent);

		expect(res.status).toBe(502);
		expect(await res.json()).toEqual({ error: 'AI provider unavailable' });
	});
});
