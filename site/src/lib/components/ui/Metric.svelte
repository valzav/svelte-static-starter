<script lang="ts">
	import { onMount } from 'svelte';

	let { value, label, disclosure }: { value: string; label: string; disclosure?: string } =
		$props();
	let labelWithoutMarker = $derived(disclosure && label.endsWith('*') ? label.slice(0, -1) : label);

	// SSR and no-JS render the final value; JS only animates toward it (ADR-0002).
	// null means "show the real value"; the count-up sets interim strings while running.
	let animated = $state<string | null>(null);
	let element: HTMLElement;

	onMount(() => {
		// Splits "×2.38" / "90+" into prefix, number, suffix so only the number animates.
		const parsed = /^([^0-9]*)([0-9]+(?:\.[0-9]+)?)(.*)$/.exec(value);
		if (
			!parsed ||
			window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
			typeof IntersectionObserver === 'undefined'
		) {
			return;
		}

		const [, prefix, number, suffix] = parsed;
		const target = Number.parseFloat(number);
		const decimals = number.split('.')[1]?.length ?? 0;
		const duration = 1400;

		const observer = new IntersectionObserver((entries) => {
			if (!entries.some((entry) => entry.isIntersecting)) {
				return;
			}
			observer.disconnect();

			const start = performance.now();
			const frame = (now: number) => {
				const progress = Math.min((now - start) / duration, 1);
				const eased = 1 - (1 - progress) ** 3;
				animated = progress < 1 ? `${prefix}${(target * eased).toFixed(decimals)}${suffix}` : null;
				if (progress < 1) {
					requestAnimationFrame(frame);
				}
			};
			requestAnimationFrame(frame);
		});

		observer.observe(element);
		return () => observer.disconnect();
	});
</script>

<div bind:this={element}>
	<strong>
		<!-- The hidden sizer reserves the final width so the count-up never shifts layout. -->
		<span class="sizer" aria-hidden="true">{value}</span>
		<span class="live">{animated ?? value}</span>
	</strong>
	<span
		>{labelWithoutMarker}{#if disclosure}<span title={disclosure}>*</span>{/if}</span
	>
</div>

<style>
	div {
		display: grid;
		gap: var(--ds-metric-gap);
	}

	strong {
		color: var(--ds-metric-color);
		display: grid;
		font-size: var(--ds-metric-size);
		font-variant-numeric: tabular-nums;
		font-weight: 600;
		line-height: var(--ds-metric-leading);
	}

	.sizer,
	.live {
		grid-area: 1 / 1;
	}

	.sizer {
		visibility: hidden;
	}

	div > span {
		color: var(--ds-metric-label-color);
		font-size: var(--ds-metric-label-size);
		font-weight: 600;
		line-height: var(--ds-metric-label-leading);
	}
</style>
