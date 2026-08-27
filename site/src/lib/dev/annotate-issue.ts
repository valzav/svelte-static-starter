import { site } from '$lib/content/site';

// Pure issue builder for the staging annotate overlay (ADR-0007). No DOM access, so
// unit tests cover it without a browser; `annotate.ts` owns the DOM side.

export interface AnnotationTarget {
	/** Svelte source path relative to `site/`, as the compiler records it (`src/...`). */
	file: string;
	line: number;
	column: number;
	/** Component chain from the page root to the component that renders the element. */
	components: string[];
	tag: string;
	id: string | null;
	/** Whitespace-collapsed text excerpt of the element. */
	text: string;
	/** Index among elements that share the same source location, in document order. */
	occurrence: number;
}

export interface Annotation {
	id: string;
	createdAt: string;
	page: string;
	target: AnnotationTarget;
	comment: string;
}

export const REPO = site.repo;

/**
 * Longest prefilled `issues/new` URL the overlay opens. Measured 2026-08-23: GitHub accepts a
 * 6859-character URL and answers 6959 with HTTP 500 (ADR-0007).
 */
export const ISSUE_URL_LIMIT = 6800;

export const PASTE_NOTE =
	'The annotation list was too long for a prefilled form. It is on your clipboard: paste it here.';

export function issueTitle(annotations: Annotation[], submitter: string): string {
	const count = annotations.length === 1 ? '1 annotation' : `${annotations.length} annotations`;
	return `Change request (${submitter}): ${count}`;
}

/**
 * Compact Markdown: the prefilled URL carries the body form-encoded, where `#`, `/`, `:`, backticks,
 * and newlines cost three characters each and typographic quotes and arrows nine, so the body
 * uses plain ASCII, no labels, and no blank lines inside an annotation.
 */
export function issueBody(annotations: Annotation[], pageUrl: string): string {
	const sections = annotations.map((annotation, index) => {
		const { target } = annotation;
		const chain = target.components.length > 0 ? target.components.join(' > ') : '(no component)';
		const element = `${target.tag}${target.id ? `#${target.id}` : ''}`;
		const excerpt = target.text ? ` "${target.text}"` : '';
		return [
			`${index + 1}. ${chain}`,
			`${target.file}:${target.line}:${target.column}`,
			`${element}${excerpt}`,
			annotation.comment.trim()
		].join('\n');
	});
	return [pageUrl, ...sections].join('\n\n');
}

export interface NewIssueUrl {
	url: string;
	/** False when the body exceeded `ISSUE_URL_LIMIT` and the paste note replaced it. */
	bodyIncluded: boolean;
}

export function newIssueUrl(title: string, body: string): NewIssueUrl {
	const withBody = prefilledUrl(title, body);
	if (withBody.length <= ISSUE_URL_LIMIT) return { url: withBody, bodyIncluded: true };
	return { url: prefilledUrl(title, PASTE_NOTE), bodyIncluded: false };
}

function prefilledUrl(title: string, body: string): string {
	const params = new URLSearchParams({ title, body });
	return `https://github.com/${REPO}/issues/new?${params}`;
}
