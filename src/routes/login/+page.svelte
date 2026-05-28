<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<section class="mx-auto max-w-md space-y-4 p-6">
	<h1 class="text-2xl font-semibold">Login</h1>
	<form method="POST" class="space-y-3">
		<label class="block text-sm font-medium" for="email">Email</label>
		<input id="email" name="email" type="email" required class="w-full rounded border p-2" />

		<label class="block text-sm font-medium" for="password">Password</label>
		<input
			id="password"
			name="password"
			type="password"
			required
			class="w-full rounded border p-2"
		/>

		<button type="submit" class="rounded bg-black px-4 py-2 text-white">Sign in</button>
	</form>
	<p class="text-sm text-gray-700">
		Need access? Register with an invite code at
		<a class="underline" href={resolve('/register')}>/register</a>.
	</p>
</section>
