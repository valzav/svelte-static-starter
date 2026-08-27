import type { FaqItem } from './types';

export const faq = [
	{
		question: 'Where does the copy on this page come from?',
		answer:
			'Every headline, list, number, link, and asset reference lives in src/lib/content/. Components hold no literal copy, so text changes never touch markup.',
		status: 'approved'
	},
	{
		question: 'What stops unfinished copy from being published?',
		answer:
			'Any entry marked status: stub or status: generated, and any link without a URL, is reported by pnpm content:check, which exits non-zero. Wire it into the production build to gate publishing.',
		status: 'approved'
	},
	{
		question: 'Does this work without JavaScript?',
		answer:
			'Yes. The page is prerendered and every control is a native element. This accordion is details/summary, so it opens with JavaScript disabled and under reduced motion.',
		status: 'approved'
	}
] satisfies FaqItem[];
