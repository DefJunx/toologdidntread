import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { validateNextPath } from '$lib/server/auth/next';

export const actions: Actions = {
	default: async (event) => {
		const data = await event.request.formData();
		const email = String(data.get('email') ?? '').trim();
		const password = String(data.get('password') ?? '');
		const next = validateNextPath(event.url.searchParams.get('next'));

		try {
			await event.locals.auth.api.signInEmail({
				body: { email, password },
				headers: event.request.headers
			});
		} catch {
			return fail(400, { error: 'Invalid credentials' });
		}

		throw redirect(303, next);
	}
};
