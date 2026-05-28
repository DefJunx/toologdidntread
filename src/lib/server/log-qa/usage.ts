import { MAX_QUESTIONS_PER_UTC_DAY } from './constants';

export const getUtcDay = (date = new Date()) => date.toISOString().slice(0, 10);

export const assertWithinQuota = (currentCount: number) => {
	if (currentCount >= MAX_QUESTIONS_PER_UTC_DAY) throw new Error('Daily limit reached (20 questions per UTC day)');
};
