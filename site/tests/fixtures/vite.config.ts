import { fileURLToPath, URL } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { fixtureViteCacheDirs } from './vite-server.ts';

export default defineConfig({
	cacheDir: fixtureViteCacheDirs.browser,
	optimizeDeps: { entries: ['tests/fixtures/*.html'] },
	plugins: [svelte()],
	root: fileURLToPath(new URL('../..', import.meta.url)),
	// Fixtures are static pages under test. Without this, a dependency re-optimization can push a
	// full-reload over the HMR socket and destroy the page's execution context mid-assertion.
	// The SSR fixture servers disable their socket the same way (`ws: false` in vite-server.ts).
	server: { hmr: false }
});
