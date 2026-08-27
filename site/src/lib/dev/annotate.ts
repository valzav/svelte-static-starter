// Staging-only annotate overlay (ADR-0007). It lives in a shadow root under `#ds-annotate`, reads the
// Svelte development metadata the staging build attaches to every element, and never changes the
// page itself. The production build drops this module as dead code (`__DS_ANNOTATE__`).
import {
	type Annotation,
	type AnnotationTarget,
	issueBody,
	issueTitle,
	newIssueUrl
} from './annotate-issue';

const HOST_ID = 'ds-annotate';
const STORAGE_KEY = 'ds-annotate';
const NAME_KEY = 'ds-annotate-name';
const EXCERPT_LENGTH = 80;

// Shape of the metadata Svelte assigns in development mode (svelte/internal/client/dev).
interface DevStackEntry {
	type: string;
	file: string;
	line: number;
	column: number;
	componentTag?: string;
	parent: DevStackEntry | null;
}

interface SvelteMeta {
	loc: { file: string; line: number; column: number };
	parent: DevStackEntry | null;
}

function metaOf(element: Element): SvelteMeta | undefined {
	return (element as Element & { __svelte_meta?: SvelteMeta }).__svelte_meta;
}

/** The element itself when it carries metadata, else its nearest ancestor that does. */
function sourceElement(element: Element | null): Element | null {
	for (let node = element; node; node = node.parentElement) {
		if (metaOf(node)) return node;
	}
	return null;
}

/**
 * Component names from the page root down to the component that renders the element. Entries
 * from SvelteKit's generated root (`.svelte-kit/generated/root.svelte`) are internals, not site
 * components, so they are left out.
 */
function componentChain(meta: SvelteMeta): string[] {
	const chain: string[] = [];
	for (let entry = meta.parent; entry; entry = entry.parent) {
		if (entry.type !== 'component' || !entry.componentTag) continue;
		if (entry.file.startsWith('.svelte-kit/')) continue;
		chain.unshift(entry.componentTag);
	}
	return chain;
}

function sameLocation(a: SvelteMeta['loc'], b: AnnotationTarget): boolean {
	return a.file === b.file && a.line === b.line && a.column === b.column;
}

function describe(element: Element): AnnotationTarget {
	const meta = metaOf(element) as SvelteMeta;
	const target: AnnotationTarget = {
		file: meta.loc.file,
		line: meta.loc.line,
		column: meta.loc.column,
		components: componentChain(meta),
		tag: element.tagName.toLowerCase(),
		id: element.id || null,
		text: (element.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, EXCERPT_LENGTH),
		occurrence: 0
	};
	for (const candidate of document.querySelectorAll('*')) {
		if (candidate === element) break;
		const loc = metaOf(candidate)?.loc;
		if (loc && sameLocation(loc, target)) target.occurrence += 1;
	}
	return target;
}

function findElement(target: AnnotationTarget): Element | null {
	let seen = 0;
	for (const candidate of document.querySelectorAll('*')) {
		const loc = metaOf(candidate)?.loc;
		if (!loc || !sameLocation(loc, target)) continue;
		if (seen === target.occurrence) return candidate;
		seen += 1;
	}
	return null;
}

function loadAnnotations(): Annotation[] {
	try {
		const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
		return Array.isArray(parsed) ? (parsed as Annotation[]) : [];
	} catch {
		return [];
	}
}

function saveAnnotations(annotations: Annotation[]): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations));
}

/** Submitter name for the issue title; asked once and kept in localStorage. */
function loadName(): string {
	return (localStorage.getItem(NAME_KEY) ?? '').trim();
}

