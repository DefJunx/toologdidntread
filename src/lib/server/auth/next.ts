const FALLBACK = '/log-qa';

export const validateNextPath = (value: string | null | undefined): string => {
	if (!value) return FALLBACK;
	if (value.includes('\n') || value.includes('\r')) return FALLBACK;
	if (!value.startsWith('/')) return FALLBACK;
	if (value.startsWith('//')) return FALLBACK;

	try {
		const parsed = new URL(value, 'http://local');
		if (parsed.origin !== 'http://local') return FALLBACK;
		if (!parsed.pathname.startsWith('/')) return FALLBACK;
		return `${parsed.pathname}${parsed.search}`;
	} catch {
		return FALLBACK;
	}
};
