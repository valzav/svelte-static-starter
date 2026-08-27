import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import { compile } from 'svelte/compiler';
import type { ViteDevServer } from 'vite';
import { site } from '../../src/lib/content/site';
import { createSsrFixtureServer, fixtureViteCacheDirs } from '../fixtures/vite-server';

const headerUrl = new URL('../../src/lib/components/layout/Header.svelte', import.meta.url);
const footerUrl = new URL('../../src/lib/components/layout/Footer.svelte', import.meta.url);
const actionLinkUrl = new URL('../../src/lib/components/ui/ActionLink.svelte', import.meta.url);
const [headerSource, footerSource, actionLinkSource, tokenCss, baseCss] = await Promise.all([
	readFile(headerUrl, 'utf8'),
	readFile(footerUrl, 'utf8'),
	readFile(actionLinkUrl, 'utf8'),
	readFile(new URL('../../src/lib/styles/tokens.css', import.meta.url), 'utf8'),
	readFile(new URL('../../src/lib/styles/base.css', import.meta.url), 'utf8')
]);
function compiledCss(source: string, filename: string) {
	return compile(source, { filename, generate: 'client' }).css!.code;
}

const headerCss = compiledCss(headerSource, headerUrl.pathname);
const footerCss = compiledCss(footerSource, footerUrl.pathname);
const actionLinkCss = compiledCss(actionLinkSource, actionLinkUrl.pathname);
let fixtureServer: ViteDevServer;
let fixtureHtml: string;

test.beforeAll(async () => {
	fixtureServer = await createSsrFixtureServer('headerFooter');
	const { renderHeaderFooterFixture } = await fixtureServer.ssrLoadModule(
		'/tests/fixtures/header-footer.server.ts'
	);
	fixtureHtml = renderHeaderFooterFixture();
});

test.afterAll(async () => {
	await fixtureServer.close();
});

async function setFixture(page: Page) {
	await page.setContent(`
		<style>
			${tokenCss}
			${baseCss}
			${headerCss}
			${footerCss}
			${actionLinkCss}
		</style>
		${fixtureHtml}
	`);
}

async function expectInteractiveTargetsAndFocus(page: Page) {
	for (const control of await page.locator('a:visible, summary:visible').all()) {
		const box = await control.boundingBox();
		expect(box).not.toBeNull();
		expect(box!.height).toBeGreaterThanOrEqual(44);

		await control.focus();
		expect(await control.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
		expect(await control.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe(
			'solid'
		);
	}
}

test('Header is fixed, tokenized, fully navigable on desktop, and has a visible focus ring', async ({
	page
}) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await setFixture(page);

	const header = page.locator('header');
	expect(await header.evaluate((element) => getComputedStyle(element).position)).toBe('fixed');
	expect(await header.evaluate((element) => getComputedStyle(element).height)).toBe('60px');
	expect(
		await header.evaluate(() => getComputedStyle(document.documentElement).scrollPaddingTop)
	).toBe(await header.evaluate((element) => getComputedStyle(element).height));

	for (const item of site.navigation.slice(0, -1)) {
		await expect(header.getByRole('link', { name: item.label })).toBeVisible();
	}
	await expect(header.getByRole('link', { name: site.navigation.at(-1)!.label })).toBeVisible();

	const firstNavigationLink = header.getByRole('link', { name: site.navigation[0].label });
	await firstNavigationLink.focus();
	expect(await firstNavigationLink.evaluate((element) => element.matches(':focus-visible'))).toBe(
		true
	);
	expect(
		await firstNavigationLink.evaluate((element) => getComputedStyle(element).outlineStyle)
	).toBe('solid');
	expect(
		await firstNavigationLink.evaluate((element) => getComputedStyle(element).outlineWidth)
	).toBe('2px');
	expect(
		await firstNavigationLink.evaluate((element) => getComputedStyle(element).outlineColor)
	).toBe('rgb(106, 169, 240)');
});

test('Header and Footer SSR fixture server owns its cache and disables its Vite WebSocket listener', () => {
	expect(fixtureServer.config.server.ws).toBe(false);
	expect(fixtureServer.config.cacheDir).toBe(fixtureViteCacheDirs.headerFooter);
});

test('Header collapses only its anchor group at 375px and the Footer keeps fallbacks noninteractive', async ({
	page
}) => {
	await page.setViewportSize({ width: 375, height: 812 });
	await setFixture(page);

	const header = page.locator('header');
	await expect(header.locator('.nav-links')).toBeHidden();
	await expect(header.getByRole('link', { name: 'Static Starter home' })).toBeVisible();
	const contact = header.getByRole('link', { name: site.navigation.at(-1)!.label });
	await expect(contact).toBeVisible();
	await contact.focus();
	expect(await contact.evaluate((element) => document.activeElement === element)).toBe(true);
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
		true
	);

	for (const label of ['Absent href', 'Exact blank href', 'Whitespace href']) {
		const fallback = page.getByText(label, { exact: true });
		await expect(fallback).toBeVisible();
		expect(await fallback.evaluate((element) => element.tagName)).toBe('SPAN');
		expect(await fallback.evaluate((element) => element.closest('a'))).toBeNull();
		expect(await fallback.evaluate((element) => element.getAttribute('href'))).toBeNull();
	}

	const fallback = page.getByText('Absent href', { exact: true });
	const configuredLink = page.getByRole('link', { name: 'Configured local' });
	expect(await fallback.evaluate((element) => getComputedStyle(element).color)).toBe(
		await page.locator('.disclaimer').evaluate((element) => getComputedStyle(element).color)
	);
	expect(await fallback.evaluate((element) => getComputedStyle(element).color)).not.toBe(
		await configuredLink.evaluate((element) => getComputedStyle(element).color)
	);

	for (const label of ['Configured HTTPS', 'Configured protocol-relative', 'Configured local']) {
		await expect(page.getByRole('link', { name: label })).toBeVisible();
	}
	expect(await page.getByRole('link', { name: 'Configured HTTPS' }).getAttribute('rel')).toBe(
		'noopener'
	);
	expect(
		await page.getByRole('link', { name: 'Configured protocol-relative' }).getAttribute('rel')
	).toBe('noopener');
});

test('Header and configured Footer links retain 44px targets and visible focus at delivery widths', async ({
	page
}) => {
	for (const viewport of [
		{ width: 375, height: 812 },
		{ width: 768, height: 900 },
		{ width: 1024, height: 900 },
		{ width: 1440, height: 900 }
	]) {
		await page.setViewportSize(viewport);
		await setFixture(page);
		await expectInteractiveTargetsAndFocus(page);
	}
});
