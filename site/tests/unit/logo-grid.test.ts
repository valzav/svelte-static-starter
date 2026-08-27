import { readFile } from 'node:fs/promises';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import LogoTile from '../../src/lib/components/ui/LogoTile.svelte';
import Fixture from '../fixtures/logo-grid.svelte';

describe('LogoGrid', () => {
	it('server-renders ordered image and text tiles with complete accessible names', () => {
		const { body } = render(Fixture);

		expect(body).toMatch(/<ul[^>]*>/);
		expect(body).toMatch(/<li[^>]*aria-label="9 — Test mark"/);
		const imageCountStart = body.indexOf('class="count');

		expect(imageCountStart).toBeGreaterThan(-1);
		expect(body.slice(imageCountStart)).toContain('9 —');
		expect(body).toContain('logo-tile');
		expect(body).toMatch(/<li[^>]*aria-label="Text fallback"/);
		expect(body).not.toContain('undefined —');
		expect(body).toContain(
			'A deliberately long text-only company name that must wrap inside its tile'
		);
	});

	it('accepts readonly entry collections without copying or casting them', async () => {
		const source = await readFile(
			new URL('../../src/lib/components/ui/LogoGrid.svelte', import.meta.url),
			'utf8'
		);
		const fixture = await readFile(
			new URL('../fixtures/logo-grid.svelte', import.meta.url),
			'utf8'
		);

		expect(source).toContain('entries: readonly LogoEntry[]');
		expect(fixture).toContain('] as const;');
	});

	it('keeps count prefixes visible when supplied and absent when omitted', () => {
		const counted = render(LogoTile, {
			props: { entry: { name: 'Counted fallback', count: 2, status: 'approved' } }
		}).body;
		const uncounted = render(LogoTile, {
			props: { entry: { name: 'Uncounted', status: 'approved' } }
		}).body;
		const textCountStart = counted.indexOf('class="text-content');

		expect(counted).toMatch(/<li[^>]*aria-label="2 — Counted fallback"/);
		expect(textCountStart).toBeGreaterThan(-1);
		expect(counted.slice(textCountStart)).toContain('2 —');
		expect(uncounted).toMatch(/<li[^>]*aria-label="Uncounted"/);
		expect(uncounted).not.toContain(' —');
	});

	it('uses tokenized monochrome and wrapping styles without raw component colors', async () => {
		const source = await readFile(
			new URL('../../src/lib/components/ui/LogoTile.svelte', import.meta.url),
			'utf8'
		);

		expect(source).toContain('background-color: var(--ds-logo-tint);');
		expect(source).toContain('overflow-wrap: anywhere;');
		expect(source).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(/i);
	});
});
