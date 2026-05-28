import { and, eq, sql } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import type { AnyD1Database } from 'drizzle-orm/d1';
import { logQaUsage } from '$lib/server/db/schema';
import { MAX_QUESTIONS_PER_UTC_DAY } from './constants';

export const getUtcDay = (date = new Date()) => date.toISOString().slice(0, 10);

export const assertWithinQuota = (currentCount: number) => {
	if (currentCount >= MAX_QUESTIONS_PER_UTC_DAY)
		throw new Error('Daily limit reached (20 questions per UTC day)');
};

export const getDailyCount = async (
	d1: AnyD1Database,
	userId: string,
	utcDay: string
): Promise<number> => {
	const db = getDb(d1);
	const rows = await db
		.select({ questionCount: logQaUsage.questionCount })
		.from(logQaUsage)
		.where(and(eq(logQaUsage.userId, userId), eq(logQaUsage.utcDay, utcDay)))
		.limit(1);
	return rows[0]?.questionCount ?? 0;
};

export const incrementDailyCount = async (
	d1: AnyD1Database,
	userId: string,
	utcDay: string
): Promise<number> => {
	const db = getDb(d1);
	await db
		.insert(logQaUsage)
		.values({ userId, utcDay, questionCount: 1, updatedAt: new Date() })
		.onConflictDoUpdate({
			target: [logQaUsage.userId, logQaUsage.utcDay],
			set: { questionCount: sql`${logQaUsage.questionCount} + 1`, updatedAt: new Date() }
		});
	return getDailyCount(d1, userId, utcDay);
};
