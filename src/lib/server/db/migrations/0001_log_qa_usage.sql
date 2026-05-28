CREATE TABLE IF NOT EXISTS log_qa_usage (
  user_id TEXT NOT NULL,
  utc_day TEXT NOT NULL,
  question_count INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, utc_day)
);
