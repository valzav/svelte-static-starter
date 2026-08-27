import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { byLayer, isColor, parseTokens } from '../../src/lib/styles/tokens';

const tokensCss = await readFile(
	new URL('../../src/lib/styles/tokens.css', import.meta.url),
	'utf8'
);

describe('token parser', () => {
	it('reads every declaration in the default :root block and tags it with its layer', () => {
		const tokens = parseTokens(tokensCss);

		expect(tokens.length).toBeGreaterThan(0);
		for (const layer of ['primitive', 'semantic', 'component'] as const) {
			expect(byLayer(tokens, layer).length, layer).toBeGreaterThan(0);
		}
		// Every declaration the file carries before the light block, and no duplicates.
		expect(new Set(tokens.map((token) => token.name)).size).toBe(tokens.length);
	});

	// The regression that made the reference show only the primitive layer: the semantic layer's
	// own comment contains the light-theme selector, so a naive indexOf truncated the parse.
	it('is not truncated by the light-theme selector appearing inside a comment', () => {
		const css = [
			'/* [primitive] */',
			":root { --ds-a: 1px; /* [semantic] see [data-theme='light'] */ --ds-b: red; }",
			"[data-theme='light'] { --ds-b: blue; }"
		].join('\n');

		expect(parseTokens(css)).toEqual([
			{ name: '--ds-a', value: '1px', layer: 'primitive' },
			{ name: '--ds-b', value: 'red', layer: 'semantic' }
		]);
	});

	it('excludes the light-theme block, so no token is listed twice', () => {
		const tokens = parseTokens(tokensCss);
		const fg = tokens.filter((token) => token.name === '--ds-fg');

		expect(fg).toHaveLength(1);
		expect(fg[0].layer).toBe('semantic');
	});

	it('keeps a multi-line value whole', () => {
		const bg = parseTokens(tokensCss).find((token) => token.name === '--ds-bg');

		expect(bg?.value).toContain('linear-gradient');
		expect(bg?.value).not.toContain('\n');
	});

	it('recognises colour tokens by value or by role name', () => {
		expect(isColor({ name: '--ds-x', value: '#15181c', layer: 'primitive' })).toBe(true);
		expect(isColor({ name: '--ds-x', value: 'rgb(1 2 3 / 0.5)', layer: 'semantic' })).toBe(true);
		expect(isColor({ name: '--ds-fg-muted', value: 'var(--ds-a)', layer: 'semantic' })).toBe(true);
		expect(isColor({ name: '--ds-space-3', value: '1rem', layer: 'primitive' })).toBe(false);
		expect(isColor({ name: '--ds-duration-fast', value: '150ms', layer: 'primitive' })).toBe(false);
	});
});
