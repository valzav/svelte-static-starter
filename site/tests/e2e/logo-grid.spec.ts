import { expect, test } from '@playwright/test';

const fixtureUrl = 'http://127.0.0.1:4174/tests/fixtures/logo-grid.html';

test('LogoGrid resolves monochrome marks and equal tile geometry without mobile overflow', async ({
	page
}) => {
	await page.setViewportSize({ width: 375, height: 812 });
	const response = await page.goto(fixtureUrl);
	expect(response?.ok()).toBe(true);

	const imageTile = page.getByLabel('9 — Test mark');
	const textTile = page.getByLabel('Text fallback');
	const longTextTile = page.getByLabel(
		'A deliberately long text-only company name that must wrap inside its tile'
	);
	const mark = imageTile.locator('.mark');

	expect(await mark.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
		'rgb(240, 241, 243)'
	);
	const [imageBox, textBox] = await Promise.all([imageTile.boundingBox(), textTile.boundingBox()]);

	if (!imageBox || !textBox) {
		throw new Error('Logo tiles must render before their geometry can be verified.');
	}

	expect({ width: imageBox.width, height: imageBox.height }).toEqual({
		width: textBox.width,
		height: textBox.height
	});
	expect(imageBox.width / imageBox.height).toBeCloseTo(1.5, 1);
	expect(await longTextTile.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
		true
	);
});
