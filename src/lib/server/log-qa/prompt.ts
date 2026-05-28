import { withLineNumbers } from './line-number';

export const buildPromptPayload = ({ question, logText }: { question: string; logText: string }) => ({
	system:
		'Answer using only the supplied Second Life log. If the log does not support the answer, say you cannot tell from the log. Return JSON with keys: answer (string) and evidence (array of short snippets or line references).',
	user: `Question:\n${question}\n\nSecond Life log:\n${withLineNumbers(logText)}`
});
