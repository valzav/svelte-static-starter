<script lang="ts">
	import type { Column } from '$lib/content/types';

	type Layout = 'default' | 'three-column';

	let {
		items,
		layout = 'default'
	}: {
		items: readonly Column[];
		layout?: Layout;
	} = $props();
</script>

<div class:three-column={layout === 'three-column'} class="columns">
	{#each items as item (item)}
		<article>
			<h3>{item.title}</h3>
			{#if item.body}
				<p>{item.body}</p>
			{/if}
		</article>
	{/each}
</div>

<style>
	.columns {
		counter-reset: sel-column;
		display: grid;
		gap: var(--ds-column-list-gap);
	}

	/* Short gold rule and editorial index give the bare columns their structure. */
	article {
		background: linear-gradient(var(--ds-column-list-rule-color), var(--ds-column-list-rule-color))
			top left / var(--ds-column-list-rule-width) var(--ds-border-width) no-repeat;
		counter-increment: sel-column;
		padding-block-start: var(--ds-column-list-heading-spacing);
	}

	article::before {
		color: var(--ds-column-list-number-color);
		content: counter(sel-column, decimal-leading-zero);
		display: block;
		font-size: var(--ds-text-small-size);
		font-variant-numeric: tabular-nums;
		font-weight: 600;
		line-height: var(--ds-text-small-leading);
		margin-block-end: var(--ds-column-list-heading-spacing);
	}

	p {
		color: var(--ds-column-list-body-color);
		margin-block-start: var(--ds-column-list-body-spacing);
	}

	@media (min-width: 768px) {
		.columns {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (min-width: 1024px) {
		.columns.three-column {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
</style>
