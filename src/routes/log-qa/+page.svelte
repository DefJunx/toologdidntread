<script lang="ts">
	type AnswerItem = { answer: string; evidence: string[]; question: string };

	let fileName = $state('');
	let logText = $state('');
	let question = $state('');
	let answers = $state<AnswerItem[]>([]);
	let loading = $state(false);
	let error = $state('');

	const handleFile = async (file: File | null) => {
		error = '';
		if (!file) return;
		fileName = file.name;
		logText = await file.text();
	};

	const onFileChange = async (event: Event) => {
		const input = event.currentTarget as HTMLInputElement;
		await handleFile(input.files?.[0] ?? null);
	};

	const onDrop = async (event: DragEvent) => {
		event.preventDefault();
		await handleFile(event.dataTransfer?.files?.[0] ?? null);
	};

	const ask = async () => {
		error = '';
		if (!fileName || !logText) {
			error = 'Upload a .txt or .log file first.';
			return;
		}

		loading = true;
		try {
			const response = await fetch('/api/log-qa/ask', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ fileName, logText, question })
			});
			const payload = await response.json();
			if (!response.ok) throw new Error(payload.error ?? 'Request failed');
			answers = [{ question, answer: payload.answer, evidence: payload.evidence ?? [] }, ...answers];
			question = '';
		} catch (cause) {
			error = cause instanceof Error ? cause.message : 'Request failed';
		} finally {
			loading = false;
		}
	};
</script>

<svelte:head>
	<title>Log Q&A</title>
</svelte:head>

<section class="mx-auto max-w-3xl space-y-6 p-6">
	<h1 class="text-2xl font-semibold">Second Life Log Q&amp;A</h1>
	<p class="text-sm text-gray-700">Your uploaded log is used only for this active session and is never stored by this app.</p>
	<p class="text-sm text-gray-700">Answers are generated via a paid Gemini API tier and may include mistakes.</p>
	<p class="text-sm text-gray-600">Common path hint: <code>SecondLife/logs</code></p>

	<div
		class="rounded border border-dashed border-gray-400 p-4"
		role="region"
		aria-label="Log upload dropzone"
		ondragover={(e) => e.preventDefault()}
		ondrop={onDrop}
	>
		<label class="block text-sm font-medium" for="log-file">Upload Second Life log (.txt or .log)</label>
		<input id="log-file" type="file" accept=".txt,.log" onchange={onFileChange} class="mt-2" />
		{#if fileName}
			<p class="mt-2 text-sm">Loaded: {fileName}</p>
		{/if}
	</div>

	<div class="space-y-2">
		<label class="block text-sm font-medium" for="question">Question</label>
		<textarea id="question" bind:value={question} rows="3" class="w-full rounded border p-2"></textarea>
		<button type="button" class="rounded bg-black px-4 py-2 text-white disabled:opacity-50" onclick={ask} disabled={loading}>
			{loading ? 'Asking...' : 'Ask'}
		</button>
	</div>

	{#if error}
		<p class="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p>
	{/if}

	{#if answers.length > 0}
		<ul class="space-y-4">
			{#each answers as item}
				<li class="rounded border p-4">
					<p class="text-sm font-medium">Q: {item.question}</p>
					<p class="mt-2">{item.answer}</p>
					{#if item.evidence.length > 0}
						<ul class="mt-2 list-disc pl-5 text-sm text-gray-700">
							{#each item.evidence as evidence}
								<li>{evidence}</li>
							{/each}
						</ul>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</section>
