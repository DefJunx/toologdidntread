export interface LogQaProvider {
	ask(input: { system: string; user: string }): Promise<{ answer: string; evidence: string[] }>;
}

export const createGeminiProvider = (): LogQaProvider => ({
	async ask() {
		throw new Error('Gemini provider not implemented');
	}
});
