import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import { compile } from 'svelte/compiler';
import type { UserConfig } from 'vite';
import fixtureConfig from '../fixtures/vite.config';
import { fixtureViteCacheDirs, fixtureViteCacheRoot } from '../fixtures/vite-server';

const [revealSource, tokenCss] = await Promise.all([
	readFile(new URL('../../src/lib/components/ui/Reveal.svelte', import.meta.url), 'utf8'),
	readFile(new URL('../../src/lib/styles/tokens.css', import.meta.url), 'utf8')
]);

const revealCss = compile(revealSource, { filename: 'Reveal.svelte', generate: 'client' }).css!
	.code;
const scopeClassMatch = revealCss.match(/\.svelte-[\w-]+/);

if (!scopeClassMatch) {
	throw new Error('Reveal CSS must retain its Svelte scope class.');
}

const revealScopeClass = scopeClassMatch[0].slice(1);
const fixtureUrl = 'http://127.0.0.1:4174/tests/fixtures/reveal.html';

type ObserverHarness = {
	constructors: number;
	disconnected: boolean;
	observed: Element[];
	unobserved: Element[];
	trigger: (target: Element) => void;
};

declare global {
	interface Window {
		__revealObserverHarness?: ObserverHarness;
		unmountRevealFixture?: () => void;
	}
}

async function installObserverHarness(page: Page) {
	await page.addInitScript(() => {
		class Observer {
			static instances: Observer[] = [];
			callback: IntersectionObserverCallback;
			observed: Element[] = [];
			unobserved: Element[] = [];
			disconnected = false;

			constructor(callback: IntersectionObserverCallback) {
				this.callback = callback;
				Observer.instances.push(this);
			}

			observe(target: Element) {
				this.observed.push(target);
			}

			unobserve(target: Element) {
				this.unobserved.push(target);
			}

			disconnect() {
				this.disconnected = true;
			}
		}

		Object.defineProperty(window, 'IntersectionObserver', { configurable: true, value: Observer });
		window.__revealObserverHarness = {
			get constructors() {
				return Observer.instances.length;
			},
			get disconnected() {
				return Observer.instances[0]?.disconnected ?? false;
			},
			get observed() {
				return Observer.instances[0]?.observed ?? [];
			},
			get unobserved() {
				return Observer.instances[0]?.unobserved ?? [];
			},
			trigger(target) {
				Observer.instances[0]?.callback(
					[{ isIntersecting: true, target } as IntersectionObserverEntry],
					Observer.instances[0] as unknown as IntersectionObserver
				);
			}
		};
	});
}

test('Reveal CSS leaves no-JavaScript and reduced-motion content in its final state', async ({
	page
}) => {
	await page.setContent(`
		<html class="no-js">
			<head><style>${tokenCss}${revealCss}</style></head>
			<body><div class="reveal ${revealScopeClass}">Reveal content</div></body>
		</html>
	`);

	const reveal = page.getByText('Reveal content');
	expect(await reveal.evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
	expect(await reveal.evaluate((element) => getComputedStyle(element).transform)).toBe('none');

	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.evaluate(() => document.documentElement.classList.replace('no-js', 'js'));
	expect(await reveal.evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
	expect(await reveal.evaluate((element) => getComputedStyle(element).transform)).toBe('none');
	expect(await reveal.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe(
		'0s'
	);
});

test('browser fixture Vite config owns a distinct test-only dependency cache', async () => {
	const config = fixtureConfig as UserConfig;

	expect(config.cacheDir?.startsWith(fixtureViteCacheRoot)).toBe(true);
	expect(config.cacheDir).toBe(fixtureViteCacheDirs.browser);
	expect(config.optimizeDeps?.entries).toEqual(['tests/fixtures/*.html']);
	expect(config.cacheDir).not.toBe(fixtureViteCacheDirs.accordion);
	expect(config.cacheDir).not.toBe(fixtureViteCacheDirs.headerFooter);
});

test('Reveal observes once, reveals on intersection, and disconnects when unmounted', async ({
	page
}) => {
	await installObserverHarness(page);
	await page.goto(fixtureUrl);

	const reveal = page.locator('.reveal');
	await expect
		.poll(() =>
			page.evaluate(() =>
				window.__revealObserverHarness?.observed.includes(document.querySelector('.reveal')!)
			)
		)
		.toBe(true);
	expect(await reveal.evaluate((element) => element.classList.contains('is-visible'))).toBe(false);
	expect(await reveal.evaluate((element) => getComputedStyle(element).opacity)).toBe('0');
	expect(await reveal.evaluate((element) => getComputedStyle(element).transform)).toBe(
		'matrix(1, 0, 0, 1, 0, -12)'
	);
	expect(await reveal.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe(
		'0.22s'
	);
	expect(
		await reveal.evaluate((element) => getComputedStyle(element).transitionTimingFunction)
	).toBe('cubic-bezier(0.2, 0, 0, 1)');
	expect(await reveal.evaluate((element) => getComputedStyle(element).transitionDelay)).toBe(
		'0.12s'
	);

	await reveal.evaluate((element) => window.__revealObserverHarness?.trigger(element));
	expect(await reveal.evaluate((element) => element.classList.contains('is-visible'))).toBe(true);
	expect(
		await page.evaluate(() =>
			window.__revealObserverHarness?.unobserved.includes(document.querySelector('.reveal')!)
		)
	).toBe(true);

	await page.evaluate(() => window.unmountRevealFixture?.());
	expect(await page.evaluate(() => window.__revealObserverHarness?.disconnected)).toBe(true);
});

test('Reveal skips observation for reduced motion and promotes content when observers are unavailable', async ({
	browser
}) => {
	const reducedContext = await browser.newContext({ reducedMotion: 'reduce' });
	const reducedPage = await reducedContext.newPage();
	await installObserverHarness(reducedPage);
	await reducedPage.goto(fixtureUrl);

	const reducedReveal = reducedPage.locator('.reveal');
	expect(await reducedReveal.evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
	expect(await reducedPage.evaluate(() => window.__revealObserverHarness?.constructors)).toBe(0);
	await reducedContext.close();

	const fallbackContext = await browser.newContext();
	const fallbackPage = await fallbackContext.newPage();
	await fallbackPage.addInitScript(() => {
		Object.defineProperty(window, 'IntersectionObserver', { configurable: true, value: undefined });
	});
	await fallbackPage.goto(fixtureUrl);

	const fallbackReveal = fallbackPage.locator('.reveal');
	expect(await fallbackReveal.evaluate((element) => element.classList.contains('is-visible'))).toBe(
		true
	);
	expect(await fallbackReveal.evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
	await fallbackContext.close();
});
