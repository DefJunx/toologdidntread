import { describe, expect, it } from 'vitest';
import {
	hashInviteCode,
	isInviteUsable,
	mapInviteError,
	normalizeInviteCode
} from '../../../src/lib/server/auth/invite-code';

describe('invite-code helpers', () => {
	it('normalizes invite codes', () => {
		expect(normalizeInviteCode('  aBc-123  ')).toBe('ABC-123');
	});

	it('hashes normalized values consistently', () => {
		expect(hashInviteCode('abc')).toBe(hashInviteCode(' ABC '));
	});

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

	it('rejects expired invites', () => {
		expect(
			isInviteUsable({
				disabled: false,
				expiresAt: 10,
				maxUses: 1,
				usedCount: 0,
				nowMs: 11
			})
		).toEqual({ ok: false, reason: 'expired' });
	});

	it('rejects used-up invites', () => {
		expect(
			isInviteUsable({
				disabled: false,
				expiresAt: null,
				maxUses: 1,
				usedCount: 1,
				nowMs: Date.now()
			})
		).toEqual({ ok: false, reason: 'used_up' });
	});

	it('maps invite errors for UI', () => {
		expect(mapInviteError('used_up')).toBe('Invite fully used');
	});
});
