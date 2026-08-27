<script lang="ts">
	import Logo from '$lib/components/ui/Logo.svelte';

	type LogoConfig = { variant: 'full' | 'symbol'; theme: 'dark' | 'light' };
	type FooterLink = { label: string; href?: string };

	let {
		logo,
		socialLinks,
		legalLinks,
		disclaimer
	}: {
		logo: LogoConfig;
		socialLinks: readonly FooterLink[];
		legalLinks: readonly FooterLink[];
		disclaimer: readonly string[];
	} = $props();

	function configuredHref(href: string | undefined) {
		return href?.trim() || undefined;
	}

	function isExternal(href: string) {
		return /^(?:https?:)?\/\//i.test(href);
	}
</script>

<footer data-theme="dark">
	<div class="content">
		<Logo {...logo} />
		<div class="groups">
			<nav aria-label="Social links">
				<ul>
					{#each socialLinks as item (item.label)}
						{@const href = configuredHref(item.href)}
						<li>
							{#if href}
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- href may be an external URL. -->
								<a href={item.href} rel={isExternal(href) ? 'noopener' : undefined}>{item.label}</a>
							{:else}
								<span>{item.label}</span>
							{/if}
						</li>
					{/each}
				</ul>
			</nav>
			<nav aria-label="Legal links">
				<ul>
					{#each legalLinks as item (item.label)}
						{@const href = configuredHref(item.href)}
						<li>
							{#if href}
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- href may be an external URL. -->
								<a href={item.href} rel={isExternal(href) ? 'noopener' : undefined}>{item.label}</a>
							{:else}
								<span>{item.label}</span>
							{/if}
						</li>
					{/each}
				</ul>
			</nav>
		</div>
		<div class="disclaimer">
			{#each disclaimer as paragraph (paragraph)}
				<p>{paragraph}</p>
			{/each}
		</div>
	</div>
</footer>

<style>
	footer {
		background: var(--ds-footer-background);
		border-block-start: var(--ds-footer-border-width) solid var(--ds-footer-border-color);
		padding-block: var(--ds-footer-padding-block);
		padding-inline: var(--ds-footer-padding-inline);
	}

	.content {
		display: grid;
		gap: var(--ds-footer-layout-gap);
		margin-inline: auto;
		max-inline-size: var(--ds-content-max);
	}

	:global(footer img) {
		block-size: var(--ds-footer-logo-height);
		inline-size: auto;
	}

	.groups {
		display: grid;
		gap: var(--ds-footer-layout-gap);
	}

	ul {
		display: grid;
		gap: var(--ds-footer-group-gap);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	a {
		align-items: center;
		color: var(--ds-footer-link-color);
		display: inline-flex;
		min-block-size: var(--ds-footer-interactive-min-target);
	}

	span {
		color: var(--ds-footer-fallback-color);
	}

	a {
		text-decoration: underline;
		text-underline-offset: var(--ds-footer-link-underline-offset);
		transition: color var(--ds-footer-link-transition-duration)
			var(--ds-footer-link-transition-easing);
	}

	a:hover {
		color: var(--ds-footer-link-hover-color);
	}

	a:focus-visible {
		outline: var(--ds-footer-focus-width) solid var(--ds-footer-focus-color);
		outline-offset: var(--ds-footer-focus-offset);
	}

	.disclaimer {
		color: var(--ds-footer-disclaimer-color);
		display: grid;
		font-size: var(--ds-footer-disclaimer-size);
		gap: var(--ds-footer-disclaimer-gap);
		line-height: var(--ds-footer-disclaimer-leading);
	}

	@media (min-width: 768px) {
		.groups {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
