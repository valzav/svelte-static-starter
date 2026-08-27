import { render } from 'svelte/server';
import Fixture from './header-footer.svelte';

export function renderHeaderFooterFixture() {
	return render(Fixture).body;
}
