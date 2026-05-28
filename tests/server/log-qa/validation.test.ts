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
