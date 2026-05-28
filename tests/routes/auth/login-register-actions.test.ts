import { describe, expect, it } from 'vitest';
import { validateNextPath } from '../../../src/lib/server/auth/next';

describe('validateNextPath', () => {
	it('accepts local absolute path', () => {
		expect(validateNextPath('/log-qa')).toBe('/log-qa');
	});

	it('keeps query string', () => {
		expect(validateNextPath('/log-qa?tab=1')).toBe('/log-qa?tab=1');
	});

	it('rejects absolute external url', () => {
		expect(validateNextPath('https://evil.test')).toBe('/log-qa');
	});

	it('rejects protocol-relative next', () => {
		expect(validateNextPath('//evil.test/path')).toBe('/log-qa');
	});

	it('rejects non-path next', () => {
		expect(validateNextPath('log-qa')).toBe('/log-qa');
	});
});
