---
status: draft
updated: 2026-08-27
---

# Architecture overview

<!-- Keep this short. It answers "what talks to what, and who owns which data" —
     detail belongs in ADRs and specs/NNN-*/design.md. -->

## Context

`svelte-static-starter` is a prerendered SvelteKit template for public marketing and landing sites. It has no runtime backend: `site/` builds to static files that a host serves directly. It touches three external systems — the host that serves the build and applies `static/_headers` (Cloudflare Pages is the assumed target), search-engine crawlers whose access is governed per environment, and GitHub, which receives prefilled issues from the staging-only annotate overlay through a URL a reviewer opens in their own browser. Nothing in the build holds a credential for any of them.

## Components

- `site/` — the only publishable part. It references nothing outside itself.
- `site/src/routes/` — prerendered route surface, including `robots.txt/+server.ts`, which is generated per environment rather than served as a static file.
- `site/src/lib/content/` — typed content modules and their `types.ts`; the sole home of copy.
- `site/src/lib/components/{layout,ui}/` — Header and Footer, plus twelve UI primitives that consume content and tokens.
- `site/src/lib/styles/` — `tokens.css` (primitive, semantic, component layers) and `base.css` (element defaults, `@font-face`).
- `site/src/lib/site-env.ts` and `env.ts` — environment resolution from `PUBLIC_SITE_ENV`.
- `site/src/lib/dev/` — the annotate overlay and its GitHub issue-URL builder; staging only.
- `site/scripts/` — `content-check.ts` (publish gate) and `verify-robots.mjs` (two-environment build assertion).
- `site/static/` — assets plus `_headers`, which carries the host-level `X-Robots-Tag` for staging.
- `site/tests/{unit,e2e,fixtures}` — Vitest server-rendering tests and Playwright tests over two servers.
- `.github/workflows/ci.yml` — markdownlint over docs, then lint, check, unit, and verify:robots over `site/`.

## Boundaries

- **No route may opt out of prerendering.** `adapter-static` with `prerender = true`, `handleMissingId: 'fail'`, and `handleHttpError: 'fail'` turn a broken anchor or a link to a nonexistent route into a build failure (ADR-0001, ADR-0002).
- **Copy does not live in markup.** Components read from `site/src/lib/content/`; the reverse dependency is forbidden (ADR-0004).
- **Components reference tokens, never literal colors.** An end-to-end test asserts that no `.svelte` file contains a hex or `rgb()` literal (ADR-0005).
- **The environment split is fail-safe, not opt-in.** Anything other than `PUBLIC_SITE_ENV=production` is staging, so a missing or misspelled value stays noindex (ADR-0006).
- **Development-only code never reaches production.** The annotate overlay lives in a shadow root, never mutates the page, holds no credential, and is absent from production builds along with the Svelte development metadata it reads. `verify:robots` asserts both sides (ADR-0007).
- **The adapter is a deliberate choice tied to the deploy target,** not a default to inherit (ADR-0003).
- **`site/` is self-contained.** Repository-root documents, including this frame, are not build inputs.

## Data ownership

There is no data store and no runtime state. Ownership is build-time only.

- `site/src/lib/content/site.ts` owns site identity: title, URL, contact address, meta description, navigation, and `repo`, from which the annotate overlay builds its GitHub issue link.
- `site/src/lib/content/*.ts` own page copy and each item's `status` (`approved`, `generated`, `stub`). `content-check.ts` reads that status and owns the pass/fail verdict; nothing else may.
- `site/src/lib/styles/tokens.css` owns every design value. Components read tokens and write none.
- `PUBLIC_SITE_ENV` owns environment identity at build time. `site-env.ts` is the only interpreter of it; `robots.txt/+server.ts`, the robots meta tag, and the overlay's inclusion all derive from it rather than testing the variable themselves.
- `site/static/_headers` owns host-level response headers. It duplicates the staging noindex intent at a layer the build cannot reach, which is why `verify:robots` asserts both.