function newId(): string {
	return typeof crypto.randomUUID === 'function'
		? crypto.randomUUID()
		: `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sourceLabel(target: AnnotationTarget): string {
	const file = target.file.split('/').pop() ?? target.file;
	return `${file}:${target.line}`;
}

const STYLES = `
	:host {
		all: initial;
		position: fixed;
		inset: 0;
		z-index: 2147483647;
		pointer-events: none;
		font: 13px/1.4 system-ui, -apple-system, sans-serif;
		color: #1b1b1b;
	}
	* { box-sizing: border-box; }
	[hidden] { display: none !important; }
	button {
		font: inherit;
		cursor: pointer;
		border: 1px solid #c9c9c9;
		border-radius: 6px;
		background: #fff;
		color: inherit;
		padding: 4px 10px;
	}
	button.primary { background: #1f4fd1; border-color: #1f4fd1; color: #fff; }
	.toggle {
		pointer-events: auto;
		position: absolute;
		right: 16px;
		bottom: 16px;
		width: 44px;
		height: 44px;
		padding: 0;
		border-radius: 50%;
		font-size: 20px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}
	.toggle[aria-pressed='true'] { background: #1f4fd1; border-color: #1f4fd1; color: #fff; }
	.count {
		position: absolute;
		top: -6px;
		right: -6px;
		min-width: 20px;
		height: 20px;
		padding: 0 6px;
		border-radius: 10px;
		background: #d13b1f;
		color: #fff;
		font-size: 12px;
		line-height: 20px;
		text-align: center;
	}
	.box {
		position: absolute;
		outline: 2px solid #1f4fd1;
		outline-offset: 1px;
		background: rgba(31, 79, 209, 0.08);
	}
	.marker {
		pointer-events: auto;
		position: absolute;
		transform: translate(-50%, -50%);
		min-width: 22px;
		height: 22px;
		padding: 0 6px;
		border-radius: 11px;
		background: #d13b1f;
		color: #fff;
		font-size: 12px;
		font-weight: 700;
		line-height: 22px;
		text-align: center;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
	}
	.panel {
		pointer-events: auto;
		position: absolute;
		right: 16px;
		bottom: 72px;
		width: min(360px, calc(100vw - 32px));
		max-height: calc(100vh - 96px);
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 12px;
		border-radius: 8px;
		background: #fff;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
	}
	.hint { color: #666; }
	.form, .name, .tools { display: flex; flex-direction: column; gap: 6px; }
	.name label { display: flex; flex-direction: column; gap: 4px; }
	input { font: inherit; padding: 6px; border: 1px solid #c9c9c9; border-radius: 6px; }
	.target { font-family: ui-monospace, monospace; font-size: 12px; color: #444; }
	textarea { font: inherit; min-height: 72px; padding: 6px; border: 1px solid #c9c9c9; border-radius: 6px; resize: vertical; }
	.row { display: flex; gap: 6px; }
	.list { margin: 0; padding: 0; list-style: none; overflow: auto; display: flex; flex-direction: column; gap: 6px; }
	.list li { display: grid; grid-template-columns: 24px 1fr auto; gap: 6px; align-items: start; padding: 6px; border: 1px solid #e5e5e5; border-radius: 6px; }
	.list .num { font-weight: 700; color: #d13b1f; }
	.list .meta { font-family: ui-monospace, monospace; font-size: 11px; color: #666; }
	.list .comment { white-space: pre-wrap; }
	.status { color: #444; min-height: 1.4em; }
`;

export function mount(): void {
	if (document.getElementById(HOST_ID)) return;

	const host = document.createElement('div');
	host.id = HOST_ID;
	const root = host.attachShadow({ mode: 'open' });
	root.innerHTML = `
		<style>${STYLES}</style>
		<div class="box" hidden></div>
		<div class="markers"></div>
		<aside class="panel" hidden aria-label="Annotations">
			<div><strong>Annotate</strong> <span class="hint">Click an element to comment. Esc exits.</span></div>
			<form class="name" hidden>
				<label>Your name, for the issue title <input name="name" required autocomplete="name"></label>
				<div class="row"><button type="submit" class="primary">Continue</button></div>
			</form>
			<div class="tools" hidden>
			<form class="form" hidden>
				<div class="target"></div>
				<textarea placeholder="What should change here?" required></textarea>
				<div class="row">
					<button type="submit" class="primary">Save</button>
					<button type="button" data-action="cancel">Cancel</button>
				</div>
			</form>
			<ol class="list"></ol>
			<div class="row">
				<button type="button" class="primary" data-action="issue">Create issue</button>
				<button type="button" data-action="clear">Clear all</button>
			</div>
			<div class="status" aria-live="polite"></div>
			</div>
		</aside>
		<button type="button" class="toggle" aria-pressed="false" aria-label="Annotate this page">✎<span class="count" hidden></span></button>
	`;

	const query = <T extends Element>(selector: string) => root.querySelector(selector) as T;
	const box = query<HTMLDivElement>('.box');
	const markers = query<HTMLDivElement>('.markers');
	const panel = query<HTMLElement>('.panel');
	const nameForm = query<HTMLFormElement>('.name');
	const nameInput = query<HTMLInputElement>('.name input');
	const tools = query<HTMLDivElement>('.tools');
	const form = query<HTMLFormElement>('.form');
	const targetLabel = query<HTMLDivElement>('.target');
	const textarea = query<HTMLTextAreaElement>('textarea');
	const list = query<HTMLOListElement>('.list');
	const status = query<HTMLDivElement>('.status');
	const toggle = query<HTMLButtonElement>('.toggle');
	const count = query<HTMLSpanElement>('.count');

	let annotations = loadAnnotations();
	let submitter = loadName();
	let active = false;
	let pending: Element | null = null;

	function isOverlay(event: Event): boolean {
		return event.composedPath().includes(host);
	}

	function place(element: HTMLElement, rect: DOMRect): void {
		element.style.left = `${rect.left}px`;
		element.style.top = `${rect.top}px`;
		element.style.width = `${rect.width}px`;
		element.style.height = `${rect.height}px`;
	}

	function renderMarkers(): void {
		markers.replaceChildren();
		if (!active) return;
		annotations.forEach((annotation, index) => {
			const rect = findElement(annotation.target)?.getBoundingClientRect();
			if (!rect || (rect.width === 0 && rect.height === 0)) return;
			const marker = document.createElement('span');
			marker.className = 'marker';
			marker.textContent = String(index + 1);
			marker.style.left = `${rect.left}px`;
			marker.style.top = `${rect.top}px`;
			markers.append(marker);
		});
	}

	function renderList(): void {
		count.textContent = String(annotations.length);
		count.hidden = annotations.length === 0;
		list.replaceChildren(
			...annotations.map((annotation, index) => {
				const item = document.createElement('li');
				const num = document.createElement('span');
				num.className = 'num';
				num.textContent = String(index + 1);
				const body = document.createElement('div');
				const meta = document.createElement('div');
				meta.className = 'meta';
				meta.textContent = `${annotation.target.components.join(' › ')} · <${annotation.target.tag}> · ${sourceLabel(annotation.target)}`;
				const comment = document.createElement('div');
				comment.className = 'comment';
				comment.textContent = annotation.comment;
				body.append(meta, comment);
				const remove = document.createElement('button');
				remove.type = 'button';
				remove.textContent = '×';
				remove.setAttribute('aria-label', `Delete annotation ${index + 1}`);
				remove.addEventListener('click', () => {
					annotations = annotations.filter((candidate) => candidate.id !== annotation.id);
					persist();
				});
				item.append(num, body, remove);
				return item;
			})
		);
		renderMarkers();
	}

	function persist(): void {
		saveAnnotations(annotations);
		renderList();
	}

	function closeForm(): void {
		pending = null;
		form.hidden = true;
		form.reset();
	}

	function openForm(element: Element): void {
		pending = element;
		const target = describe(element);
		targetLabel.textContent = `<${target.tag}> in ${target.components.join(' › ') || '(no component)'} — ${sourceLabel(target)}`;
		form.hidden = false;
		textarea.focus();
	}

	function onMove(event: MouseEvent): void {
		if (isOverlay(event) || !submitter) {
			box.hidden = true;
			return;
		}
		const element = sourceElement(event.target as Element | null);
		if (!element) {
			box.hidden = true;
			return;
		}
		place(box, element.getBoundingClientRect());
		box.hidden = false;
	}

	function onClick(event: MouseEvent): void {
		if (isOverlay(event)) return;
		// Capture phase on the document: stops navigation, native toggles, and the page's handlers.
		event.preventDefault();
		event.stopPropagation();
		if (!submitter) return;
		const element = sourceElement(event.target as Element | null);
		if (element) openForm(element);
	}

	// A middle click fires `auxclick`, not `click`, and its default action opens the link in a new
	// tab; suppress it the same way without opening the form.
	function onAuxClick(event: MouseEvent): void {
		if (isOverlay(event)) return;
		event.preventDefault();
		event.stopPropagation();
	}

	function onKey(event: KeyboardEvent): void {
		if (event.key !== 'Escape') return;
		event.preventDefault();
		if (pending) closeForm();
		else setActive(false);
	}

	/** Page capture and the tools wait until the submitter name is known. */
	function showTools(): void {
		const named = submitter !== '';
		nameForm.hidden = named;
		tools.hidden = !named;
		if (!named) nameInput.focus();
	}

	function setActive(next: boolean): void {
		active = next;
		toggle.setAttribute('aria-pressed', String(active));
		panel.hidden = !active;
		box.hidden = true;
		status.textContent = '';
		closeForm();
		if (active) showTools();
		const method = active ? 'addEventListener' : 'removeEventListener';
		document[method]('mousemove', onMove as EventListener, true);
		document[method]('click', onClick as EventListener, true);
		document[method]('auxclick', onAuxClick as EventListener, true);
		document[method]('keydown', onKey as EventListener, true);
		window[method]('scroll', renderMarkers, true);
		window[method]('resize', renderMarkers);
		renderMarkers();
	}

	toggle.addEventListener('click', () => setActive(!active));

	nameForm.addEventListener('submit', (event) => {
		event.preventDefault();
		const name = nameInput.value.trim();
		if (!name) {
			nameInput.focus();
			return;
		}
		submitter = name;
		localStorage.setItem(NAME_KEY, name);
		showTools();
	});

	form.addEventListener('submit', (event) => {
		event.preventDefault();
		if (!pending) return;
		// Native `required` accepts whitespace; an annotation without a request is useless in the
		// issue, so keep the form open instead.
		const comment = textarea.value.trim();
		if (!comment) {
			textarea.focus();
			return;
		}
		annotations = [
			...annotations,
			{
				id: newId(),
				createdAt: new Date().toISOString(),
				page: location.origin + location.pathname,
				target: describe(pending),
				comment
			}
		];
		closeForm();
		persist();
	});

	panel.addEventListener('click', async (event) => {
		const action = (event.target as HTMLElement).closest<HTMLElement>('[data-action]')?.dataset
			.action;
		if (action === 'cancel') closeForm();
		if (action === 'clear') {
			annotations = [];
			persist();
		}
		if (action === 'issue') {
			if (annotations.length === 0) {
				status.textContent = 'Add at least one annotation first.';
				return;
			}
			const body = issueBody(annotations, location.origin + location.pathname);
			const title = issueTitle(annotations, submitter);
			let copied = true;
			try {
				await navigator.clipboard.writeText(body);
			} catch {
				copied = false;
			}
			const issue = newIssueUrl(title, body);
			window.open(issue.url, '_blank', 'noopener');
			status.textContent = issue.bodyIncluded
				? `GitHub form opened with ${annotations.length} annotation(s)${copied ? '; body also copied' : ''}.`
				: copied
					? 'Too long for a prefilled form: the body is on your clipboard, paste it into the form.'
					: 'Too long for a prefilled form and the clipboard is unavailable: shorten the comments.';
		}
	});

	document.body.append(host);
	renderList();
}
