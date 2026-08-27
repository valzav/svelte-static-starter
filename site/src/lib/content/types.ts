/**
 * 'generated' marks replace-me draft copy: written by an assistant from approved context,
 * rendered on staging, and reported by `pnpm content:check` until an operator approves it.
 */
export type Status = 'approved' | 'stub' | 'generated';

export interface ApprovedLink {
	label: string;
	href: string;
	status: 'approved';
}

export interface StubLink {
	label: string;
	href?: undefined;
	status: 'stub';
}

export type Link = ApprovedLink | StubLink;

export interface Metric {
	value: string;
	label: string;
	disclosure?: string;
}

export interface Column {
	title: string;
	body?: string;
}

export interface FaqItem {
	question: string;
	answer: string;
	status: Status;
}

export interface LogoEntry {
	name: string;
	count?: number;
	logo?: string;
	status: Status;
}

export type ContentInventory = Record<string, unknown>;
