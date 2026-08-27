import { defineConfig } from '@playwright/test';

export default defineConfig({
	use: { baseURL: 'http://localhost:4173' },
	webServer: [
		{ command: 'pnpm run build && pnpm run preview', port: 4173 },
		{
			command:
				'pnpm exec vite --config tests/fixtures/vite.config.ts --host 127.0.0.1 --port 4174 --strictPort',
			port: 4174
		}
	],
	testDir: 'tests/e2e'
});
