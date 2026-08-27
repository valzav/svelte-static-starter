import { mount } from 'svelte';
import '../../src/app.css';
import LogoGridFixture from './logo-grid.svelte';

const target = document.getElementById('app');

if (!target) {
	throw new Error('Logo grid fixture mount target is missing.');
}

mount(LogoGridFixture, { target });
