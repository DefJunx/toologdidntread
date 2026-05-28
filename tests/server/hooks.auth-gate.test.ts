import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	getSession: vi.fn(),
	svelteKitHandler: vi.fn()
}));

vi.mock('$lib/server/auth', () => ({
	createAuth: () => ({
		api: {
			getSession: mocks.getSession
		}
	})
}));

vi.mock('better-auth/svelte-kit', () => ({
	svelteKitHandler: mocks.svelteKitHandler
}));

import { handle } from '../../src/hooks.server';

describe('hooks auth gate for /log-qa', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.svelteKitHandler.mockResolvedValue(new Response('ok', { status: 200 }));
	});

	it('redirects unauthenticated /log-qa requests to login with next', async () => {
		mocks.getSession.mockResolvedValue(null);
		const response = await handle({
			event: {
				url: new URL('http://localhost/log-qa'),
				request: new Request('http://localhost/log-qa'),
				platform: { env: { DB: {} } },
				locals: {}
			},
			resolve: vi.fn()
		} as never);

		expect(response.status).toBe(303);
		expect(response.headers.get('location')).toContain('/login?next=%2Flog-qa');
		expect(mocks.svelteKitHandler).not.toHaveBeenCalled();
	});

	it('allows authenticated /log-qa requests through', async () => {
		mocks.getSession.mockResolvedValue({ session: { id: 's1' }, user: { id: 'u1' } });
		const response = await handle({
			event: {
				url: new URL('http://localhost/log-qa'),
				request: new Request('http://localhost/log-qa'),
				platform: { env: { DB: {} } },
				locals: {}
			},
			resolve: vi.fn()
		} as never);

		expect(response.status).toBe(200);
		expect(mocks.svelteKitHandler).toHaveBeenCalledOnce();
	});
});
