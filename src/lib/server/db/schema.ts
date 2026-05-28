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

export * from './auth.schema';
