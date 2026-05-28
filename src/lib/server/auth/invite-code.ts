import { createHash, timingSafeEqual } from 'node:crypto';

export type InviteRejectReason = 'invalid' | 'disabled' | 'expired' | 'used_up';

export const normalizeInviteCode = (value: string): string => value.trim().toUpperCase();

export const hashInviteCode = (value: string): string =>
	createHash('sha256').update(normalizeInviteCode(value)).digest('hex');

export const hashesEqual = (leftHex: string, rightHex: string): boolean => {
	const left = Buffer.from(leftHex, 'hex');
	const right = Buffer.from(rightHex, 'hex');
	if (left.length !== right.length) return false;
	return timingSafeEqual(left, right);
};

export const isInviteUsable = (input: {
	disabled: boolean;
	expiresAt: number | null;
	maxUses: number;
	usedCount: number;
	nowMs?: number;
}): { ok: true } | { ok: false; reason: Exclude<InviteRejectReason, 'invalid'> } => {
	const nowMs = input.nowMs ?? Date.now();
	if (input.disabled) return { ok: false, reason: 'disabled' };
	if (input.expiresAt !== null && input.expiresAt <= nowMs) return { ok: false, reason: 'expired' };
	if (input.usedCount >= input.maxUses) return { ok: false, reason: 'used_up' };
	return { ok: true };
};

export const mapInviteError = (reason: InviteRejectReason): string => {
	switch (reason) {
		case 'disabled':
			return 'Invite disabled';
		case 'expired':
			return 'Invite expired';
		case 'used_up':
			return 'Invite fully used';
		case 'invalid':
		default:
			return 'Invalid invite code';
	}
};
