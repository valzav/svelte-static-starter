<script lang="ts">
	import Pill from '$lib/components/ui/Pill.svelte';
	import ContentCard from '$lib/components/ui/ContentCard.svelte';
	import Section from '$lib/components/ui/Section.svelte';
</script>

<Section id="fixture">
	<p>Section content</p>
</Section>

<Pill>Early stage</Pill>

<ContentCard title="A structured article">
	<ul>
		<li>First supplied item</li>
	</ul>
</ContentCard>
