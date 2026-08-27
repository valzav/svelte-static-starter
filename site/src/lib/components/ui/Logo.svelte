<script lang="ts">
	import fullDark from '$lib/assets/logos/logo-dark.svg?no-inline';
	import fullLight from '$lib/assets/logos/logo-light.svg?no-inline';
	import symbolDark from '$lib/assets/logos/symbol-dark.svg?no-inline';
	import symbolLight from '$lib/assets/logos/symbol-light.svg?no-inline';
	import { site } from '$lib/content/site';

	type Variant = 'full' | 'symbol';
	type Theme = 'dark' | 'light';

	const logos: Record<Variant, Record<Theme, string>> = {
		full: { dark: fullDark, light: fullLight },
		symbol: { dark: symbolDark, light: symbolLight }
	};

	let { variant, theme }: { variant: Variant; theme: Theme } = $props();
	let src = $derived(logos[variant][theme]);
</script>

<img {src} alt={site.title} />
