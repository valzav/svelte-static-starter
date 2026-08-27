<script lang="ts">
	import type { FaqItem } from '$lib/content/types';
	import AccordionItem from './AccordionItem.svelte';

	let { items }: { items: FaqItem[] } = $props();
</script>

{#each items as item (item)}
	<AccordionItem {item} groupName="faq" />
{/each}
