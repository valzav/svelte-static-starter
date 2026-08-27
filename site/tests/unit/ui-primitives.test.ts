import { readFile, readdir } from 'node:fs/promises';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import ActionLink from '../../src/lib/components/ui/ActionLink.svelte';
import ContentCard from '../../src/lib/components/ui/ContentCard.svelte';
import ColumnList from '../../src/lib/components/ui/ColumnList.svelte';
import Metric from '../../src/lib/components/ui/Metric.svelte';
import Section from '../../src/lib/components/ui/Section.svelte';
import Fixture from '../fixtures/ui-primitives.svelte';

describe('UI primitives', () => {
	it('renders supplied section values, slot content, and light-theme opt-in', () => {
		const { body } = render(Section, {
			props: {
				id: 'values',
				kicker: 'Why tokens',
				title: 'Choose with care',
				lead: 'Built for patient capital.',
				theme: 'light'
			}
		});

		expect(body).toMatch(/<section[^>]*id="values"[^>]*data-theme="light"/);
		expect(body).toContain('Why tokens');
		expect(body).toMatch(/<h2[^>]*>Choose with care<\/h2>/);
		expect(body).toContain('Built for patient capital.');
		expect(render(Section, { props: { id: 'hero' } }).body).not.toContain('data-theme=');
		expect(render(Section, { props: { id: 'hero', title: 'Top', level: 1 } }).body).toMatch(
			/<h1[^>]*>Top<\/h1>/
		);
		expect(render(Fixture).body).toContain('Section content');
		expect(render(Fixture).body).toContain('Early stage');
	});

	it('renders navigation as anchors and adds noopener only to external URLs', () => {
		const external = render(ActionLink, {
			props: { href: 'https://example.com', variant: 'primary' }
		}).body;
		const fragment = render(ActionLink, {
			props: { href: '#diversification', variant: 'secondary' }
		}).body;
		const mailto = render(ActionLink, {
			props: { href: 'mailto:hello@example.com', variant: 'link' }
		}).body;
		const protocolRelative = render(ActionLink, {
			props: { href: '//example.com', variant: 'primary' }
		}).body;
		const uppercaseHttps = render(ActionLink, {
			props: { href: 'HTTPS://example.com', variant: 'primary' }
		}).body;
		const whitespacePrefixedHttps = render(ActionLink, {
			props: { href: ' \tHTTPS://example.com', variant: 'primary' }
		}).body;

		expect(external).toContain('href="https://example.com"');
		expect(external).toMatch(/<a\b/);
		expect(external).not.toMatch(/<button\b/);
		expect(external).toMatch(/class="[^"]*\bprimary\b/);
		expect(external).toContain('rel="noopener"');
		expect(fragment).toContain('href="#diversification"');
		expect(fragment).not.toContain('rel=');
		expect(mailto).toContain('href="mailto:hello@example.com"');
		expect(mailto).toMatch(/class="[^"]*\blink\b/);
		expect(mailto).not.toContain('rel=');
		expect(protocolRelative).toContain('rel="noopener"');
		expect(uppercaseHttps).toContain('rel="noopener"');
		expect(whitespacePrefixedHttps).toContain('href=" \tHTTPS://example.com"');
		expect(whitespacePrefixedHttps).toContain('rel="noopener"');
	});

	it('uses component tokens for the previously direct primitive style values', async () => {
		const [section, actionLink, pill] = await Promise.all(
			['Section.svelte', 'ActionLink.svelte', 'Pill.svelte'].map((file) =>
				readFile(new URL(`../../src/lib/components/ui/${file}`, import.meta.url), 'utf8')
			)
		);

		expect(section).toContain('letter-spacing: var(--ds-section-kicker-letter-spacing);');
		expect(section).not.toContain('letter-spacing: 0.04em;');
		expect(pill).toContain('letter-spacing: var(--ds-pill-letter-spacing);');
		expect(pill).not.toContain('letter-spacing: 0.04em;');
		expect(actionLink).toContain('opacity: var(--ds-action-link-hover-opacity);');
		expect(actionLink).not.toContain('opacity: 0.9;');
	});

	it('renders independently meaningful content as articles and supplied presentational values', () => {
		const contentCard = render(ContentCard, {
			props: { title: 'Direct access', body: 'Review every opportunity.' }
		}).body;
		const metric = render(Metric, { props: { value: '90+', label: 'investments' } }).body;
		const columns = render(ColumnList, {
			props: {
				items: [{ title: 'Diligence', body: 'Know what matters.' }, { title: 'Community' }],
				layout: 'three-column'
			}
		}).body;

		expect(contentCard).toMatch(/<article\b/);
		expect(contentCard).toMatch(/<h3[^>]*>Direct access<\/h3>/);
		expect(contentCard).toMatch(/<p[^>]*>Review every opportunity.<\/p>/);
		expect(metric).toContain('90+');
		expect(metric).toContain('investments');
		expect(columns).toContain('Diligence');
		expect(columns).toContain('Know what matters.');
		expect(columns).toContain('Community');
		expect(columns).toMatch(/class="[^"]*\bcolumns\b[^"]*\bthree-column\b/);
	});

	it('renders ContentCard children without an empty body paragraph', () => {
		const fixture = render(Fixture).body;
		const contentCard = fixture.slice(
			fixture.indexOf('<article'),
			fixture.indexOf('</article>') + 10
		);

		expect(contentCard).toMatch(/<h3[^>]*>A structured article<\/h3>/);
		expect(contentCard).toMatch(/<ul><li>First supplied item<\/li><\/ul>/);
		expect(contentCard).toContain('First supplied item');
		expect(contentCard).not.toContain('<p>');
	});

	it('exposes semantic component names without obsolete Button or Card paths', async () => {
		const components = await readdir(new URL('../../src/lib/components/ui/', import.meta.url));

		expect(components).toContain('ActionLink.svelte');
		expect(components).toContain('ContentCard.svelte');
		expect(components).not.toContain('Button.svelte');
		expect(components).not.toContain('Card.svelte');
	});

	it('shares the semantic interactive target without coupling other controls to ActionLink', async () => {
		const [tokens, header, footer, accordionItem] = await Promise.all([
			readFile(new URL('../../src/lib/styles/tokens.css', import.meta.url), 'utf8'),
			readFile(new URL('../../src/lib/components/layout/Header.svelte', import.meta.url), 'utf8'),
			readFile(new URL('../../src/lib/components/layout/Footer.svelte', import.meta.url), 'utf8'),
			readFile(new URL('../../src/lib/components/ui/AccordionItem.svelte', import.meta.url), 'utf8')
		]);

		expect(tokens).toContain('--ds-action-link-min-target: var(--ds-interactive-min-target);');
		expect(tokens).toContain('--ds-header-interactive-height: var(--ds-interactive-min-target);');
		expect(tokens).toContain(
			'--ds-footer-interactive-min-target: var(--ds-interactive-min-target);'
		);
		expect(tokens).toContain(
			'--ds-accordion-summary-min-target: var(--ds-interactive-min-target);'
		);
		expect(header).not.toContain('--ds-action-link-min-target');
		expect(footer).not.toContain('--ds-action-link-min-target');
		expect(accordionItem).not.toContain('--ds-action-link-min-target');
	});
});
