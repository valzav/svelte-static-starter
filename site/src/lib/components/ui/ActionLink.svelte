<script lang="ts">
	type Variant = 'primary' | 'secondary' | 'link';
	type Layout = 'default' | 'stacked';

	let {
		href,
		variant,
		layout = 'default',
		title,
		description,
		children
	}: {
		href: string;
		variant: Variant;
		layout?: Layout;
		title?: string;
		description?: string;
		children?: import('svelte').Snippet;
	} = $props();

	let isExternal = $derived(/^(?:https?:)?\/\//i.test(href.trim()));
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- href may be an external URL, mailto, or fragment. -->
<a
	{href}
	class:primary={variant === 'primary'}
	class:secondary={variant === 'secondary'}
	class:link={variant === 'link'}
	class:stacked={layout === 'stacked'}
	rel={isExternal ? 'noopener' : undefined}
>
	{#if layout === 'stacked'}
		<span class="stacked-title">{title}</span>
		<span class="stacked-description">{description}</span>
	{:else if children}
		{@render children()}
	{/if}
</a>

<!-- eslint-enable svelte/no-navigation-without-resolve -->

<style>
	a {
		align-items: center;
		block-size: var(--ds-action-link-height);
		border: var(--ds-action-link-border-width) solid transparent;
		border-radius: var(--ds-action-link-radius);
		display: inline-flex;
		font-size: var(--ds-action-link-font-size);
		font-weight: 600;
		justify-content: center;
		line-height: var(--ds-action-link-leading);
		min-block-size: var(--ds-action-link-min-target);
		min-inline-size: var(--ds-action-link-min-target);
		padding-block: var(--ds-action-link-padding-block);
		padding-inline: var(--ds-action-link-padding-inline);
		text-decoration: none;
		transition:
			opacity var(--ds-action-link-transition-duration) var(--ds-action-link-transition-easing),
			transform var(--ds-action-link-transition-duration) var(--ds-action-link-transition-easing),
			box-shadow var(--ds-action-link-transition-duration) var(--ds-action-link-transition-easing),
			border-color var(--ds-action-link-transition-duration) var(--ds-action-link-transition-easing);
	}

	a.primary {
		background: var(--ds-action-link-bg-primary);
		border-color: var(--ds-action-link-border-primary);
		color: var(--ds-action-link-fg-primary);
	}

	a.secondary {
		background: var(--ds-action-link-bg-secondary);
		border-color: var(--ds-action-link-border-secondary);
		color: var(--ds-action-link-fg-secondary);
	}

	a.link {
		color: var(--ds-action-link-inline-color);
		padding-inline: 0;
		text-decoration: underline;
		text-underline-offset: var(--ds-action-link-inline-underline-offset);
	}

	/* Stacked actions render as large entry panels with an arrow affordance. */
	a.stacked {
		align-items: flex-start;
		block-size: auto;
		flex-direction: column;
		gap: var(--ds-action-link-stacked-gap);
		justify-content: center;
		min-block-size: var(--ds-action-link-min-target);
		padding: var(--ds-action-link-stacked-padding);
		/* Reserve the arrow corner so long titles never run beneath it. */
		padding-inline-end: calc(
			var(--ds-action-link-stacked-padding) + var(--ds-action-link-stacked-arrow-size) +
				var(--ds-space-2)
		);
		position: relative;
	}

	a.stacked.primary {
		background: var(--ds-action-link-stacked-primary-bg);
	}

	a.stacked.secondary {
		background: var(--ds-content-card-bg);
		border-color: var(--ds-content-card-border);
		border-radius: var(--ds-action-link-stacked-radius);
		box-shadow: var(--ds-content-card-inner-highlight);
	}

	a.stacked::after {
		background-color: currentcolor;
		block-size: var(--ds-action-link-stacked-arrow-size);
		content: '';
		inline-size: var(--ds-action-link-stacked-arrow-size);
		inset-block-start: var(--ds-action-link-stacked-padding);
		inset-inline-end: var(--ds-action-link-stacked-padding);
		mask: var(--ds-icon-arrow) center / contain no-repeat;
		-webkit-mask: var(--ds-icon-arrow) center / contain no-repeat;
		position: absolute;
		transition: transform var(--ds-action-link-transition-duration)
			var(--ds-action-link-transition-easing);
	}

	a.stacked:hover::after {
		transform: translateX(var(--ds-space-1));
	}

	.stacked-title {
		font-size: var(--ds-action-link-stacked-title-size);
		font-weight: 600;
		line-height: var(--ds-action-link-stacked-title-leading);
	}

	.stacked-description {
		font-weight: 400;
	}

	a.stacked.secondary .stacked-description {
		color: var(--ds-fg-muted);
	}

	a:hover {
		opacity: var(--ds-action-link-hover-opacity);
		transform: translateY(var(--ds-action-link-hover-lift));
	}

	a.primary:hover {
		box-shadow: var(--ds-action-link-primary-hover-shadow);
		opacity: 1;
	}

	a.stacked.secondary:hover {
		background: var(--ds-content-card-hover-bg);
		border-color: var(--ds-border-strong);
		opacity: 1;
	}

	a:active {
		transform: none;
	}

	@media (prefers-reduced-motion: reduce) {
		a,
		a.stacked::after {
			transition: none;
		}

		a:hover {
			transform: none;
		}
	}

	a:focus-visible {
		outline: var(--ds-action-link-focus-width) solid var(--ds-action-link-focus-color);
		outline-offset: var(--ds-action-link-focus-offset);
	}
</style>
