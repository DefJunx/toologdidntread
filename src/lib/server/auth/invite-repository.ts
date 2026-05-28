import { and, eq, isNull, or, sql } from 'drizzle-orm';
import { inviteCodes } from '$lib/server/db/schema';
import { getDb } from '$lib/server/db';
import type { AnyD1Database } from 'drizzle-orm/d1';
import { hashInviteCode, isInviteUsable } from '$lib/server/auth/invite-code';

export type ConsumeInviteResult =
	| { ok: true }
	| { ok: false; reason: 'invalid' | 'disabled' | 'expired' | 'used_up' };

export const consumeInviteCode = async (
	d1: AnyD1Database,
	rawCode: string,
	nowMs = Date.now()
): Promise<ConsumeInviteResult> => {
	const db = getDb(d1);
	const codeHash = hashInviteCode(rawCode);
	const row = await db.query.inviteCodes.findFirst({ where: eq(inviteCodes.codeHash, codeHash) });
	if (!row) return { ok: false, reason: 'invalid' };

	const status = isInviteUsable({
		disabled: row.disabled,
		expiresAt: row.expiresAt ? row.expiresAt.getTime() : null,
		maxUses: row.maxUses,
		usedCount: row.usedCount,
		nowMs
	});
	if (!status.ok) return status;

	const result = await db
		.update(inviteCodes)
		.set({ usedCount: sql`${inviteCodes.usedCount} + 1`, updatedAt: new Date(nowMs) })
		.where(
			and(
				eq(inviteCodes.id, row.id),
				eq(inviteCodes.disabled, false),
				or(isNull(inviteCodes.expiresAt), sql`${inviteCodes.expiresAt} > ${nowMs}`),
				sql`${inviteCodes.usedCount} < ${inviteCodes.maxUses}`
			)
		)
		.run();

	if (!result.success || result.meta.changes < 1) return { ok: false, reason: 'used_up' };
	return { ok: true };
};
