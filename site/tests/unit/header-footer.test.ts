import { readFile } from 'node:fs/promises';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { footer } from '../../src/lib/content/footer';
import { site } from '../../src/lib/content/site';
import Fixture from '../fixtures/header-footer.svelte';

const headerSource = await readFile(
	new URL('../../src/lib/components/layout/Header.svelte', import.meta.url),
	'utf8'
);
const footerSource = await readFile(
	new URL('../../src/lib/components/layout/Footer.svelte', import.meta.url),
	'utf8'
);

describe('Header and Footer', () => {
	it('server-renders the supplied navigation, Contact, logo, and disclaimer in order', () => {
		const { body } = render(Fixture);
		const navigation = site.navigation.slice(0, -1);

		expect(body).toMatch(/<header[^>]*>/);
		expect(body).toMatch(/<nav[^>]*>/);
		expect(body).toMatch(/<footer[^>]*>/);
		expect(body).toContain('alt="Static Starter"');

		for (const item of navigation) {
			expect(body).toContain(`href="${item.href}"`);
			expect(body).toContain(item.label);
		}

		expect(body).toContain(`href="${site.contactHref}"`);
		expect(body).toContain(site.navigation.at(-1)!.label);

		let priorIndex = -1;
		for (const paragraph of footer.disclaimer) {
			const index = body.indexOf(paragraph);
			expect(index).toBeGreaterThan(priorIndex);
			priorIndex = index;
		}
	});

	it('renders external URLs safely and each absent, blank, and whitespace URL as plain text', () => {
		const { body } = render(Fixture);

		expect(body).toMatch(
			/<a[^>]*href="HTTPS:\/\/social\.example\.test\/handle"[^>]*rel="noopener"[^>]*>Configured HTTPS<\/a>/
		);
		expect(body).toMatch(
			/<a[^>]*href="\/\/social\.example\.test\/handle"[^>]*rel="noopener"[^>]*>Configured protocol-relative<\/a>/
		);
		expect(body).toMatch(/<a[^>]*href="\/legal"[^>]*>Configured local<\/a>/);
		// Anchored on the local link itself: a later external link legitimately carries rel.
		expect(body).not.toMatch(/<a[^>]*href="\/legal"[^>]*rel="noopener"/);

		for (const label of ['Absent href', 'Exact blank href', 'Whitespace href']) {
			expect(body).toMatch(new RegExp(`<span[^>]*>${label}</span>`));
			expect(body).not.toMatch(new RegExp(`<a[^>]*>${label}</a>`));
		}
	});

	it('renders substituted fixture values instead of owning navigation or disclaimer copy', () => {
		const { body } = render(Fixture, {
			props: {
				navigation: Array.from({ length: 7 }, (_, index) => ({
					label: `Substituted navigation ${index + 1}`,
					href: `#substituted-${index + 1}`
				})),
				contact: { label: 'Substituted contact', href: 'mailto:fixture@example.test' },
				socialLinks: [],
				legalLinks: [],
				disclaimer: ['Substituted disclaimer one', 'Substituted disclaimer two']
			}
		});

		expect(body).toContain('Substituted navigation 7');
		expect(body).toContain('mailto:fixture@example.test');
		expect(body).toContain('Substituted disclaimer one');
		expect(body).toContain('Substituted disclaimer two');
		expect(body).not.toContain(footer.disclaimer[0]);
	});

	it('keeps component styles token-only and gives Header the fixed shared-height contract', () => {
		for (const source of [headerSource, footerSource]) {
			expect(source).not.toMatch(/#[0-9a-f]{3,8}\b|\brgba?\(/i);
		}

		expect(headerSource).toContain('position: fixed');
		expect(headerSource).toContain('block-size: var(--ds-header-height)');
		expect(headerSource).toContain('--ds-header-focus-color');
		expect(headerSource).not.toContain(site.navigation[0].label);
		expect(footerSource).toContain('color: var(--ds-footer-fallback-color)');
		expect(footerSource).not.toContain(footer.disclaimer[0]);
	});
});
