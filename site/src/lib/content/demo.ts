import placeholderMark from '../assets/logos/mark-placeholder.svg?no-inline';
import type { Column, LogoEntry, Metric } from './types';

/** Copy for the starter's demo page. Delete this module once real sections exist. */
export const demo = {
	hero: {
		kicker: 'SvelteKit · prerendered · zero runtime dependencies',
		title: 'A static starter that fails the build before it ships something broken.',
		lead: 'Layered design tokens, a typed content model with a publish gate, a staging-only annotate overlay, and a test harness that renders components on the server.'
	},
	primitives: {
		title: 'Primitives',
		lead: 'Every component below reads --ds-* tokens only. No component contains a raw color, size, or font — an end-to-end test asserts it.',
		pills: ['Tokens only', 'No JavaScript required', 'Reduced motion safe'],
		cards: [
			{
				title: 'Prerendered',
				body: 'adapter-static with prerender = true. A broken #anchor or missing asset fails the build instead of shipping.'
			},
			{
				title: 'Typed content',
				body: 'Copy lives in modules, not markup. pnpm content:check walks the inventory and reports every stub and URL-less link.'
			},
			{
				title: 'Two environments',
				body: 'Anything but PUBLIC_SITE_ENV=production is staging: noindex meta, a disallowing robots.txt, and the annotate overlay.'
			}
		] satisfies Column[]
	},
	columns: [
		{ title: 'Design tokens', body: 'Primitive, semantic, and component layers in one file.' },
		{
			title: 'Server-rendered tests',
			body: 'Vitest renders components with svelte/server — no DOM needed.'
		},
		{
			title: 'Browser tests',
			body: 'Playwright drives the real build plus isolated component fixtures.'
		}
	] satisfies Column[],
	metrics: {
		title: 'Metrics',
		lead: 'Values count up on scroll, and render at their final value with JavaScript off or reduced motion on.',
		items: [
			{ value: '0', label: 'Runtime dependencies' },
			{ value: '228', label: 'Design tokens' },
			{ value: '12', label: 'UI primitives' },
			{
				value: '100%',
				label: 'Prerendered routes*',
				disclosure: 'Every route is static at build time.'
			}
		] satisfies Metric[]
	},
	marks: {
		title: 'Marks',
		lead: 'LogoGrid tints monochrome SVG marks with a CSS mask, so one asset works on either theme.',
		entries: [
			{ name: 'Acme', logo: placeholderMark, status: 'approved' },
			{ name: 'Initech', logo: placeholderMark, status: 'approved' },
			{ name: 'Umbrella', logo: placeholderMark, status: 'approved' },
			{ name: 'Globex', logo: placeholderMark, status: 'approved' }
		] satisfies LogoEntry[]
	},
	questions: {
		title: 'Questions',
		lead: 'Accordion is native details/summary, so it works with JavaScript disabled.'
	},
	closing: {
		title: 'Start here',
		lead: 'Replace src/lib/content/, swap the palette values in tokens.css, and delete the demo module.'
	}
} as const;
