import { expect, test, type Page } from '@playwright/test';
import { ISSUE_URL_LIMIT, PASTE_NOTE } from '../../src/lib/dev/annotate-issue';

// The preview server builds with PUBLIC_SITE_ENV unset (playwright.config.ts), so this suite runs
// against a staging build: the overlay chunk and the Svelte development metadata are present
// (ADR-0007). Playwright selectors pierce the overlay's open shadow root.

const ISSUE_URL = 'https://github.com/OWNER/REPO/issues/new?';

declare global {
	interface Window {
		__opened: string[];
		__clipboard: string[];
	}
}

// `window.open` would leave the preview origin and the clipboard needs a permission grant, so
// both are recorded instead .
async function recordBrowserApis(page: Page) {
	await page.addInitScript(() => {
		window.__opened = [];
		window.__clipboard = [];
		window.open = (url) => {
			window.__opened.push(String(url));
			return null;
		};
		Object.defineProperty(navigator, 'clipboard', {
			value: { writeText: async (text: string) => void window.__clipboard.push(text) }
		});
	});
}

async function annotate(page: Page, target: string, comment: string) {
	await page.locator(target).click();
	await expect(page.locator('#ds-annotate .form')).toBeVisible();
	await page.locator('#ds-annotate textarea').fill(comment);
	await page.locator('#ds-annotate .form button[type="submit"]').click();
	await expect(page.locator('#ds-annotate .form')).toBeHidden();
}

function openedBody(url: string) {
	return new URL(url).searchParams.get('body') ?? '';
}

test.beforeEach(async ({ page }) => {
	await recordBrowserApis(page);
	await page.goto('/');
	await page.locator('#ds-annotate .toggle').click();
	await expect(page.locator('#ds-annotate .panel')).toBeVisible();
	// First activation asks for the submitter name (issue title); later activations do not.
	await page.locator('#ds-annotate .name input').fill('Val');
	await page.locator('#ds-annotate .name button').click();
	await expect(page.locator('#ds-annotate .tools')).toBeVisible();
});

test('an annotation records the Svelte source location and component chain', async ({ page }) => {
	await page.locator('main h1').hover();
	await expect(page.locator('#ds-annotate .box')).toBeVisible();

	await annotate(page, 'main h1', 'Make the headline shorter');

	const item = page.locator('#ds-annotate .list li');
	await expect(item).toHaveCount(1);
	await expect(item).toContainText('Section.svelte:');
	await expect(item).toContainText('Make the headline shorter');

	const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('ds-annotate') ?? '[]'));
	expect(stored).toHaveLength(1);
	expect(stored[0].target.file).toBe('src/lib/components/ui/Section.svelte');
	expect(stored[0].target.line).toBeGreaterThan(0);
	expect(stored[0].target.tag).toBe('h1');
	expect(stored[0].target.components).toContain('Section');
	expect(stored[0].comment).toBe('Make the headline shorter');
});

test('links do not navigate in annotate mode', async ({ page }) => {
	const link = page.locator('header nav a[href^="/#"]').first();
	const href = await link.getAttribute('href');
	await link.click();
	await expect(page.locator('#ds-annotate .form')).toBeVisible();
	expect(new URL(page.url()).hash).not.toBe(href);
});

test('a middle click on a link opens no page and keeps the URL', async ({ page, context }) => {
	const link = page.locator('header nav a[href="/#primitives"]');
	await link.click({ button: 'middle' });
	// Give an escaped default action time to open a tab before asserting that none did.
	await page.waitForTimeout(500);
	expect(context.pages()).toHaveLength(1);
	expect(new URL(page.url()).hash).toBe('');
	await expect(page.locator('#ds-annotate .form')).toBeHidden();
});

test('a whitespace-only comment keeps the form open and stores nothing', async ({ page }) => {
	await page.locator('main h1').click();
	await page.locator('#ds-annotate textarea').fill('   \n\t');
	await page.locator('#ds-annotate .form button[type="submit"]').click();
	await expect(page.locator('#ds-annotate .form')).toBeVisible();
	await expect(page.locator('#ds-annotate textarea')).toBeFocused();
	await expect(page.locator('#ds-annotate .list li')).toHaveCount(0);
	expect(await page.evaluate(() => localStorage.getItem('ds-annotate'))).toBeNull();
});

test('Escape closes the form, then leaves annotate mode', async ({ page }) => {
	await page.locator('main h1').click();
	await expect(page.locator('#ds-annotate .form')).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(page.locator('#ds-annotate .form')).toBeHidden();
	await expect(page.locator('#ds-annotate .panel')).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(page.locator('#ds-annotate .panel')).toBeHidden();
});

test('Create issue opens the prefilled form and copies the body', async ({ page }) => {
	await annotate(page, 'main h1', 'Make the headline shorter');
	await annotate(page, 'header nav a[href="/#primitives"]', 'Rename this link');
	await page.locator('#ds-annotate [data-action="issue"]').click();

	const opened = await page.evaluate(() => window.__opened);
	expect(opened).toHaveLength(1);
	expect(opened[0].startsWith(ISSUE_URL)).toBe(true);
	expect(opened[0].length).toBeLessThanOrEqual(ISSUE_URL_LIMIT);
	const title = new URL(opened[0]).searchParams.get('title') ?? '';
	expect(title).toBe('Change request (Val): 2 annotations');
	const body = openedBody(opened[0]);
	expect(body).toContain('\nsrc/lib/components/ui/Section.svelte:');
	expect(body).toContain('\nh1 "');
	expect(body).toContain('\nMake the headline shorter');
	expect(body).toContain('\na "');
	expect(body).toContain('\nRename this link');

	const clipboard = await page.evaluate(() => window.__clipboard);
	expect(clipboard).toEqual([body]);
});

test('an over-limit body falls back to the clipboard and a paste note', async ({ page }) => {
	await annotate(page, 'main h1', 'x'.repeat(ISSUE_URL_LIMIT));
	await page.locator('#ds-annotate [data-action="issue"]').click();

	const opened = await page.evaluate(() => window.__opened);
	expect(opened).toHaveLength(1);
	expect(opened[0].length).toBeLessThanOrEqual(ISSUE_URL_LIMIT);
	expect(openedBody(opened[0])).toBe(PASTE_NOTE);

	const clipboard = await page.evaluate(() => window.__clipboard);
	expect(clipboard).toHaveLength(1);
	expect(clipboard[0]).toContain('x'.repeat(ISSUE_URL_LIMIT));
	await expect(page.locator('#ds-annotate .status')).toContainText('clipboard');
});

test('annotations survive a reload and deletion sticks', async ({ page }) => {
	await annotate(page, 'main h1', 'Make the headline shorter');

	await page.reload();
	await page.locator('#ds-annotate .toggle').click();
	await expect(page.locator('#ds-annotate .name')).toBeHidden();
	await expect(page.locator('#ds-annotate .list li')).toHaveCount(1);
	await expect(page.locator('#ds-annotate .marker')).toHaveText(['1']);

	await page.locator('#ds-annotate .list li button').click();
	await expect(page.locator('#ds-annotate .list li')).toHaveCount(0);

	await page.reload();
	await page.locator('#ds-annotate .toggle').click();
	await expect(page.locator('#ds-annotate .list li')).toHaveCount(0);
});
