import { MAX_LOG_BYTES, SUPPORTED_EXTENSIONS } from './constants';

export const validateLogFileName = (fileName: string) => {
	const lower = fileName.toLowerCase();
	if (!SUPPORTED_EXTENSIONS.some((ext) => lower.endsWith(ext))) throw new Error('Unsupported file type');
};

export const validateLogText = (logText: string) => {
	if (!logText.trim()) throw new Error('Uploaded log is empty');
	if (new TextEncoder().encode(logText).byteLength > MAX_LOG_BYTES) throw new Error('Uploaded log is too large');
};

export const validateQuestion = (question: string) => {
	if (!question.trim()) throw new Error('Question is required');
};
