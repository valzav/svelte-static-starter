<script lang="ts">
	let {
		title,
		body,
		numbered = false,
		children
	}: {
		title: string;
		body?: string;
		numbered?: boolean;
		children?: import('svelte').Snippet;
	} = $props();
</script>

<article class:numbered>
	<h3>{title}</h3>
	{#if body}
		<p>{body}</p>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</article>

<style>
	article {
		background: var(--ds-content-card-bg);
		border: var(--ds-content-card-border-width) solid var(--ds-content-card-border);
		border-radius: var(--ds-content-card-radius);
		/* Inset top highlight gives the card a lit upper edge without a second border. */
		box-shadow: var(--ds-content-card-inner-highlight);
		padding: var(--ds-content-card-padding);
	}

	article > p {
		color: var(--ds-fg-muted);
		margin-block-start: var(--ds-content-card-body-spacing);
	}

	/* Editorial index; the container owns the sel-card counter reset. */
	article.numbered {
		counter-increment: sel-card;
	}

	article.numbered::before {
		color: var(--ds-content-card-number-color);
		content: counter(sel-card, decimal-leading-zero);
		display: block;
		font-size: var(--ds-content-card-number-size);
		font-variant-numeric: tabular-nums;
		font-weight: 600;
		letter-spacing: var(--ds-content-card-number-letter-spacing);
		margin-block-end: var(--ds-content-card-number-spacing);
	}
</style>
