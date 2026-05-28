<svelte:head>
	<title>Register</title>
</svelte:head>

<section class="mx-auto max-w-md space-y-4 p-6">
	<h1 class="text-2xl font-semibold">Register</h1>
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

		<label class="block text-sm font-medium" for="inviteCode">Invite code</label>
		<input
			id="inviteCode"
			name="inviteCode"
			type="text"
			required
			class="w-full rounded border p-2"
		/>

		<button type="submit" class="rounded bg-black px-4 py-2 text-white">Create account</button>
	</form>
</section>
