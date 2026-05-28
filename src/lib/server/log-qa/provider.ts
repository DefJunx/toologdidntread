export interface LogQaProvider {
	ask(input: { system: string; user: string }): Promise<{ answer: string; evidence: string[] }>;
}

const parseJsonPayload = (text: string): { answer: string; evidence: string[] } => {
	const trimmed = text.trim();
	const cleaned = trimmed
		.replace(/^```json\s*/i, '')
		.replace(/```$/i, '')
		.trim();
	const parsed = JSON.parse(cleaned) as { answer?: unknown; evidence?: unknown };
	if (typeof parsed.answer !== 'string') throw new Error('Invalid provider response');
	const evidence = Array.isArray(parsed.evidence)
		? parsed.evidence.filter((item): item is string => typeof item === 'string')
		: [];
	return { answer: parsed.answer, evidence };
};

export const createGeminiProvider = (): LogQaProvider => ({
	async ask({ system, user }) {
		const apiKey = process.env.GEMINI_API_KEY;
		if (!apiKey) throw new Error('AI provider unavailable');

		try {
			const response = await fetch(
				`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
				{
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({
						systemInstruction: { parts: [{ text: system }] },
						contents: [{ role: 'user', parts: [{ text: user }] }],
						generationConfig: { responseMimeType: 'application/json' }
					})
				}
			);
			if (!response.ok) throw new Error('Provider request failed');
			const json = (await response.json()) as {
				candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
			};
			const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
			if (!text) throw new Error('Provider response missing text');
			return parseJsonPayload(text);
		} catch {
			throw new Error('AI provider unavailable');
		}
	}
});
