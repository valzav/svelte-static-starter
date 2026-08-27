<script lang="ts">
	// The style guide is tooling, not product. Like `src/lib/dev/`, it keeps its own strings rather
	// than drawing them from `src/lib/content/` — there is no copy here to approve or translate.
	// It reads tokens.css directly, so it shows what the stylesheet actually contains.
	import Accordion from '$lib/components/ui/Accordion.svelte';
	import ActionLink from '$lib/components/ui/ActionLink.svelte';
	import ColumnList from '$lib/components/ui/ColumnList.svelte';
	import ContentCard from '$lib/components/ui/ContentCard.svelte';
	import Logo from '$lib/components/ui/Logo.svelte';
	import LogoGrid from '$lib/components/ui/LogoGrid.svelte';
	import Metric from '$lib/components/ui/Metric.svelte';
	import Pill from '$lib/components/ui/Pill.svelte';
	import Reveal from '$lib/components/ui/Reveal.svelte';
	import Section from '$lib/components/ui/Section.svelte';
	import placeholderMark from '$lib/assets/logos/mark-placeholder.svg?no-inline';
	import tokensCss from '$lib/styles/tokens.css?raw';
	import { byLayer, isColor, parseTokens, type Token } from '$lib/styles/tokens';
	import type { Column, FaqItem, LogoEntry } from '$lib/content/types';

	const tokens = parseTokens(tokensCss);
	const semantic = byLayer(tokens, 'semantic');
	const primitive = byLayer(tokens, 'primitive');

	const swatches = semantic.filter(isColor);
	const typeScale = primitive.filter((t) => t.name.includes('font-size'));
	const spacing = primitive.filter((t) => /--ds-space-\d/.test(t.name));
	const shape = primitive.filter((t) => /radius|border-width|shadow/.test(t.name));
	const motion = primitive.filter((t) => /duration|ease/.test(t.name));

	const themes = [
		{ name: 'dark', label: 'Dark — the default on :root' },
		{ name: 'light', label: "Light — [data-theme='light']" }
	] as const;

	const columns: Column[] = [
		{ title: 'First column', body: 'ColumnList takes items of equal weight.' },
		{ title: 'Second column', body: 'Three-column layout collapses on narrow viewports.' },
		{ title: 'Third column', body: 'Bodies are optional; titles are not.' }
	];

	const questions: FaqItem[] = [
		{
			question: 'Is this native markup?',
			answer: 'Yes — details and summary, so it opens with JavaScript disabled.',
			status: 'approved'
		},
		{
			question: 'What does a draft answer look like?',
			answer: 'Exactly like this one, but marked so the publish gate can find it.',
			status: 'generated'
		}
	];

	const marks: LogoEntry[] = [
		{ name: 'Acme', logo: placeholderMark, status: 'approved' },
		{ name: 'Initech', logo: placeholderMark, status: 'approved' },
		{ name: 'Globex', logo: placeholderMark, status: 'approved' }
	];

	// Data URIs and long gradients tell the reader nothing at full length.
	function short(value: string) {
		return value.length > 46 ? `${value.slice(0, 43)}…` : value;
	}

	function label(token: Token) {
		return token.name.replace('--ds-', '');
	}
</script>

<svelte:head>
	<title>Style guide</title>
</svelte:head>

<Section
	id="styleguide"
	level={1}
	kicker="Design system reference"
	title="Style guide"
	lead="Rendered from the real tokens and the real components, so it cannot drift. The rules and the reasoning live in design-system/README.md."
/>

<Section
	id="themes"
	title="Semantic roles"
	lead="Both themes, side by side. Only this layer changes between them."
