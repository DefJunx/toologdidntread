import { json, type RequestEvent } from '@sveltejs/kit';
import { buildPromptPayload } from '$lib/server/log-qa/prompt';
import { createGeminiProvider } from '$lib/server/log-qa/provider';
import {
	assertWithinQuota,
	getDailyCount,
	getUtcDay,
	incrementDailyCount
} from '$lib/server/log-qa/usage';
import {
	validateLogFileName,
	validateLogText,
	validateQuestion
} from '$lib/server/log-qa/validation';

export const POST = async (event: RequestEvent) => {
	try {
		const { request, locals, platform } = event;
		if (!locals?.user?.id) return json({ error: 'Unauthorized' }, { status: 401 });
		if (!platform?.env?.DB) throw new Error('Server misconfiguration');

		const body = await request.json();
		const fileName = String(body?.fileName ?? '');
		const logText = String(body?.logText ?? '');
		const question = String(body?.question ?? '');

		validateLogFileName(fileName);
		validateLogText(logText);
		validateQuestion(question);

		const utcDay = getUtcDay();
		const currentCount = await getDailyCount(platform.env.DB, locals.user.id, utcDay);
		assertWithinQuota(currentCount);

		const prompt = buildPromptPayload({ question, logText });
		const provider = createGeminiProvider();
		const result = await provider.ask(prompt);
		await incrementDailyCount(platform.env.DB, locals.user.id, utcDay);

		return json(result);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		if (/Unsupported file type|empty|too large|Question is required/.test(message)) {
			return json({ error: message }, { status: 400 });
		}
		if (/Daily limit reached/.test(message)) {
			return json({ error: message }, { status: 429 });
		}
		if (/AI provider unavailable/.test(message)) {
			return json({ error: 'AI provider unavailable' }, { status: 502 });
		}
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
