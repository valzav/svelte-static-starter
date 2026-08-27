<script lang="ts">
	import { onMount } from 'svelte';

	let { delay = 0, children }: { delay?: number; children: import('svelte').Snippet } = $props();
	let wrapper: HTMLDivElement;

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			return;
		}

		if (typeof IntersectionObserver === 'undefined') {
			wrapper.classList.add('is-visible');
			return;
		}

		const observer = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					wrapper.classList.add('is-visible');
					observer.unobserve(entry.target);
				}
			}
		});

		observer.observe(wrapper);

		return () => observer.disconnect();
	});
</script>

<div
	bind:this={wrapper}
	class="reveal"
	style:--ds-reveal-default-delay={`calc(var(--ds-reveal-stagger-step) * ${delay})`}
>
	{@render children()}
</div>

<style>
	@media (prefers-reduced-motion: no-preference) {
		:global(html.js) .reveal {
			opacity: 0;
			transform: translateY(calc(var(--ds-reveal-rise-distance) * -1));
			transition-delay: var(--ds-reveal-default-delay);
			transition-duration: var(--ds-reveal-transition-duration);
			transition-property: opacity, transform;
			transition-timing-function: var(--ds-reveal-transition-easing);
		}

		:global(html.js) .reveal:global(.is-visible) {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.reveal {
			transition: none;
		}
	}
</style>
