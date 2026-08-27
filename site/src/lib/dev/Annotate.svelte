<script lang="ts">
	// Mount point for the staging-only annotate overlay (ADR-0007). `__DS_ANNOTATE__` is a build-time
	// constant, so the production build drops the branch and never emits the overlay chunk; this
	// component then renders nothing and does nothing.
	import { onMount } from 'svelte';

	onMount(() => {
		if (__DS_ANNOTATE__) void import('./annotate').then((overlay) => overlay.mount());
	});
</script>
