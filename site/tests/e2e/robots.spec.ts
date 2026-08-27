import { expect, test } from '@playwright/test';

// The Playwright server builds and previews with PUBLIC_SITE_ENV unset (playwright.config.ts), so
// this suite runs against a staging build. It guards the wiring the unit test cannot see: the meta
// in the layout head and the prerendered robots.txt route (ADR-0006). The production side has
// no server here and is proved by the second build in the task plan.
test('the staging build marks every page noindex', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
});

test('the staging build serves a robots.txt that disallows crawling', async ({ request }) => {
	const response = await request.get('/robots.txt');
	expect(response.status()).toBe(200);
	expect(response.headers()['content-type']).toContain('text/plain');
	expect(await response.text()).toContain('Disallow: /');
});
