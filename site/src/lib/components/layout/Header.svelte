<script lang="ts">
	import { site } from '$lib/content/site';
	import Logo from '$lib/components/ui/Logo.svelte';
	import ActionLink from '$lib/components/ui/ActionLink.svelte';

	type NavigationLink = { label: string; href: string };

	let {
		navigation,
		contact
	}: {
		navigation: readonly NavigationLink[];
		contact: NavigationLink;
	} = $props();
</script>

<header>
	<div class="bar">
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- href points to the local site root. -->
		<a class="logo" href="/" aria-label="{site.title} home">
			<Logo variant="full" theme="dark" />
		</a>
		<nav>
			<ul class="nav-links">
				{#each navigation as item (item.href)}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- href is a supplied fragment target. -->
					<li><a href={item.href}>{item.label}</a></li>
				{/each}
			</ul>
			<ActionLink href={contact.href} variant="link">{contact.label}</ActionLink>
		</nav>
	</div>
</header>

<style>
	header {
		background: color-mix(
			in srgb,
			var(--ds-header-background) var(--ds-header-background-alpha),
			transparent
		);
		backdrop-filter: blur(var(--ds-header-backdrop-blur));
		border-block-end: var(--ds-header-border-width) solid var(--ds-header-border-color);
		block-size: var(--ds-header-height);
		inset-block-start: 0;
		inset-inline: 0;
		position: fixed;
		z-index: 1;
	}

	.bar,
	nav,
	.nav-links {
		align-items: center;
		display: flex;
	}

	.bar {
		block-size: 100%;
		gap: var(--ds-header-gap);
		justify-content: space-between;
		margin-inline: auto;
		max-inline-size: var(--ds-content-max);
		padding-inline: var(--ds-header-padding-inline);
	}

	.logo {
		align-items: center;
		display: inline-flex;
		flex: 0 1 auto;
		min-block-size: var(--ds-header-interactive-height);
	}

	.logo :global(img) {
		block-size: var(--ds-header-logo-height);
		inline-size: auto;
	}

	nav {
		gap: var(--ds-header-gap);
		min-inline-size: 0;
	}

	.nav-links {
		gap: var(--ds-header-nav-gap);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.nav-links a {
		align-items: center;
		color: var(--ds-header-link-color);
		display: inline-flex;
		font-size: var(--ds-header-link-size);
		min-block-size: var(--ds-header-interactive-height);
		text-decoration: none;
		text-underline-offset: var(--ds-header-link-underline-offset);
	}

	.nav-links a:hover {
		color: var(--ds-header-link-hover-color);
		text-decoration: underline;
	}

	.nav-links a:focus-visible,
	.logo:focus-visible {
		outline: var(--ds-header-focus-width) solid var(--ds-header-focus-color);
		outline-offset: var(--ds-header-focus-offset);
	}

	@media (max-width: 767px) {
		.nav-links {
			display: none;
		}
	}
</style>
