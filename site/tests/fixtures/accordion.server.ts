import { render } from 'svelte/server';
import Fixture from './accordion.svelte';

export function renderAccordionFixture() {
	return render(Fixture).body;
}
