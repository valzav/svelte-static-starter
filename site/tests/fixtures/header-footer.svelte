<script lang="ts">
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { footer } from '$lib/content/footer';
	import { site } from '$lib/content/site';

	type NavigationLink = { label: string; href: string };
	type FooterLink = { label: string; href?: string };

	let {
		navigation = site.navigation.slice(0, -1),
		contact = site.navigation.at(-1)!,
		socialLinks = [
			{ label: 'Configured HTTPS', href: 'HTTPS://social.example.test/handle' },
			{ label: 'Configured protocol-relative', href: '//social.example.test/handle' },
			{ label: 'Configured local', href: '/legal' },
			{ label: 'Absent href' },
			{ label: 'Exact blank href', href: '' },
			{ label: 'Whitespace href', href: ' \t ' }
		],
		legalLinks = footer.legalLinks,
		disclaimer = footer.disclaimer
	}: {
		navigation?: readonly NavigationLink[];
		contact?: NavigationLink;
		socialLinks?: readonly FooterLink[];
		legalLinks?: readonly FooterLink[];
		disclaimer?: readonly string[];
	} = $props();
</script>

<Header {navigation} {contact} />
<main><p>Fixture content</p></main>
<Footer logo={footer.logo} {socialLinks} {legalLinks} {disclaimer} />
