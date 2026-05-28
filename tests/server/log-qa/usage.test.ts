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
