<script lang="ts">
	import type { LogoEntry } from '$lib/content/types';

	let { entry, showLabels = false }: { entry: LogoEntry; showLabels?: boolean } = $props();
	let accessibleName = $derived(
		entry.count === undefined ? entry.name : `${entry.count} — ${entry.name}`
	);
</script>

<li aria-label={accessibleName} class:label-tile={showLabels}>
	{#if showLabels}
		<div class="label-content" aria-hidden="true">
			{#if entry.logo}
				{#if entry.status === 'stub'}
					<img class="mark placeholder-mark" src={entry.logo} alt="" />
				{:else}
					<span class="mark mask-mark" style:--ds-logo-tile-mask={`url("${entry.logo}")`}></span>
				{/if}
			{:else}
				<span class="mark-spacer"></span>
			{/if}
			<span class="visible-name">{entry.name}</span>
		</div>
	{:else if entry.logo}
		<div class="image-content" aria-hidden="true">
			{#if entry.count !== undefined}
				<span class="count" aria-hidden="true">{entry.count} —</span>
			{/if}
			{#if entry.status === 'stub'}
				<img class="mark placeholder-mark" src={entry.logo} alt="" />
			{:else}
				<span class="mark mask-mark" style:--ds-logo-tile-mask={`url("${entry.logo}")`}></span>
			{/if}
		</div>
	{:else}
		<span class="text-content" aria-hidden="true">
			{#if entry.count !== undefined}<span class="count">{entry.count} —</span>
			{/if}{entry.name}
		</span>
	{/if}
</li>

<style>
	li {
		aspect-ratio: var(--ds-logo-tile-aspect-ratio);
		background: var(--ds-logo-tile-bg);
		border: var(--ds-logo-tile-border-width) solid var(--ds-logo-tile-border);
		border-radius: var(--ds-logo-tile-radius);
		box-sizing: border-box;
		display: grid;
		min-inline-size: 0;
		padding: var(--ds-logo-tile-padding);
		place-items: center;
		text-align: center;
	}

	.label-tile {
		aspect-ratio: auto;
		block-size: 100%;
	}

	.image-content {
		display: grid;
		gap: var(--ds-logo-tile-content-gap);
		grid-template-columns: auto minmax(0, 1fr);
		min-inline-size: 0;
		place-items: center;
	}

	.label-content {
		align-content: start;
		display: grid;
		gap: var(--ds-logo-tile-label-gap);
		grid-template-rows: var(--ds-logo-tile-label-mark-height) auto;
		inline-size: 100%;
		place-items: center;
		place-self: stretch;
	}

	.label-content .mark,
	.mark-spacer {
		block-size: var(--ds-logo-tile-label-mark-height);
	}

	.mark {
		block-size: 100%;
		inline-size: 100%;
	}

	.mask-mark {
		background-color: var(--ds-logo-tint);
		mask: var(--ds-logo-tile-mask) center / contain no-repeat;
		-webkit-mask: var(--ds-logo-tile-mask) center / contain no-repeat;
	}

	.placeholder-mark {
		object-fit: contain;
	}

	.count,
	.text-content {
		color: var(--ds-logo-tile-count-color);
		font-size: var(--ds-text-small-size);
		line-height: var(--ds-text-small-leading);
		overflow-wrap: anywhere;
	}

	.text-content,
	.visible-name {
		color: var(--ds-logo-tile-text-color);
	}

	.visible-name {
		align-self: start;
		font-size: var(--ds-text-small-size);
		line-height: var(--ds-text-small-leading);
		max-inline-size: 100%;
		min-inline-size: 0;
		overflow-wrap: normal;
	}

	/* The shared-round count is the proof signal; it carries the accent. */
	.count {
		color: var(--ds-logo-tile-count-accent);
	}
</style>
