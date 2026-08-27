import { fileURLToPath } from 'node:url';
import { createServer, type ViteDevServer } from 'vite';

const siteRoot = fileURLToPath(new URL('../..', import.meta.url));

export const fixtureViteCacheRoot = fileURLToPath(new URL('../.vite-cache', import.meta.url));

export const fixtureViteCacheDirs = {
	browser: `${fixtureViteCacheRoot}/browser`,
	accordion: `${fixtureViteCacheRoot}/accordion`,
	headerFooter: `${fixtureViteCacheRoot}/header-footer`
} as const;

type SsrFixture = Exclude<keyof typeof fixtureViteCacheDirs, 'browser'>;

export function createSsrFixtureServer(fixture: SsrFixture): Promise<ViteDevServer> {
	return createServer({
		appType: 'custom',
		cacheDir: fixtureViteCacheDirs[fixture],
		root: siteRoot,
		server: { middlewareMode: true, ws: false }
	});
}
