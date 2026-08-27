import { expect, test } from '@playwright/test';
import { glob, readFile } from 'node:fs/promises';

const tokenCssUrl = new URL('../../src/lib/styles/tokens.css', import.meta.url);
// Mirrors the [data-theme='light'] block of tokens.css. Change these together with the palette.
const lightMuted = 'rgb(46 51 59 / 0.78)';
const lightSurface = 'rgb(46 51 59 / 0.04)';
const lightGradientEndpoints = ['#f0f1f3', '#dfe1e5'];

test('the light muted token passes browser-composited contrast on every supported surface', async ({
	page
}) => {
	const tokenCss = await readFile(tokenCssUrl, 'utf8');
	const lightTheme = tokenCss.match(/\[data-theme='light'\]\s*\{([\s\S]*?)\n\}/)?.[1];
	const lightMutedToken = lightTheme?.match(/--ds-fg-muted:\s*([^;]+);/)?.[1];

	expect(lightMutedToken).toBe(lightMuted);

	await page.goto('/');
	const measurements = await page.evaluate(
		({ foreground, surface, endpoints }) => {
			function relativeLuminance([red, green, blue]: number[]) {
				const linear = (channel: number) => {
					const value = channel / 255;
					return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
				};

				return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
			}

			function contrast(first: number[], second: number[]) {
				const [lighter, darker] = [relativeLuminance(first), relativeLuminance(second)].sort(
					(a, b) => b - a
				);
				return (lighter + 0.05) / (darker + 0.05);
			}

			function paint(layers: string[]) {
				const canvas = document.createElement('canvas');
				canvas.width = 1;
				canvas.height = 1;
				const context = canvas.getContext('2d', { willReadFrequently: true })!;

				for (const layer of layers) {
					context.fillStyle = layer;
					context.fillRect(0, 0, 1, 1);
				}

				return Array.from(context.getImageData(0, 0, 1, 1).data.slice(0, 3));
			}

			return endpoints.map((endpoint) => {
				const bareBackground = paint([endpoint]);
				const surfaceBackground = paint([endpoint, surface]);
				return {
					endpoint,
					bare: contrast(paint([endpoint, foreground]), bareBackground),
					surface: contrast(paint([endpoint, surface, foreground]), surfaceBackground)
				};
			});
		},
		{ endpoints: lightGradientEndpoints, foreground: lightMutedToken!, surface: lightSurface }
	);

	for (const measurement of measurements) {
		expect(measurement.bare, `${measurement.endpoint} bare contrast`).toBeGreaterThanOrEqual(4.5);
		expect(measurement.surface, `${measurement.endpoint} surface contrast`).toBeGreaterThanOrEqual(
			4.5
		);
	}
});

test('components contain no raw color values', async () => {
	const sources = await Array.fromAsync(
		glob('src/**/*.svelte', { cwd: new URL('../..', import.meta.url) })
	);

	expect(sources.length).toBeGreaterThan(0);
	for (const source of sources) {
		const contents = await readFile(new URL(`../../${source}`, import.meta.url), 'utf8');
		expect(contents, source).not.toMatch(/#[0-9a-f]{3,8}\b|\brgba?\(/i);
	}
});
