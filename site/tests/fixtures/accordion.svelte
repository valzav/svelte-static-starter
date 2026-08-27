<script lang="ts">
	import Accordion from '$lib/components/ui/Accordion.svelte';
	import { faq } from '$lib/content/faq';
</script>

<Accordion items={faq} />
