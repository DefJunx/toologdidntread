import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Page from '../../src/routes/log-qa/+page.svelte';

describe('/log-qa page', () => {
	it('shows required privacy and provider copy', () => {
		render(Page);
		expect(screen.getByText(/used only for this active session/i)).toBeInTheDocument();
		expect(screen.getByText(/paid Gemini API tier/i)).toBeInTheDocument();
	});

	it('shows common second life log paths', () => {
		render(Page);
		expect(screen.getByText(/SecondLife\/logs/i)).toBeInTheDocument();
	});
});
