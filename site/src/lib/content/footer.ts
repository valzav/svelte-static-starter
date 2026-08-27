import type { Link } from './types';

export const footer = {
	logo: { variant: 'full', theme: 'dark' },
	socialLinks: [
		{ label: 'GitHub', href: 'https://github.com', status: 'approved' }
	] satisfies Link[],
	legalLinks: [
		{ label: 'Privacy Policy', href: 'https://example.com/privacy', status: 'approved' },
		{ label: 'Terms', href: 'https://example.com/terms', status: 'approved' }
	] satisfies Link[],
	disclaimer: ['Replace this text. Every string on the page comes from src/lib/content/.']
} as const;
