import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { byLayer, isColor, parseTokens } from '../../src/lib/styles/tokens';

const tokens = parseTokens(
	await readFile(new URL('../../src/lib/styles/tokens.css', import.meta.url), 'utf8')
);

test.beforeEach(async ({ page }) => {
	await page.goto('/styleguide');
});

test('the reference renders every token the stylesheet declares', async ({ page }) => {
	// The point of reading tokens.css at build time: a token cannot exist without appearing here.
	await expect(page.locator('#index tbody tr')).toHaveCount(tokens.length);

	for (const layer of ['primitive', 'semantic', 'component'] as const) {
		const summary = page.locator('#index summary', { hasText: layer });
		await expect(summary).toHaveText(`${layer} — ${byLayer(tokens, layer).length} tokens`);
	}

	// One swatch per semantic colour, in each of the two theme panels.
	const swatchCount = byLayer(tokens, 'semantic').filter(isColor).length;
	expect(swatchCount).toBeGreaterThan(0);
	await expect(page.locator('.swatch')).toHaveCount(swatchCount * 2);
});

test('both theme panels resolve their own semantic colours', async ({ page }) => {
	const panels = page.locator('.theme-panel');
	await expect(panels).toHaveCount(2);

	const [dark, light] = [panels.nth(0), panels.nth(1)];
	const colorOf = (locator: typeof dark) =>
		locator.evaluate((element) => getComputedStyle(element).color);

	// The light panel must re-resolve --ds-fg rather than inherit the dark theme's computed value.
	expect(await colorOf(dark)).not.toBe(await colorOf(light));
	await expect(light).toHaveAttribute('data-theme', 'light');
});

test('every primitive is rendered, and the page carries exactly one h1', async ({ page }) => {
	await expect(page.locator('h1')).toHaveCount(1);

	for (const heading of [
		'ActionLink',
		'Pill and Metric',
		'ContentCard and ColumnList',
		'Accordion',
		'Logo, LogoGrid and LogoTile',
		'Reveal'
	]) {
		await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
	}

	// Rendered components, not just headings: a masked mark, a native disclosure, a counted metric.
	await expect(page.locator('#components .mask-mark').first()).toBeVisible();
	await expect(page.locator('#components details')).toHaveCount(2);
	await expect(page.getByRole('link', { name: 'External, gets rel=noopener' })).toHaveAttribute(
		'rel',
		'noopener'
	);
});

test('the style guide is kept out of search in every environment', async () => {
	// A page-level robots meta would break the production assertion in verify-robots.mjs, so the
	// rule lives in _headers instead. Assert the built file, which is what Cloudflare reads.
	const headers = await readFile(new URL('../../build/_headers', import.meta.url), 'utf8');
	const lines = headers.split('\n');
	const rule = lines.indexOf('/styleguide*');

	expect(rule).toBeGreaterThan(-1);
	expect(lines[rule + 1]).toBe('  X-Robots-Tag: noindex');
});
