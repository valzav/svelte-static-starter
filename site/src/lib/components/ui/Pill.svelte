<script lang="ts">
	let { children }: { children?: import('svelte').Snippet } = $props();
</script>

<span>
	{#if children}
		{@render children()}
	{/if}
</span>

<style>
	span {
		border: var(--ds-pill-border-width) solid var(--ds-pill-border);
		border-radius: var(--ds-pill-radius);
		color: var(--ds-pill-color);
		display: inline-flex;
		font-size: var(--ds-pill-font-size);
		letter-spacing: var(--ds-pill-letter-spacing);
		line-height: var(--ds-pill-leading);
		padding: var(--ds-pill-padding-block) var(--ds-pill-padding-inline);
	}
</style>
