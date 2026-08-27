import { readFile } from 'node:fs/promises';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { compile } from 'svelte/compiler';
import type { ViteDevServer } from 'vite';
import { faq } from '../../src/lib/content/faq';
import { createSsrFixtureServer, fixtureViteCacheDirs } from '../fixtures/vite-server';

const accordionItemUrl = new URL(
	'../../src/lib/components/ui/AccordionItem.svelte',
	import.meta.url
);
const [accordionItemSource, tokenCss] = await Promise.all([
	readFile(accordionItemUrl, 'utf8'),
	readFile(new URL('../../src/lib/styles/tokens.css', import.meta.url), 'utf8')
]);
function compiledCss(source: string, filename: string) {
	return compile(source, { filename, generate: 'client' }).css!.code;
}

const accordionItemCss = compiledCss(accordionItemSource, accordionItemUrl.pathname);
let fixtureServer: ViteDevServer;
let fixtureHtml: string;

test.beforeAll(async () => {
	fixtureServer = await createSsrFixtureServer('accordion');
	const { renderAccordionFixture } = await fixtureServer.ssrLoadModule(
		'/tests/fixtures/accordion.server.ts'
	);
	fixtureHtml = renderAccordionFixture();
});

test('Accordion SSR fixture server owns its cache and disables its Vite WebSocket listener', () => {
	expect(fixtureServer.config.server.ws).toBe(false);
	expect(fixtureServer.config.cacheDir).toBe(fixtureViteCacheDirs.accordion);
});

test.afterAll(async () => {
	await fixtureServer.close();
});

async function setFixture(page: Page) {
	await page.setContent(`
		<style>
			${tokenCss}
			${accordionItemCss}
		</style>
		${fixtureHtml}
	`);
}

async function expectToggle(summary: Locator, key: string) {
	const details = summary.locator('xpath=..');

	await summary.focus();
	await summary.press(key);
	expect(await details.evaluate((element) => (element as HTMLDetailsElement).open)).toBe(true);
	await summary.press(key);
	expect(await details.evaluate((element) => (element as HTMLDetailsElement).open)).toBe(false);
}

test('AccordionItem opens and closes by pointer and keyboard at both viewports', async ({
	page
}) => {
	for (const viewport of [
		{ width: 375, height: 812 },
		{ width: 1440, height: 900 }
	]) {
		await page.setViewportSize(viewport);
		await setFixture(page);

		const pointerSummary = page.locator('summary').nth(2);
		const pointerDetails = pointerSummary.locator('xpath=..');
		const otherSummary = page.locator('summary').nth(1);
		const otherDetails = otherSummary.locator('xpath=..');
		const collapsedSnapshot = await pointerDetails.ariaSnapshot();

		await pointerSummary.click();
		expect(await pointerDetails.evaluate((element) => (element as HTMLDetailsElement).open)).toBe(
			true
		);
		await expect.poll(() => pointerDetails.ariaSnapshot()).toContain(faq[2].answer);
		const expandedSnapshot = await pointerDetails.ariaSnapshot();
		expect(expandedSnapshot).not.toBe(collapsedSnapshot);
		expect(expandedSnapshot).toContain(faq[2].question);
		expect(await pointerSummary.ariaSnapshot()).toContain(faq[2].question);
		await otherSummary.click();
		expect(await pointerDetails.evaluate((element) => (element as HTMLDetailsElement).open)).toBe(
			false
		);
		expect(await otherDetails.evaluate((element) => (element as HTMLDetailsElement).open)).toBe(
			true
		);
		await otherSummary.click();

		await expectToggle(page.locator('summary').nth(0), 'Enter');
		await expectToggle(page.locator('summary').nth(1), ' ');
	}
});

test('AccordionItem retains native pointer and keyboard disclosure without JavaScript', async ({
	browser
}) => {
	const context = await browser.newContext({
		javaScriptEnabled: false,
		viewport: { width: 375, height: 812 }
	});
	const page = await context.newPage();

	try {
		await setFixture(page);
		const pointerSummary = page.locator('summary').nth(2);
		const pointerDetails = pointerSummary.locator('xpath=..');
		const otherSummary = page.locator('summary').nth(1);
		const otherDetails = otherSummary.locator('xpath=..');
		const answer = pointerDetails.locator('p');

		await pointerSummary.click();
		expect(await pointerDetails.evaluate((element) => (element as HTMLDetailsElement).open)).toBe(
			true
		);
		await expect(answer).toBeVisible();
		await otherSummary.focus();
		await otherSummary.press('Enter');
		expect(await pointerDetails.evaluate((element) => (element as HTMLDetailsElement).open)).toBe(
			false
		);
		expect(await otherDetails.evaluate((element) => (element as HTMLDetailsElement).open)).toBe(
			true
		);
		await otherSummary.press('Enter');
		await expectToggle(page.locator('summary').nth(0), 'Enter');
	} finally {
		await context.close();
	}
});

test('AccordionItem resolves tokenized disclosure geometry, focus, divider, and reduced motion', async ({
	page
}) => {
	await setFixture(page);
	const summary = page.locator('summary').first();
	const details = summary.locator('xpath=..');
	const chevron = summary.locator('.chevron');
	const contentTransitionDuration = () =>
		details.evaluate(
			(element) => getComputedStyle(element, '::details-content').transitionDuration
		);

	expect(
		Number.parseFloat(await summary.evaluate((element) => getComputedStyle(element).minHeight))
	).toBeGreaterThanOrEqual(44);
	await summary.focus();
	expect(await summary.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe('solid');
	expect(
		await page
			.locator('details')
			.nth(1)
			.evaluate((element) => getComputedStyle(element).borderBlockStartColor)
	).toBe('rgba(223, 225, 229, 0.14)');
	expect(await summary.ariaSnapshot()).toContain(faq[0].question);
	expect(await contentTransitionDuration()).not.toBe('0s');

	await page.emulateMedia({ reducedMotion: 'reduce' });
	const closedTransform = await chevron.evaluate((element) => getComputedStyle(element).transform);
	await summary.click();
	expect(await details.evaluate((element) => (element as HTMLDetailsElement).open)).toBe(true);
	expect(await chevron.evaluate((element) => getComputedStyle(element).transform)).not.toBe(
		closedTransform
	);
	expect(await chevron.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe(
		'0s'
	);
	expect(await contentTransitionDuration()).toBe('0s');
});
