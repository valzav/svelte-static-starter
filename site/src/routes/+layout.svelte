<script lang="ts">
	import '../app.css';
	import Annotate from '$lib/dev/Annotate.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import { footer } from '$lib/content/footer';
	import { site } from '$lib/content/site';
	import { siteEnv } from '$lib/env';
	import { robotsMetaContent } from '$lib/site-env';

	let { children } = $props();

	const robots = robotsMetaContent(siteEnv);
</script>

<svelte:head>
	<title>{site.title}</title>
	<meta name="description" content={site.metaDescription} />
	{#if robots}<meta name="robots" content={robots} />{/if}
</svelte:head>

<Header navigation={site.navigation.slice(0, -1)} contact={site.navigation.at(-1)!} />
<main>{@render children()}</main>
<Footer
	logo={footer.logo}
	socialLinks={footer.socialLinks}
	legalLinks={footer.legalLinks}
	disclaimer={footer.disclaimer}
/>
<Annotate />