>
	<div class="themes">
		{#each themes as theme (theme.name)}
			<div class="theme-panel" data-theme={theme.name === 'light' ? 'light' : undefined}>
				<p class="panel-label">{theme.label}</p>
				<ul class="swatches">
					{#each swatches as token (token.name)}
						<li>
							<span class="swatch" style:background="var({token.name})"></span>
							<span class="swatch-name">{label(token)}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
</Section>

<Section
	id="type"
	title="Type scale"
	lead="One family, seven sizes. Sizes step up at the 1024px breakpoint."
>
	<ul class="specimens">
		{#each typeScale as token (token.name)}
			<li>
				<span class="spec-meta">{label(token)} · {token.value}</span>
				<span class="spec" style:font-size="var({token.name})">Rendered at this size</span>
			</li>
		{/each}
	</ul>
</Section>

<Section id="scale" title="Spacing, shape, motion">
	<h3>Spacing</h3>
	<ul class="bars">
		{#each spacing as token (token.name)}
			<li>
				<span class="bar-name">{label(token)}</span>
				<span class="bar" style:inline-size="var({token.name})"></span>
				<span class="bar-value">{token.value}</span>
			</li>
		{/each}
	</ul>

	<h3>Shape and motion</h3>
	<div class="scroller">
		<table>
			<thead>
				<tr><th scope="col">Token</th><th scope="col">Value</th></tr>
			</thead>
			<tbody>
				{#each [...shape, ...motion] as token (token.name)}
					<tr><td>{label(token)}</td><td>{short(token.value)}</td></tr>
				{/each}
			</tbody>
		</table>
	</div>
</Section>

<Section
	id="components"
	title="Components"
	lead="Every primitive, rendered. Props and contracts are in design-system/README.md."
>
	<h3>ActionLink</h3>
	<div class="row">
		<ActionLink href="#components" variant="primary">Primary</ActionLink>
		<ActionLink href="#components" variant="secondary">Secondary</ActionLink>
		<ActionLink href="#components" variant="link">Inline link</ActionLink>
		<ActionLink href="https://example.com" variant="link">External, gets rel=noopener</ActionLink>
	</div>
	<div class="stacked">
		<ActionLink
			href="#components"
			variant="primary"
			layout="stacked"
			title="Stacked layout"
			description="A card-sized target with a title and a description."
		/>
	</div>

	<h3>Pill and Metric</h3>
	<div class="row"><Pill>Label</Pill><Pill>Another label</Pill></div>
	<div class="grid">
		<Metric value="228" label="Design tokens" />
		<Metric value="12" label="UI primitives" />
		<Metric
			value="100%"
			label="Prerendered routes*"
			disclosure="Every route is static at build time."
		/>
	</div>

	<h3>ContentCard and ColumnList</h3>
	<div class="grid">
		<ContentCard title="Plain card" body="A titled block with body copy." />
		<ContentCard title="Numbered card" body="Ordinals come from CSS counters." numbered />
	</div>
	<div class="stack"><ColumnList items={columns} layout="three-column" /></div>

	<h3>Accordion</h3>
	<Accordion items={questions} />

	<h3>Logo, LogoGrid and LogoTile</h3>
	<div class="row logos">
		<Logo variant="full" theme="dark" />
		<Logo variant="symbol" theme="dark" />
	</div>
	<div class="stack"><LogoGrid entries={marks} showLabels /></div>

	<h3>Reveal</h3>
	<div class="stack">
		<Reveal>
			<ContentCard
				title="Revealed on scroll"
				body="Renders visible with JavaScript off or reduced motion on."
			/>
		</Reveal>
	</div>
</Section>

<Section
	id="index"
	title="Token index"
	lead="Every declaration in the default :root block, by layer."
>
	{#each ['primitive', 'semantic', 'component'] as const as layer (layer)}
		<details class="index">
			<summary>{layer} — {byLayer(tokens, layer).length} tokens</summary>
			<div class="scroller">
				<table>
					<thead>
						<tr><th scope="col">Token</th><th scope="col">Default value</th></tr>
					</thead>
					<tbody>
						{#each byLayer(tokens, layer) as token (token.name)}
							<tr><td>{token.name}</td><td>{short(token.value)}</td></tr>
						{/each}
					</tbody>
				</table>
			</div>
		</details>
	{/each}
</Section>

<style>
	h3 {
		margin-block: var(--ds-space-6) var(--ds-space-3);
	}

	.themes {
		display: grid;
		gap: var(--ds-space-4);
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
		margin-block-start: var(--ds-space-5);
	}

	.theme-panel {
		background: var(--ds-bg);
		border: var(--ds-border-width) solid var(--ds-border);
		border-radius: var(--ds-radius-lg);
		color: var(--ds-fg);
		padding: var(--ds-space-4);
	}

	.panel-label {
		color: var(--ds-fg-muted);
		font-size: var(--ds-text-small-size);
		line-height: var(--ds-text-small-leading);
		margin-block-end: var(--ds-space-3);
	}

	.swatches,
	.specimens,
	.bars {
		display: flex;
		flex-direction: column;
		gap: var(--ds-space-2);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.swatches li,
	.bars li {
		align-items: center;
		display: flex;
		gap: var(--ds-space-3);
	}

	.swatch {
		block-size: var(--ds-space-5);
		border: var(--ds-border-width) solid var(--ds-border-strong);
		border-radius: var(--ds-radius-sm);
		flex: none;
		inline-size: var(--ds-space-5);
	}

	.swatch-name,
	.bar-name,
	.bar-value,
	.spec-meta {
		color: var(--ds-fg-muted);
		font-size: var(--ds-text-small-size);
		line-height: var(--ds-text-small-leading);
	}

	.bar-name {
		flex: none;
		inline-size: var(--ds-space-7);
	}

	.bar {
		background: var(--ds-accent);
		block-size: var(--ds-space-2);
		border-radius: var(--ds-radius-sm);
		flex: none;
	}

	.specimens {
		gap: var(--ds-space-4);
		margin-block-start: var(--ds-space-5);
	}

	.specimens li {
		display: flex;
		flex-direction: column;
		gap: var(--ds-space-1);
	}

	.spec {
		line-height: var(--ds-leading-heading);
	}

	.row {
		align-items: center;
		display: flex;
		flex-wrap: wrap;
		gap: var(--ds-space-3);
	}

	.row.logos {
		gap: var(--ds-space-5);
	}

	.grid {
		display: grid;
		gap: var(--ds-space-4);
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
	}

	.stack,
	.stacked {
		margin-block-start: var(--ds-space-4);
	}

	.stacked {
		max-inline-size: 24rem;
	}

	.scroller {
		overflow-x: auto;
	}

	table {
		border-collapse: collapse;
		font-size: var(--ds-text-small-size);
		inline-size: 100%;
		min-inline-size: 28rem;
	}

	th,
	td {
		border-block-end: var(--ds-border-width) solid var(--ds-border);
		padding-block: var(--ds-space-2);
		padding-inline-end: var(--ds-space-4);
		text-align: start;
		vertical-align: top;
	}

	th {
		color: var(--ds-fg-muted);
		font-weight: 400;
	}

	.index {
		border-block-end: var(--ds-border-width) solid var(--ds-border);
	}

	.index summary {
		cursor: pointer;
		min-block-size: var(--ds-interactive-min-target);
		padding-block: var(--ds-space-3);
	}
</style>
