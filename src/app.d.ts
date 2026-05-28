import type { User, Session } from 'better-auth/minimal';
import { createAuth } from '$lib/server/auth';
import type { AnyD1Database } from 'drizzle-orm/d1';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user?: User;
			session?: Session;
			auth: ReturnType<typeof createAuth>;
		}

		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				DB: AnyD1Database;
			};
		}
	}
}

export {};
