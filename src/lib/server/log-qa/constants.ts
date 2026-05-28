export const MAX_LOG_BYTES = Number(process.env.LOG_QA_MAX_BYTES ?? 2_000_000);
export const MAX_QUESTIONS_PER_UTC_DAY = 20;
export const SUPPORTED_EXTENSIONS = ['.txt', '.log'] as const;
