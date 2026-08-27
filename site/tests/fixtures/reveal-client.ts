import '../../src/app.css';
import { mount, unmount } from 'svelte';
import RevealBrowser from './reveal-browser.svelte';

const component = mount(RevealBrowser, { target: document.getElementById('app')! });

Object.assign(window, { unmountRevealFixture: () => unmount(component) });
