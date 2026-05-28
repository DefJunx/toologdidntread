import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const task = sqliteTable('task', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export const logQaUsage = sqliteTable(
	'log_qa_usage',
	{
		userId: text('user_id').notNull(),
		utcDay: text('utc_day').notNull(),
		questionCount: integer('question_count').notNull().default(0),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull()
	},
	(table) => [primaryKey({ columns: [table.userId, table.utcDay] })]
);

export const inviteCodes = sqliteTable('invite_codes', {
	id: text('id').primaryKey(),
	codeHash: text('code_hash').notNull().unique(),
	createdBy: text('created_by'),
	expiresAt: integer('expires_at', { mode: 'timestamp_ms' }),
	maxUses: integer('max_uses').notNull().default(1),
	usedCount: integer('used_count').notNull().default(0),
	disabled: integer('disabled', { mode: 'boolean' }).notNull().default(false),
	createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull()
});

export * from './auth.schema';
