import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';

// Staging builds (ADR-0006) are Vite development builds: Svelte then compiles in development mode,
// so every element carries `__svelte_meta` (source file, line, component chain) for the annotate
// overlay, and the same flag makes the overlay import dead code in production (ADR-0007).
// vite-plugin-svelte forces `compilerOptions.dev` off in a production build, so the switch has to
// be `NODE_ENV`; Vite documents setting it here. Every build sets it, so an inherited `NODE_ENV`
// never decides the outcome. Only the Cloudflare production environment sets
// `PUBLIC_SITE_ENV=production`; `src/lib/env.ts` reads the runtime value.
const stagingBuild = process.env.PUBLIC_SITE_ENV !== 'production';

export default defineConfig(({ command }) => {
	if (command === 'build') process.env.NODE_ENV = stagingBuild ? 'development' : 'production';

	return {
		define: { __DS_ANNOTATE__: JSON.stringify(stagingBuild) },
		plugins: [
			sveltekit({
				compilerOptions: {
					// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
					runes: ({ filename }) =>
						filename.split(/[/\\]/).includes('node_modules') ? undefined : true
				},
				adapter: adapter(),
				prerender: {
					// A broken #anchor or missing asset must fail the build, never ship (ADR-0002).
					handleMissingId: 'fail',
					handleHttpError: 'fail'
				}
			})
		],
		test: {
			expect: { requireAssertions: true },
			projects: [
				{
					extends: './vite.config.ts',
					test: {
						name: 'server',
						environment: 'node',
						include: ['tests/unit/**/*.{test,spec}.{js,ts}']
					}
				}
			]
		}
	};
});
