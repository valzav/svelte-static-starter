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
6. **`docs/product-brief.md`** and **`docs/architecture/overview.md`** — inherited from the
   template and describing the starter itself. Rewrite them for your project, or delete the frame.
7. **`site/static/fonts/`** — Source Sans 3 (SIL OFL 1.1, licence included). Replace it and the
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

**Two environments that fail safe.** Staging and production differ by one variable, and anything
that is not exactly `production` counts as staging — so a misconfigured deploy stays hidden from
search instead of quietly indexing your work in progress. `pnpm verify:robots` builds both and
checks each one (ADR-0006).

**Copy that cannot ship half-finished.** Every headline, number and link lives in one folder rather
than scattered through markup, and each item is marked approved, draft, or not written yet.
`pnpm content:check` fails on anything unfinished — run it in your production build and unapproved
copy cannot reach the public site (ADR-0004).

**A design system, not just a stylesheet.** Colour, type, spacing and motion are defined once, in
three layers, so a rebrand is a change to the palette and nothing else. Components may only use
those values; a test fails if anyone writes a raw colour into a component (ADR-0005).

**Documentation that cannot go stale.**
[`design-system/README.md`](design-system/README.md) explains the rules and what each component
promises. The `/styleguide` page shows the real thing — every design value and every component, in
both light and dark. Both are built from the stylesheet itself, and CI fails if they fall behind it.
[`design-system/guidelines.md`](design-system/guidelines.md) is the brand skeleton, deliberately
left empty for you to fill.

**Twelve components to build pages from.** Sections, links and buttons, cards, lists, metrics, tags,
an accordion, a scroll reveal, and a logo grid. They work with JavaScript switched off and for
people who have asked their system to reduce motion: the accordion still opens, the counters still
show their final numbers.

**A way for reviewers to point at things.** On staging, a reviewer clicks any element on the page,
types a comment, and gets a GitHub issue pre-filled with the exact file and line that produced it —
no more "the third card, second line". It never alters the page, holds no credentials, and is
completely absent from production builds (ADR-0007).

**Tests that do not need a browser to be useful.** Components are checked on the server where that
is enough, and in a real browser where it is not. Isolated fixtures mean a broken page cannot take
the whole suite down with it.

## Layout

`site/` is the website — it is the only part that gets published. Everything beside it is
documentation and delivery scaffolding, and nothing inside `site/` reads any of it.

```text
site/                     the website, and the whole deploy artifact
├── src/routes/           the pages: / and /styleguide
├── src/lib/components/   the twelve building blocks, plus header and footer
├── src/lib/content/      all copy, numbers and links
├── src/lib/styles/       colour, type, spacing and motion
├── src/lib/assets/       logos and marks
├── src/lib/dev/          the staging-only review overlay
├── static/               fonts, favicon, hosting headers
├── scripts/              the publish gate and the environment check
└── tests/                server-rendered checks, browser checks, shared fixtures

design-system/            the rules, what each component promises, the brand skeleton
docs/                     product brief, architecture, decision records, working plans
specs/                    what each feature has to do
scripts/                  rebuilds the token tables in design-system/
AGENTS.md                 standing instructions for AI agents (CLAUDE.md points here)
.valcraft/                delivery configuration
.github/workflows/ci.yml  runs on every push: the documents first, then the site
```

The template carries its own `.markdownlint-cli2.jsonc` so the documents check passes whether or
not you use Valcraft.

## Spec-driven delivery

The template ships with the [Valcraft](https://github.com/valzav/valcraft) project frame already in
place: `AGENTS.md`, a product brief, an architecture overview, and the `specs/` and `docs/plans/`
roots. Valcraft is a set of agent skills for building software with AI without losing the thread
between sessions.

- **Requirements live in git, not in a chat.** Features, acceptance criteria, tasks and decisions
  carry stable IDs (`FR-001`, `AC-001`, `T-001`, `ADR-0001`) that plans, commits, tests and reviews
  all cite. A new session picks up from the files rather than from someone else's conversation.
- **A delivery loop that runs itself.** Foreman walks one task from plan → review → implementation
  → review → landing, starting a fresh worker for each stage. No single session has to hold the
  whole job in its head, and an interrupted run resumes from what is on disk.
- **Review by someone who did not write it.** Planning, implementation and review each get a clean
  context, so the implementer's own "it works" never counts as approval. Review can be assigned to
  a different model entirely — Claude, Codex or Cursor — for genuinely independent eyes.
- **You choose what waits for you.** Attended mode confirms each step; unattended keeps going.
  Either way some things always stop for a human: writing to the release branch, closing a feature,
  and anything escalated.
- **Retrospectives that compound.** After a feature ships, Temper grades what actually happened and
  proposes standing rules for `AGENTS.md`. Nothing is promoted on a single unverified incident.

**Two things to do on a new project.** Rewrite [`docs/product-brief.md`](docs/product-brief.md) and
[`docs/architecture/overview.md`](docs/architecture/overview.md) — they describe the starter, not
your project. If you do not use Valcraft, delete `AGENTS.md`, `.valcraft/`, `specs/` and those two
documents; nothing in `site/` depends on them.

- [Product brief](docs/product-brief.md) · [Architecture overview](docs/architecture/overview.md)
- [Architecture decisions](docs/architecture/adr/) · [Feature specifications](specs/)
- [Agent instructions](AGENTS.md) (`CLAUDE.md` is a symlink to it)

## Licence

MIT, except `site/static/fonts/`, which is Source Sans 3 under the SIL Open Font License 1.1
(licence included alongside the font).
