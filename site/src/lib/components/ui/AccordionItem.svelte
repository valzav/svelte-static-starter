<script lang="ts">
	import type { FaqItem } from '$lib/content/types';

	let { item, groupName }: { item: FaqItem; groupName: string } = $props();
</script>

<details name={groupName}>
	<summary>
		<span>{item.question}</span>
		<svg class="chevron" viewBox="0 0 16 16" aria-hidden="true">
			<path d="m4 6 4 4 4-4" />
		</svg>
	</summary>
	<!-- data-replace-me marks generated draft copy awaiting operator approval (ADR-0004). -->
	<p data-replace-me={item.status === 'generated' ? true : undefined}>{item.answer}</p>
</details>

<style>
	details + :global(details) {
		border-block-start: var(--ds-accordion-divider-width) solid var(--ds-accordion-divider-color);
	}

	details {
		interpolate-size: allow-keywords;
	}

	details::details-content {
		block-size: 0;
		overflow: hidden;
		transition:
			block-size var(--ds-accordion-content-transition-duration)
				var(--ds-accordion-content-transition-easing),
			content-visibility var(--ds-accordion-content-transition-duration);
		transition-behavior: allow-discrete;
	}

	details[open]::details-content {
		block-size: auto;
	}

	summary {
		align-items: center;
		cursor: pointer;
		display: flex;
		font-size: var(--ds-accordion-question-size);
		font-weight: 600;
		gap: var(--ds-accordion-summary-gap);
		inline-size: 100%;
		justify-content: space-between;
		line-height: var(--ds-accordion-question-leading);
		min-block-size: var(--ds-accordion-summary-min-target);
		padding-block: var(--ds-accordion-summary-padding-block);
	}

	summary::marker {
		content: '';
	}

	summary::-webkit-details-marker {
		display: none;
	}

	summary:focus-visible {
		outline: var(--ds-focus-width) solid var(--ds-focus);
		outline-offset: var(--ds-focus-offset);
	}

	summary {
		transition: color var(--ds-duration-fast) var(--ds-ease);
	}

	summary:hover {
		color: var(--ds-accordion-question-hover-color);
	}

	@media (prefers-reduced-motion: reduce) {
		summary {
			transition: none;
		}
	}

	.chevron {
		block-size: var(--ds-accordion-chevron-size);
		color: var(--ds-accordion-chevron-color);
		fill: none;
		flex: none;
		inline-size: var(--ds-accordion-chevron-size);
		stroke: currentColor;
		stroke-width: var(--ds-accordion-chevron-stroke-width);
		transition: transform var(--ds-accordion-chevron-transition-duration)
			var(--ds-accordion-chevron-transition-easing);
	}

	details[open] .chevron {
		transform: rotate(180deg);
	}

	p {
		color: var(--ds-accordion-answer-color);
		font-size: var(--ds-accordion-answer-size);
		line-height: var(--ds-accordion-answer-leading);
		max-inline-size: var(--ds-accordion-answer-max);
		min-block-size: 0;
		overflow: hidden;
		padding-block-end: var(--ds-accordion-answer-padding-block);
	}

	@media (prefers-reduced-motion: reduce) {
		details::details-content,
		.chevron {
			transition: none;
		}
	}
</style>
