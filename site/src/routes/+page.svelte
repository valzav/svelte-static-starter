<script lang="ts">
	import Accordion from '$lib/components/ui/Accordion.svelte';
	import ActionLink from '$lib/components/ui/ActionLink.svelte';
	import ColumnList from '$lib/components/ui/ColumnList.svelte';
	import ContentCard from '$lib/components/ui/ContentCard.svelte';
	import LogoGrid from '$lib/components/ui/LogoGrid.svelte';
	import Metric from '$lib/components/ui/Metric.svelte';
	import Pill from '$lib/components/ui/Pill.svelte';
	import Reveal from '$lib/components/ui/Reveal.svelte';
	import Section from '$lib/components/ui/Section.svelte';
	import { demo } from '$lib/content/demo';
	import { faq } from '$lib/content/faq';
	import { site } from '$lib/content/site';
</script>

<Section
	id="hero"
	kicker={demo.hero.kicker}
	title={demo.hero.title}
	lead={demo.hero.lead}
	level={1}
>
	<div class="actions">
		<ActionLink href="#primitives" variant="primary">See the primitives</ActionLink>
		<ActionLink href={site.contactHref} variant="secondary">Get in touch</ActionLink>
	</div>
</Section>

<Section
	id="primitives"
	title={demo.primitives.title}
	lead={demo.primitives.lead}
	kicker="Components"
>
	<div class="pills">
		{#each demo.primitives.pills as pill (pill)}
			<Pill>{pill}</Pill>
		{/each}
	</div>

	<div class="grid">
		{#each demo.primitives.cards as card, index (card.title)}
			<Reveal delay={index * 60}>
				<ContentCard title={card.title} body={card.body} numbered />
			</Reveal>
		{/each}
	</div>

	<div class="columns">
		<ColumnList items={demo.columns} layout="three-column" />
	</div>

	<div class="stacked">
		<ActionLink
			href="#metrics"
			variant="primary"
			layout="stacked"
			title="Stacked layout"
			description="The same component renders a card-sized call to action."
		/>
	</div>
</Section>

<Section
	id="metrics"
	title={demo.metrics.title}
	lead={demo.metrics.lead}
	kicker="Numbers"
	theme="light"
>
	<div class="metrics">
		{#each demo.metrics.items as metric (metric.label)}
			<Metric value={metric.value} label={metric.label} disclosure={metric.disclosure} />
		{/each}
	</div>
</Section>

<Section id="marks" title={demo.marks.title} lead={demo.marks.lead} kicker="Assets">
	<LogoGrid entries={demo.marks.entries} showLabels />
</Section>

<Section id="questions" title={demo.questions.title} lead={demo.questions.lead} kicker="FAQ">
	<Accordion items={faq} />
</Section>

<Section id="closing" title={demo.closing.title} lead={demo.closing.lead} align="center">
	<div class="actions center">
		<ActionLink href={site.contactHref} variant="primary">Get in touch</ActionLink>
	</div>
</Section>

<style>
	.actions,
	.pills {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ds-space-3);
		margin-block-start: var(--ds-space-5);
	}

	.actions.center {
		justify-content: center;
	}

	.grid,
	.metrics {
		display: grid;
		gap: var(--ds-space-4);
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
		margin-block-start: var(--ds-space-5);
	}

	.columns,
	.stacked {
		margin-block-start: var(--ds-space-6);
	}

	.stacked {
		max-inline-size: 24rem;
	}
</style>
