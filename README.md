# svelte-static-starter

A prerendered SvelteKit starter for public marketing and landing sites, with the parts that are
tedious to get right already built: layered design tokens, a typed content model with a publish
gate, a staging/production split that fails safe to noindex, a staging-only annotate overlay, and a
test harness that renders components on the server.

Everything here is brand-neutral. It is a starting point, not a design system to adopt as-is.

## Quick start

Node 24 and pnpm 10 are hard requirements: `engines.node` fails `pnpm install` on any other major,
and `site/.node-version` pins the version for version managers, CI, and Cloudflare.

```sh
cd site
pnpm install
pnpm dev
```

## First run: what to replace

1. **`site/src/lib/content/site.ts`** — title, URL, contact address, meta description, navigation.
   Set `repo` to your `owner/name`; the annotate overlay builds its GitHub issue link from it.
2. **`site/src/lib/styles/tokens.css`** — the primitive layer holds the palette, type scale, and
   spacing scale. Change the values, keep the three-layer structure. Then run
   `node scripts/build-token-reference.mjs` and check the result at `/styleguide`.
3. **`site/src/lib/assets/logos/`** and **`site/static/favicon.svg`** — placeholder marks.
   `Logo.svelte` expects the full × symbol by dark × light matrix.
4. **`site/static/_headers`** and **`site/scripts/verify-robots.mjs`** — both name
   `dev.example.com`. Use your staging hostname. The `:project.pages.dev` wildcard rules are already
   correct for any Cloudflare Pages project.
5. **`site/src/lib/content/demo.ts`** and **`site/src/routes/+page.svelte`** — the demo page.
   Delete both once you have real sections. Keep `/styleguide`; it is the reference, not a demo.
6. **`site/static/fonts/`** — Source Sans 3 (SIL OFL 1.1, licence included). Replace it and the
   `@font-face` rule in `base.css` with your own self-hosted font.

## Commands

Run from `site/`:

| Command | What it does |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` / `pnpm preview` | Prerender into `site/build/` / serve it |
| `pnpm check` | `svelte-check` |
| `pnpm lint` / `pnpm format` | Prettier check + ESLint / write |
| `pnpm test:unit` | Vitest, single run |
| `pnpm test:e2e` | Playwright |
| `pnpm verify:robots` | Builds **both** environments and asserts their outputs |
| `pnpm content:check` | Reports stub and draft copy; exit 1 if any |
| `pnpm test` | unit + e2e + verify:robots |

From the repository root:

| Command | What it does |
| --- | --- |
| `npx markdownlint-cli2 "**/*.md"` | Lint every Markdown file |
| `node scripts/build-token-reference.mjs` | Rewrite the token tables in `design-system/README.md` |
| `node scripts/build-token-reference.mjs --check` | Fail if those tables are stale (CI runs this) |

## What is inside

**Prerendering that fails loudly.** `adapter-static` with `prerender = true`, plus
`handleMissingId: 'fail'` and `handleHttpError: 'fail'`. A broken `#anchor` or a link to a route
that does not exist breaks the build rather than shipping (ADR-0002). You will hit this the first
time you point a footer link at a page you have not written yet — that is the feature working.

**Two environments, failing safe.** Anything but `PUBLIC_SITE_ENV=production` is staging, so a
missing or misspelled value stays noindex. Staging gets a robots meta, a disallowing `robots.txt`,
and a host-level `X-Robots-Tag` via `static/_headers`; production gets none of it.
`pnpm verify:robots` builds both and asserts each (ADR-0006).

**Typed content with a publish gate.** Copy lives in `src/lib/content/`, never in markup. Items
carry `status: 'approved' | 'generated' | 'stub'`, and a link without an `href` renders as plain
text instead of a dead anchor. `pnpm content:check` walks the inventory and exits non-zero on
anything unfinished — put it in your production build command, not in staging (ADR-0004).

**Layered design tokens.** Primitive → semantic → component, dark by default, light under
`[data-theme='light']`. Components reference tokens only; an end-to-end test asserts that no
`.svelte` file contains a hex or `rgb()` literal (ADR-0005).

**A design system that documents itself.** [`design-system/README.md`](design-system/README.md)
carries the token-layer rules, a contract per component, the anti-patterns, and a pre-delivery
checklist; its token tables are generated from `tokens.css` and checked in CI, so they cannot
drift. The `/styleguide` route renders the real tokens and the real components in both themes —
it reads `tokens.css` at build time, so a token cannot exist without appearing there.
[`design-system/guidelines.md`](design-system/guidelines.md) is the brand skeleton, deliberately
empty. The route is kept out of search by a `/styleguide*` rule in `static/_headers` rather than a
page-level meta, which would break the production robots assertion.

**Twelve UI primitives.** Section, ActionLink, ContentCard, ColumnList, Metric, Pill, Accordion,
AccordionItem, Reveal, Logo, LogoGrid, LogoTile. Accordion is native `details`/`summary` and Reveal
and Metric both render their final state when JavaScript is off or reduced motion is on.

**A staging-only annotate overlay.** On staging, a toggle lets a reviewer click any element,
comment on it, and open a prefilled GitHub issue naming the element's Svelte source file, line, and
component chain. It lives in a shadow root, never changes the page, and holds no credential.
Production builds contain neither the overlay nor the Svelte development metadata it reads;
`pnpm verify:robots` asserts both sides (ADR-0007).

**A test harness that does not need a DOM.** Unit tests render components with `svelte/server`.
Playwright runs two servers: the real preview build, and a Vite server for isolated component
fixtures. Each SSR fixture owns a separate Vite dependency cache so parallel workers cannot race,
and the fixture server disables HMR so a dependency re-optimization cannot reload the page
mid-assertion.

## Layout

```text
.
├── .github/workflows/ci.yml   # docs (markdownlint, token reference) + site (lint, check, unit, verify:robots)
├── .markdownlint-cli2.jsonc
├── design-system/             # token rules, component contracts, brand skeleton
├── docs/architecture/adr/     # why the decisions above are what they are
├── scripts/                   # build-token-reference.mjs
└── site/                      # the only publishable part; references nothing outside itself
    ├── scripts/               # content-check, verify-robots
    ├── src/lib/{components,content,dev,styles,assets}
    ├── src/routes/            # / (demo page) and /styleguide
    ├── static/
    └── tests/{unit,e2e,fixtures}
```

The repository root is deliberately empty of project documents. If you use
[Valcraft](https://github.com/valzav/valcraft), run `valcraft:cast` in a project created from this
template: it adds `AGENTS.md`, `docs/product-brief.md`, `docs/architecture/overview.md`,
`docs/plans/`, and `specs/` around what is already here, merging rather than overwriting.

`.markdownlint-cli2.jsonc` is duplicated between this template and Valcraft's Cast templates on
purpose, so CI is green without Cast. Cast's copy is the authority for the `MD025` rule.

## Project documents

Added by [Valcraft](https://github.com/valzav/valcraft) Cast. `site/` does not read any of them.

- [Product brief](docs/product-brief.md)
- [Architecture overview](docs/architecture/overview.md)
- [Architecture decisions](docs/architecture/adr/)
- [Feature specifications](specs/)
- [Agent instructions](AGENTS.md) (`CLAUDE.md` is a symlink to it)

## Licence

MIT, except `site/static/fonts/`, which is Source Sans 3 under the SIL Open Font License 1.1
(licence included alongside the font).
