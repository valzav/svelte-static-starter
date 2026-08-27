import { describe, expect, it } from 'vitest';
import { runContentCheck } from '../../scripts/content-check';
import { content } from '../../src/lib/content';
import type { ContentInventory } from '../../src/lib/content/types';

describe('content publish gate', () => {
	it('passes the shipped inventory, which carries no stub or generated entry', () => {
		const findings: string[] = [];

		expect(runContentCheck(content, (finding) => findings.push(finding))).toBe(0);
		expect(findings).toEqual([]);
	});

	it('reports stub content, generated replace-me copy, and links without a URL', () => {
		const findings: string[] = [];
		const inventory: ContentInventory = {
			faq: [{ question: 'Draft?', answer: 'Yes.', status: 'generated' }],
			footer: {
				links: [
					{ label: 'Pending', status: 'stub' },
					{ label: 'Approved', href: 'https://example.com', status: 'approved' }
				]
			}
		};

		expect(runContentCheck(inventory, (finding) => findings.push(finding))).toBe(1);
		expect(findings).toEqual([
			'content.faq[0]: generated content (replace-me)',
			'content.footer.links[0]: stub content',
			'content.footer.links[0]: missing URL for Pending'
		]);
	});

	it('treats a whitespace-only URL on an approved link as missing', () => {
		const findings: string[] = [];
		const inventory: ContentInventory = {
			footer: { links: [{ label: 'Legal', href: '   ', status: 'approved' }] }
		};

		expect(runContentCheck(inventory, (finding) => findings.push(finding))).toBe(1);
		expect(findings).toEqual(['content.footer.links[0]: missing URL for Legal']);
	});
});
