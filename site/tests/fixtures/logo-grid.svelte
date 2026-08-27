<script lang="ts">
	import LogoGrid from '../../src/lib/components/ui/LogoGrid.svelte';
	import logo from './logo-tile.svg?no-inline';

	const entries = [
		{ name: 'Test mark', count: 9, logo, status: 'approved' },
		{ name: 'Text fallback', status: 'approved' },
		{
			name: 'A deliberately long text-only company name that must wrap inside its tile',
			status: 'approved'
		}
	] as const;
</script>

<LogoGrid {entries} />
