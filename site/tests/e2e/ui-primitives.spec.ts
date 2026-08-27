import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { compile } from 'svelte/compiler';

const actionLinkSource = await readFile(
	new URL('../../src/lib/components/ui/ActionLink.svelte', import.meta.url),
	'utf8'
);
const [contentCardSource, columnListSource, pillSource, sectionSource, tokenCss] =
	await Promise.all([
		readFile(new URL('../../src/lib/components/ui/ContentCard.svelte', import.meta.url), 'utf8'),
		readFile(new URL('../../src/lib/components/ui/ColumnList.svelte', import.meta.url), 'utf8'),
		readFile(new URL('../../src/lib/components/ui/Pill.svelte', import.meta.url), 'utf8'),
		readFile(new URL('../../src/lib/components/ui/Section.svelte', import.meta.url), 'utf8'),
		readFile(new URL('../../src/lib/styles/tokens.css', import.meta.url), 'utf8')
	]);

function compiledCss(source: string, filename: string) {
	return compile(source, { filename, generate: 'client' }).css!.code;
}

function scopeClass(css: string) {
	const scopeClassMatch = css.match(/\.svelte-[\w-]+/);

	if (!scopeClassMatch) {
		throw new Error('Component CSS must retain its Svelte scope class.');
	}

	return scopeClassMatch[0].slice(1);
}

const actionLinkCss = compiledCss(actionLinkSource, 'ActionLink.svelte');
const contentCardCss = compiledCss(contentCardSource, 'ContentCard.svelte');
const columnListCss = compiledCss(columnListSource, 'ColumnList.svelte');
const pillCss = compiledCss(pillSource, 'Pill.svelte');
const sectionCss = compiledCss(sectionSource, 'Section.svelte');
const actionLinkScopeClass = scopeClass(actionLinkCss);
const contentCardScopeClass = scopeClass(contentCardCss);
const columnListScopeClass = scopeClass(columnListCss);
const pillScopeClass = scopeClass(pillCss);
const sectionScopeClass = scopeClass(sectionCss);

test('ActionLink uses the component default height and minimum tap target', async ({ page }) => {
	await page.setContent(`
		<style>
			:root {
				--ds-interactive-min-target: 44px;
				--ds-action-link-height: 48px;
				--ds-action-link-border-width: 1px;
				--ds-action-link-radius: 8px;
				--ds-action-link-font-size: 15px;
				--ds-action-link-leading: 1.45;
				--ds-action-link-min-target: var(--ds-interactive-min-target);
				--ds-action-link-padding-block: 12px;
				--ds-action-link-padding-inline: 24px;
				--ds-action-link-transition-duration: 150ms;
				--ds-action-link-transition-easing: ease;
				--ds-action-link-bg-primary: black;
				--ds-action-link-border-primary: transparent;
				--ds-action-link-fg-primary: white;
				--ds-action-link-bg-secondary: transparent;
				--ds-action-link-border-secondary: black;
				--ds-action-link-fg-secondary: black;
				--ds-action-link-inline-color: black;
				--ds-action-link-inline-underline-offset: 4px;
				--ds-action-link-hover-lift: -1px;
				--ds-action-link-focus-width: 2px;
				--ds-action-link-focus-color: black;
				--ds-action-link-focus-offset: 2px;
				--ds-action-link-hover-opacity: 0.9;
			}
			${actionLinkCss}
		</style>
		<a class="${actionLinkScopeClass}" href="#review">Review link</a>
	`);

	const actionLink = page.getByRole('link', { name: 'Review link' });
	expect(await actionLink.evaluate((element) => getComputedStyle(element).height)).toBe('48px');
	expect(await actionLink.evaluate((element) => getComputedStyle(element).minHeight)).toBe('44px');
	await page.keyboard.press('Tab');
	expect(await actionLink.evaluate((element) => document.activeElement === element)).toBe(true);
	expect(await actionLink.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe(
		'solid'
	);
});

test('ActionLink, ContentCard, and Pill resolve light-theme component aliases inside Section', async ({
	page
}) => {
	await page.setContent(`
		<style>
			${tokenCss}
			${sectionCss}
			${actionLinkCss}
			${contentCardCss}
			${pillCss}
		</style>
		<section class="${sectionScopeClass}" data-theme="light">
			<a class="${actionLinkScopeClass} primary" href="#contact">Contact</a>
			<article class="${contentCardScopeClass}">ContentCard</article>
			<span class="${pillScopeClass}">Tokens only</span>
		</section>
	`);

	const actionLink = page.getByRole('link', { name: 'Contact' });
	const contentCard = page.getByRole('article');
	const pill = page.getByText('Tokens only');

	expect(await actionLink.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
		'rgb(21, 24, 28)'
	);
	expect(await actionLink.evaluate((element) => getComputedStyle(element).color)).toBe(
		'rgb(240, 241, 243)'
	);
	expect(await contentCard.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
		'rgba(46, 51, 59, 0.04)'
	);
	expect(await pill.evaluate((element) => getComputedStyle(element).color)).toBe(
		'rgba(46, 51, 59, 0.78)'
	);
});

test('ActionLink preserves native fragment navigation without JavaScript', async ({ browser }) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();

	try {
		await page.setContent(`
			<style>
				${tokenCss}
				${actionLinkCss}
			</style>
			<a class="${actionLinkScopeClass} secondary" href="#destination">Review destination</a>
			<div id="destination">Destination content</div>
		`);

		const actionLink = page.getByRole('link', { name: 'Review destination' });
		await actionLink.click();
		await expect(page).toHaveURL(/#destination$/);
		await expect(page.getByText('Destination content')).toBeVisible();
	} finally {
		await context.close();
	}
});

test('ColumnList supports the typed three-column desktop layout without changing its default layout', async ({
	page
}) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.setContent(`
		<style>
			${tokenCss}
			${columnListCss}
		</style>
		<div class="columns three-column ${columnListScopeClass}">
			<article>First</article>
			<article>Second</article>
			<article>Third</article>
		</div>
		<div class="columns ${columnListScopeClass}">
			<article>Default first</article>
			<article>Default second</article>
		</div>
	`);

	const threeColumn = page.locator('.three-column');
	const defaultColumns = page.locator('.columns').nth(1);
	expect(
		(await threeColumn.evaluate((element) => getComputedStyle(element).gridTemplateColumns)).split(
			' '
		).length
	).toBe(3);
	expect(
		(
			await defaultColumns.evaluate((element) => getComputedStyle(element).gridTemplateColumns)
		).split(' ').length
	).toBe(2);
});

test('a light-theme Section re-establishes text colour rather than inheriting the dark theme', async ({
	page
}) => {
	// Reproduces the real page: body sets a dark-theme colour that would otherwise inherit into
	// the light section as a *computed* value, leaving near-white headings on a light background.
	await page.setContent(`
		<style>
			${tokenCss}
			${sectionCss}
			body { color: var(--ds-fg); margin: 0; }
		</style>
		<section class="${sectionScopeClass}" data-theme="light">
			<div class="content"><h2>Heading</h2></div>
		</section>
	`);

	expect(await page.locator('h2').evaluate((el) => getComputedStyle(el).color)).toBe(
		'rgb(46, 51, 59)'
	);
});
