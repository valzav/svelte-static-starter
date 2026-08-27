import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { ContentInventory } from '../src/lib/content/types';

export type ReportingSink = (finding: string) => void;

function isLink(item: Record<string, unknown>): boolean {
	return typeof item.label === 'string' && (item.status === 'approved' || item.status === 'stub');
}

function collectFindings(value: unknown, path: string, findings: string[]): void {
	if (Array.isArray(value)) {
		value.forEach((item, index) => collectFindings(item, `${path}[${index}]`, findings));
		return;
	}

	if (typeof value !== 'object' || value === null) {
		return;
	}

	const item = value as Record<string, unknown>;
	if (item.status === 'stub') {
		findings.push(`${path}: stub content`);
	}

	if (item.status === 'generated') {
		findings.push(`${path}: generated content (replace-me)`);
	}

	if (isLink(item) && (typeof item.href !== 'string' || item.href.trim().length === 0)) {
		findings.push(`${path}: missing URL for ${item.label}`);
	}

	Object.entries(item).forEach(([key, child]) =>
		collectFindings(child, `${path}.${key}`, findings)
	);
}

export function runContentCheck(inventory: ContentInventory, report: ReportingSink): 0 | 1 {
	const findings: string[] = [];
	collectFindings(inventory, 'content', findings);
	findings.forEach(report);
	return findings.length === 0 ? 0 : 1;
}

const invokedPath = process.argv[1];
if (invokedPath && import.meta.url === pathToFileURL(resolve(invokedPath)).href) {
	const { createServer } = await import('vite');
	const server = await createServer({ appType: 'custom', server: { middlewareMode: true } });

	try {
		const { content } = (await server.ssrLoadModule('/src/lib/content/index.ts')) as {
			content: ContentInventory;
		};
		process.exitCode = runContentCheck(content, (finding) => console.error(finding));
	} finally {
		await server.close();
	}
}
