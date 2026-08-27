import { describe, expect, it } from 'vitest';
import {
	ISSUE_URL_LIMIT,
	PASTE_NOTE,
	issueBody,
	issueTitle,
	newIssueUrl,
	type Annotation
} from '../../src/lib/dev/annotate-issue';

// ADR-0007: the issue builder is pure, so the body format, the prefilled URL, and the
// measured length cap are proved here; the browser side is tests/e2e/annotate.spec.ts.

function annotation(overrides: Partial<Annotation> = {}): Annotation {
	return {
		id: 'a1',
		createdAt: '2026-08-23T10:00:00.000Z',
		page: 'https://dev.example.com/',
		target: {
			file: 'src/lib/components/sections/Hero.svelte',
			line: 20,
			column: 2,
			components: ['Reveal', 'Hero', 'Section'],
			tag: 'h1',
			id: null,
			text: 'Your trusted partner',
			occurrence: 0
		},
		comment: 'Shorter headline\nAdd a subheading',
		...overrides
	};
}

describe('issue builder (ADR-0007)', () => {
	it('titles the issue with the submitter and annotation count', () => {
		expect(issueTitle([annotation()], 'Val')).toBe('Change request (Val): 1 annotation');
		expect(issueTitle([annotation(), annotation({ id: 'a2' })], 'Val')).toBe(
			'Change request (Val): 2 annotations'
		);
	});

	it('lists every annotation with source, component chain, element, and request', () => {
		const body = issueBody(
			[
				annotation(),
				annotation({
					id: 'a2',
					target: {
						file: 'src/lib/components/layout/Header.svelte',
						line: 26,
						column: 9,
						components: ['Header'],
						tag: 'a',
						id: 'contact',
						text: 'Contact',
						occurrence: 2
					},
					comment: 'Rename to "Get in touch"'
				})
			],
			'https://dev.example.com/'
		);

		expect(body).toBe(
			[
				'https://dev.example.com/',
				'',
				'1. Reveal > Hero > Section',
				'src/lib/components/sections/Hero.svelte:20:2',
				'h1 "Your trusted partner"',
				'Shorter headline',
				'Add a subheading',
				'',
				'2. Header',
				'src/lib/components/layout/Header.svelte:26:9',
				'a#contact "Contact"',
				'Rename to "Get in touch"'
			].join('\n')
		);
	});

	it('names the missing chain and omits an empty excerpt', () => {
		const body = issueBody(
			[annotation({ target: { ...annotation().target, components: [], text: '' } })],
			'https://dev.example.com/'
		);
		expect(body).toContain('1. (no component)');
		expect(body).toContain('\nh1\n');
	});
});

describe('prefilled issue URL (ADR-0007)', () => {
	it('targets the repository form with an encoded title and body', () => {
		const { url, bodyIncluded } = newIssueUrl('Title: a & b', '# Body\n\n> Комментарий');
		expect(bodyIncluded).toBe(true);
		const parsed = new URL(url);
		expect(parsed.origin + parsed.pathname).toBe('https://github.com/OWNER/REPO/issues/new');
		expect(parsed.searchParams.get('title')).toBe('Title: a & b');
		expect(parsed.searchParams.get('body')).toBe('# Body\n\n> Комментарий');
	});

	it('keeps the URL within the measured limit', () => {
		const body = 'x'.repeat(ISSUE_URL_LIMIT - 200);
		const fits = newIssueUrl('t', body);
		expect(fits.bodyIncluded).toBe(true);
		expect(fits.url.length).toBeLessThanOrEqual(ISSUE_URL_LIMIT);
	});

	it('replaces an over-limit body with the paste note', () => {
		const { url, bodyIncluded } = newIssueUrl('t', 'x'.repeat(ISSUE_URL_LIMIT));
		expect(bodyIncluded).toBe(false);
		expect(url.length).toBeLessThanOrEqual(ISSUE_URL_LIMIT);
		expect(new URL(url).searchParams.get('body')).toBe(PASTE_NOTE);
		expect(new URL(url).searchParams.get('title')).toBe('t');
	});
});
