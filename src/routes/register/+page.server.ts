import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { validateNextPath } from '$lib/server/auth/next';
import { consumeInviteCode } from '$lib/server/auth/invite-repository';
import { mapInviteError } from '$lib/server/auth/invite-code';

export const actions: Actions = {
	default: async (event) => {
		if (!event.platform?.env?.DB) return fail(500, { error: 'Server misconfiguration' });

		const data = await event.request.formData();
		const email = String(data.get('email') ?? '').trim();
		const password = String(data.get('password') ?? '');
		const inviteCode = String(data.get('inviteCode') ?? '');
		const next = validateNextPath(event.url.searchParams.get('next'));

		const consume = await consumeInviteCode(event.platform.env.DB, inviteCode);
		if (!consume.ok) return fail(400, { error: mapInviteError(consume.reason) });

		try {
			await event.locals.auth.api.signUpEmail({
				body: { email, password, name: email },
				headers: event.request.headers
			});
		} catch {
			return fail(400, { error: 'Registration failed' });
		}

		throw redirect(303, next);
	}
};
