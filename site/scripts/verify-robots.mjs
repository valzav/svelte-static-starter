// Builds both environments and asserts each one's search-visibility outputs (ADR-0006), plus the
// dev-tooling split (ADR-0007): the annotate overlay and Svelte development metadata are present in
// staging and absent from production. The staging side is also guarded by tests/e2e/; the
// production side has no other coverage, because the Playwright server always builds with
// PUBLIC_SITE_ENV unset and a second server would race this one over site/build/.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const buildDir = join(siteDir, 'build');
const headerRules = [
	'https://dev.example.com/*',
	'https://:project.pages.dev/*',
	'https://:version.:project.pages.dev/*'
];

const failures = [];

function fail(message) {
	failures.push(message);
}

function build(env) {
	const childEnv = { ...process.env };
	delete childEnv.PUBLIC_SITE_ENV;
	delete childEnv.NODE_ENV;
	if (env === 'production') {
		childEnv.PUBLIC_SITE_ENV = 'production';
		// The adversarial case for ADR-0007: the production flag must win over an inherited
		// development NODE_ENV, so the production build runs under exactly that environment.
		childEnv.NODE_ENV = 'development';
	}
	execFileSync('pnpm', ['build'], { cwd: siteDir, env: childEnv, stdio: 'pipe' });
}

function htmlFiles(dir) {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return htmlFiles(path);
		return entry.name.endsWith('.html') ? [path] : [];
	});
}

// Svelte emits the tag self-closing, so match the attributes rather than a literal tag.
function robotsMetas(html) {
	return [...html.matchAll(/<meta[^>]*\sname="robots"[^>]*>/g)].map((match) => match[0]);
}

function checkRobotsTxt(env, expected) {
	const body = readFileSync(join(buildDir, 'robots.txt'), 'utf8');
	if (body !== expected) {
		fail(
			`${env}: build/robots.txt is ${JSON.stringify(body)}, expected ${JSON.stringify(expected)}`
		);
	}
}

// The file Cloudflare reads is the built copy, so check that one rather than the source.
function checkHeaders(env) {
	const built = readFileSync(join(buildDir, '_headers'), 'utf8');
	const source = readFileSync(join(siteDir, 'static', '_headers'), 'utf8');
	if (built !== source) fail(`${env}: build/_headers differs from static/_headers`);

	const lines = built.split('\n');
	for (const rule of headerRules) {
		const index = lines.indexOf(rule);
		if (index === -1) {
			fail(`${env}: _headers has no rule for ${rule}`);
		} else if (lines[index + 1] !== '  X-Robots-Tag: noindex') {
			fail(`${env}: ${rule} is not followed by "  X-Robots-Tag: noindex"`);
		}
	}
}

// ADR-0007. `__svelte_meta` is the property the Svelte development runtime assigns and the
// overlay reads; `ds-annotate` is the overlay's host id. Both survive minification.
const devMarkers = ['__svelte_meta', 'ds-annotate'];

function jsFiles(dir) {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return jsFiles(path);
		return entry.name.endsWith('.js') ? [path] : [];
	});
}

function checkDevTooling(env) {
	const scripts = jsFiles(join(buildDir, '_app')).map((file) => readFileSync(file, 'utf8'));
	for (const marker of devMarkers) {
		const present = scripts.some((script) => script.includes(marker));
		if (env === 'production' && present) {
			fail(`production: build/_app contains ${JSON.stringify(marker)} (ADR-0007 forbids it)`);
		}
		if (env === 'staging' && !present) {
			fail(`staging: build/_app lacks ${JSON.stringify(marker)} (ADR-0007 requires it)`);
		}
	}
}

// Production first, so the staging build is what stays in build/ when this script finishes and a
// later `pnpm preview` cannot serve an indexable local build.
build('production');
const productionPages = htmlFiles(buildDir);
// "No page carries a robots meta" is satisfied by a build with no pages, so count them too.
if (productionPages.length === 0) fail('production: the build emitted no HTML pages');
for (const file of productionPages) {
	const metas = robotsMetas(readFileSync(file, 'utf8'));
	if (metas.length > 0) {
		fail(`production: ${file} carries ${JSON.stringify(metas)} (production must carry none)`);
	}
}
checkRobotsTxt('production', 'User-agent: *\nDisallow:\n');
checkHeaders('production');
checkDevTooling('production');

build('staging');
const stagingPages = htmlFiles(buildDir);
if (stagingPages.length === 0) fail('staging: the build emitted no HTML pages');
for (const file of stagingPages) {
	const metas = robotsMetas(readFileSync(file, 'utf8'));
	if (metas.length !== 1 || !metas[0].includes('content="noindex, nofollow"')) {
		fail(
			`staging: ${file} has robots metas ${JSON.stringify(metas)}, expected exactly one noindex`
		);
	}
}
checkRobotsTxt('staging', 'User-agent: *\nDisallow: /\n');
checkHeaders('staging');
checkDevTooling('staging');

if (failures.length > 0) {
	console.error('Environment verification failed (ADR-0006, ADR-0007):');
	for (const failure of failures) console.error(`  - ${failure}`);
	process.exit(1);
}

console.log(
	'ADR-0006 verified: staging noindex, production indexable, _headers intact in both. ADR-0007 verified: annotate overlay and Svelte development metadata in staging only.'
);
