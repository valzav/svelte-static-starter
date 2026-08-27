<script lang="ts">
	import type { LogoEntry } from '$lib/content/types';
	import LogoTile from './LogoTile.svelte';

	let { entries, showLabels = false }: { entries: readonly LogoEntry[]; showLabels?: boolean } =
		$props();
</script>

<ul class:show-labels={showLabels}>
	{#each entries as entry (entry)}
		<LogoTile {entry} {showLabels} />
	{/each}
</ul>

<style>
	ul {
		display: grid;
		gap: var(--ds-logo-grid-gap);
		grid-template-columns: repeat(auto-fit, minmax(var(--ds-logo-grid-min-column), 1fr));
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.show-labels {
		grid-auto-rows: 1fr;
	}
</style>
