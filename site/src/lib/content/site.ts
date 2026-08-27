import type { Link } from './types';

export const site = {
	title: 'Static Starter',
	url: 'https://example.com',
	// Replace before using the staging annotate overlay: it opens
	// https://github.com/<repo>/issues/new with the annotation body prefilled.
	repo: 'OWNER/REPO',
	contactHref: 'mailto:hello@example.com',
	favicon: 'favicon.svg',
	metaDescription:
		'A prerendered SvelteKit starter: layered design tokens, a typed content model with a publish gate, and a staging-only annotate overlay.',
	navigation: [
		{ label: 'Primitives', href: '#primitives', status: 'approved' },
		{ label: 'Metrics', href: '#metrics', status: 'approved' },
		{ label: 'Marks', href: '#marks', status: 'approved' },
		{ label: 'Questions', href: '#questions', status: 'approved' },
		{ label: 'Contact', href: 'mailto:hello@example.com', status: 'approved' }
	] satisfies Link[]
} as const;
