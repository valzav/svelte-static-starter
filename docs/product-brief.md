---
status: draft
created: 2026-08-27
updated: 2026-08-27
---

# svelte-static-starter — product brief

## Problem

Every new public marketing or landing site re-solves the same unglamorous problems: prerendering that fails loudly instead of shipping broken links, a design-token layer that survives a rebrand, keeping unfinished copy out of production, keeping staging out of search indexes, and testing components without booting a DOM. Each is individually solvable and collectively a week of work that produces no product value. Teams either skip them and ship defects, or rebuild them per project.

## Users

Primary: a developer starting a new public marketing or landing site who wants those parts already built and wants to replace the brand-specific pieces rather than the architecture.

Secondary: a non-developer reviewer of a staging build, who reports issues through the staging-only annotate overlay without needing repository access or knowledge of the component tree.

## MVP outcome

Recorded as an open question. The template's own capabilities are already built and covered by tests; the next end-to-end outcome this project should prove has not been stated. See Open questions.

## Goals

- Ship a brand-neutral starting point, not a design system to adopt as-is.
- Fail the build rather than ship a defect, wherever a defect is mechanically detectable.
- Keep the publishable surface (`site/`) self-contained and free of references outside itself.
- Keep the repository green in CI without Valcraft's frame present.

## Non-goals

- Not a design system, component library, or npm package.
- Not a CMS or a runtime content-editing surface; copy lives in typed modules at build time.
- Not a server-rendered or dynamic application; every route is prerendered (ADR-0002).
- Not host-agnostic by accident: the adapter follows the deploy target and is a deliberate choice (ADR-0003).
- No credentials in the annotate overlay or any shipped asset (ADR-0007).

## System requirements

Each requirement below is recorded from an accepted ADR or from enforcement that already exists in the repository. None is newly invented by this brief.

- SYS-001: Every route prerenders; a missing anchor id or a link to a nonexistent route fails the build (ADR-0002, `handleMissingId: 'fail'`, `handleHttpError: 'fail'`).
- SYS-002: The deploy adapter is selected to match the deploy target rather than defaulted (ADR-0003).
- SYS-003: Copy lives in typed modules under `site/src/lib/content/`, never in markup, and carries a `status` of `approved`, `generated`, or `stub` (ADR-0004).
- SYS-004: A link without an `href` renders as plain text rather than a dead anchor (ADR-0004).
- SYS-005: `pnpm content:check` exits non-zero on any unfinished copy and belongs in the production build command only (ADR-0004).
- SYS-006: Design tokens are layered primitive to semantic to component; components reference tokens only, and an end-to-end test asserts that no `.svelte` file contains a hex or `rgb()` literal (ADR-0005).
- SYS-SEC-001: Any `PUBLIC_SITE_ENV` value other than `production` is treated as staging, so a missing or misspelled value fails safe to noindex (ADR-0006).
- SYS-SEC-002: Staging carries a robots meta tag, a disallowing `robots.txt`, and a host-level `X-Robots-Tag`; production carries none of them. `pnpm verify:robots` builds both environments and asserts each (ADR-0006).
- SYS-SEC-003: The annotate overlay ships on staging only, lives in a shadow root, never mutates the page, and holds no credential. Production builds contain neither the overlay nor the Svelte development metadata it reads, asserted by `pnpm verify:robots` (ADR-0007).

## Constraints

- Node 24 and pnpm 10 are hard requirements: `engines.node` fails `pnpm install` on any other major, and `site/.node-version` pins the version for version managers, CI, and Cloudflare.
- SvelteKit with `adapter-static` (ADR-0001, ADR-0002).
- Cloudflare Pages is the assumed deploy target; `site/static/_headers` and the `:project.pages.dev` wildcard rules are written for it.
- Fonts ship under SIL OFL 1.1; the rest of the repository is MIT. Licence separation must survive any font replacement.

## Assumptions

- The starter itself is the product. This brief describes the reusable template, not a specific site built from it.
- Consumers copy or fork the repository rather than depending on it as a published package; there is no versioned release surface today.
- `dev.example.com` and the placeholder logos are known first-run replacements, documented in README, not defects.

## Open questions

- What is the first end-to-end outcome this project should prove next? The template's existing capabilities are built and tested, so the MVP journey above is unset. `valcraft-spec` needs this answer before the first feature.
- Is the starter intended to receive ongoing upstream improvements that downstream forks pull, or is it a one-time snapshot per project? This determines whether a versioning and changelog surface is needed.
- README states that `.markdownlint-cli2.jsonc` is duplicated between this repository and Valcraft's Cast templates, and that "Cast's copy is the authority for the `MD025` rule". The installed Cast ships no `.markdownlint-cli2.jsonc` template, so that authority does not currently exist. Which copy is authoritative?
