<script lang="ts">
	type Theme = 'dark' | 'light';
	type Level = 1 | 2;
	type Align = 'start' | 'center';

	let {
		id,
		kicker,
		title,
		lead,
		level = 2,
		theme = 'dark',
		align = 'start',
		decor,
		children
	}: {
		id: string;
		kicker?: string;
		title?: string;
		lead?: string;
		/** Use 1 for the page's single top-level heading. */
		level?: Level;
		theme?: Theme;
		align?: Align;
		decor?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
	} = $props();
</script>

<section
	{id}
	class:has-decor={Boolean(decor)}
	class:center={align === 'center'}
	data-theme={theme === 'light' ? 'light' : undefined}
>
	{#if decor}
		{@render decor()}
	{/if}
	<div class="content">
		{#if kicker}
			<p class="kicker">{kicker}</p>
		{/if}
		{#if title}
			{#if level === 1}
				<h1>{title}</h1>
			{:else}
				<h2>{title}</h2>
			{/if}
		{/if}
		{#if lead}
			<p class="lead">{lead}</p>
		{/if}
		{#if children}
			{@render children()}
		{/if}
	</div>
</section>

<style>
	/* The body paints the shared gradient; transparent sections avoid tonal seams between
	   sections. A light-theme section repaints because its tokens resolve to the light ramp. */
	section {
		background: transparent;
		padding-block: var(--ds-section-padding-block);
		scroll-margin-top: var(--ds-section-scroll-margin-top);
	}

	/* Colour must be re-declared, not only the background: inheritance carries the *computed*
	   colour down from body, so a themed subtree keeps the other theme's text without this. */
	section[data-theme='light'] {
		background: var(--ds-bg);
		color: var(--ds-fg);
	}

	/* Decor layers (glows, atmosphere) paint behind the content and never leak past the section. */
	section.has-decor {
		isolation: isolate;
		overflow: clip;
		position: relative;
	}

	section.has-decor .content {
		position: relative;
	}

	.content {
		margin-inline: auto;
		max-inline-size: var(--ds-section-content-max);
		padding-inline: var(--ds-section-content-gutter);
	}

	section.center .content {
		text-align: center;
	}

	.kicker {
		color: var(--ds-fg-muted);
		font-size: var(--ds-section-kicker-size);
		letter-spacing: var(--ds-section-kicker-letter-spacing);
		line-height: var(--ds-section-kicker-leading);
		margin-block-end: var(--ds-section-kicker-spacing);
	}

	:is(h1, h2) + .lead,
	.kicker + :is(h1, h2) {
		margin-block-start: var(--ds-section-header-spacing);
	}

	.lead {
		color: var(--ds-fg-muted);
		max-inline-size: var(--ds-section-lead-max);
	}

	section.center .lead {
		margin-inline: auto;
	}

	@media (min-width: 1024px) {
		section {
			padding-block: var(--ds-section-padding-block-wide);
		}
	}
</style>
