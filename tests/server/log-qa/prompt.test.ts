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
