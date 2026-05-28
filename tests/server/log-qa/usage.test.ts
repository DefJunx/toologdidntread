import { describe, expect, it } from 'vitest';
import { logQaUsage } from '$lib/server/db/schema';

describe('logQaUsage schema', () => {
	it('exposes table metadata', () => {
		expect(logQaUsage).toBeDefined();
	});
});
