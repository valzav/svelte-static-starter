import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Logo from '../../src/lib/components/ui/Logo.svelte';

const selections = [
	{ variant: 'full' as const, theme: 'dark' as const, asset: 'logo-dark.svg' },
	{ variant: 'full' as const, theme: 'light' as const, asset: 'logo-light.svg' },
	{
		variant: 'symbol' as const,
		theme: 'dark' as const,
		asset: 'symbol-dark.svg'
	},
	{
		variant: 'symbol' as const,
		theme: 'light' as const,
		asset: 'symbol-light.svg'
	}
];

describe('Logo', () => {
	it.each(selections)('selects the $theme $variant asset from the site origin', (selection) => {
		const { body } = render(Logo, { props: selection });
		const src = body.match(/<img src="([^"]+)"/)?.[1];

		expect(src).toContain(selection.asset);
		expect(src).not.toMatch(/^https?:\/\//);
		expect(body).toContain('alt="Static Starter"');
	});
});
