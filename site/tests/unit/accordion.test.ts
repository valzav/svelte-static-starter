import { readFile } from 'node:fs/promises';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import AccordionItem from '../../src/lib/components/ui/AccordionItem.svelte';
import { faq } from '../../src/lib/content/faq';
import Fixture from '../fixtures/accordion.svelte';

function detailsRecords(body: string) {
	return [...body.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/g)].map((match) => match[1]);
}

describe('Accordion', () => {
	it('server-renders every question and answer in order', () => {
		const records = detailsRecords(render(Fixture).body);

		expect(records).toHaveLength(faq.length);
		faq.forEach((item, index) => {
			expect(records[index]).toMatch(/<summary\b/);
			expect(records[index]).toContain(item.question);
			expect(records[index]).toContain(item.answer);
		});
	});

	// The shipped content is all approved, so the marker branch needs its own item.
	it('marks generated answers and leaves approved ones unmarked', () => {
		const generated = render(AccordionItem, {
			props: {
				item: { question: 'Q', answer: 'Draft copy', status: 'generated' },
				groupName: 'faq'
			}
		}).body;
		const approved = render(AccordionItem, {
			props: { item: { question: 'Q', answer: 'Final copy', status: 'approved' }, groupName: 'faq' }
		}).body;

		expect(generated).toContain('data-replace-me');
		expect(approved).not.toContain('data-replace-me');
	});

	it('uses native disclosure markup and token-only presentation styles', async () => {
		const [itemSource, accordionSource] = await Promise.all([
			readFile(
				new URL('../../src/lib/components/ui/AccordionItem.svelte', import.meta.url),
				'utf8'
			),
			readFile(new URL('../../src/lib/components/ui/Accordion.svelte', import.meta.url), 'utf8')
		]);

		expect(itemSource).toContain('<details name={groupName}>');
		expect(itemSource).toContain('<summary>');
		expect(itemSource).toContain('aria-hidden="true"');
		expect(itemSource).not.toMatch(
			/<summary[^>]*(?:\brole\b|\btabindex\b|aria-expanded|aria-controls)/
		);
		// The only status knowledge allowed is the replace-me marker for generated copy.
		expect(itemSource).toContain('data-replace-me');
		expect(itemSource).not.toMatch(/status\s*===\s*'stub'/);
		expect(itemSource).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(/i);
		expect(itemSource).toMatch(/var\(--ds-accordion-[\w-]+\)/);
		expect(accordionSource).toContain('<AccordionItem {item} groupName="faq" />');
	});
});
