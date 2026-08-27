/**
 * Reads the declarations out of `tokens.css` so the style guide renders whatever the file
 * actually contains. Nothing here is used by the site itself — only by `/styleguide` and its
 * tests, so a token can never appear in the reference without existing in the stylesheet.
 */

export type Layer = 'primitive' | 'semantic' | 'component';

export interface Token {
	name: string;
	value: string;
	layer: Layer;
}

const LAYER_MARKER = /\/\*\s*\[(primitive|semantic|component)\]/;
const DECLARATION = /(--ds-[a-z0-9-]+)\s*:\s*([\s\S]*?);/;

/**
 * Start of the light-theme block. Anchored to the line start on purpose: the selector also
 * appears inside a comment in the semantic layer, and matching that would truncate the parse.
 */
function lightBlockStart(css: string): number {
	const match = /^\[data-theme='light'\]/m.exec(css);
	return match ? match.index : css.length;
}

/**
 * Declarations in the default `:root` block, tagged by the `[layer]` comment above them.
 * The light-theme block and the responsive overrides are excluded: they redefine tokens that
 * are already listed, and a reference that showed each token twice would be harder to read.
 */
export function parseTokens(css: string): Token[] {
	const root = css.slice(0, lightBlockStart(css));
	const tokens: Token[] = [];
	let layer: Layer = 'primitive';

	// Split on declaration boundaries so a multi-line value (a gradient, a data URI) stays whole.
	for (const chunk of root.split(/(?<=;)/)) {
		const marker = LAYER_MARKER.exec(chunk);
		if (marker) layer = marker[1] as Layer;

		const declaration = DECLARATION.exec(chunk);
		if (declaration) {
			tokens.push({
				name: declaration[1],
				value: declaration[2].replace(/\s+/g, ' ').trim(),
				layer
			});
		}
	}

	return tokens;
}

/** A token whose value renders as a colour swatch rather than as text. */
export function isColor(token: Token): boolean {
	return (
		/^(#|rgb|hsl|oklch|color-mix|linear-gradient|radial-gradient)/.test(token.value) ||
		/-(bg|fg|accent|border|surface|focus|color|tint|glow|wash)(-|$)/.test(token.name)
	);
}

export function byLayer(tokens: Token[], layer: Layer): Token[] {
	return tokens.filter((token) => token.layer === layer);
}
