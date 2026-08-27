import { readFile } from 'node:fs/promises';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Fixture from '../fixtures/reveal.svelte';

const revealSourceUrl = new URL('../../src/lib/components/ui/Reveal.svelte', import.meta.url);
const tokenCssUrl = new URL('../../src/lib/styles/tokens.css', import.meta.url);
const appShellUrl = new URL('../../src/app.html', import.meta.url);

describe('Reveal', () => {
	it('server-renders its wrapper and supplied content without a visible state class', () => {
		const { body } = render(Fixture);

		expect(body).toMatch(/<div[^>]*class="reveal[^"]*"/);
		expect(body).toContain('Reveal fixture content');
		expect(body).not.toContain('is-visible');
	});

	it('keeps the delivered shell visible until its parser-executed script enables JavaScript styles', async () => {
		const appShell = await readFile(appShellUrl, 'utf8');

		expect(appShell).toContain('<html lang="en" class="no-js">');
		expect(appShell).toContain("document.documentElement.classList.replace('no-js', 'js');");
	});

	it('uses Reveal component aliases with MASTER.md motion provenance', async () => {
		const [revealSource, tokenCss] = await Promise.all([
			readFile(revealSourceUrl, 'utf8'),
			readFile(tokenCssUrl, 'utf8')
		]);

		expect(revealSource).toContain('var(--ds-reveal-transition-duration)');
		expect(revealSource).toContain('var(--ds-reveal-transition-easing)');
		expect(revealSource).toContain('var(--ds-reveal-rise-distance)');
		expect(revealSource).toContain('var(--ds-reveal-default-delay)');
		expect(revealSource).toContain('var(--ds-reveal-stagger-step)');
		expect(tokenCss).toContain('--ds-reveal-transition-duration: var(--ds-duration-base);');
		expect(tokenCss).toContain('--ds-reveal-transition-easing: var(--ds-ease);');
		expect(tokenCss).toContain('--ds-reveal-rise-distance: 12px;');

		const stagger = tokenCss.match(/--ds-reveal-stagger-step:\s*([\d.]+)ms;/);
		expect(stagger?.[1]).toBeDefined();
		expect(Number(stagger?.[1])).toBeLessThanOrEqual(60);
	});
});
