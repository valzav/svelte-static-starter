# 0007. Staging-only annotate overlay

Status: accepted

## Context

Review feedback on a rendered page usually arrives as prose — "the third card, second line" — and
someone then has to find the component that renders it. The compiler already knows: in development
mode Svelte attaches `__svelte_meta` (source file, line, column, and the component chain) to every
element it creates.

## Decision

Ship an overlay that is present in every staging build and absent from production. A reviewer
toggles annotate mode, clicks an element, and types a comment; the overlay records the element's
Svelte source location, component chain, tag, id, and a text excerpt, keeps annotations in
`localStorage`, and builds a prefilled GitHub `issues/new` URL from them.

Two constraints make it safe:

- **It never changes the page.** The whole UI lives in a shadow root under `#ds-annotate`, and the
  page stays fully readable without JavaScript (ADR-0002).
- **It never holds a credential.** The overlay opens the GitHub form; the signed-in user reviews and
  submits it. The body is also copied to the clipboard, and when the prefilled URL would exceed the
  measured length limit the overlay opens the form with a paste note instead of the body.

The build gate is `NODE_ENV`, not `PUBLIC_SITE_ENV` directly: `vite-plugin-svelte` forces
`compilerOptions.dev` off in a production build, so a staging build must be a Vite *development*
build for `__svelte_meta` to exist at all. `vite.config.ts` derives both from `PUBLIC_SITE_ENV` and
sets `NODE_ENV` explicitly on every build, so an inherited `NODE_ENV` never decides the outcome. The
`__DS_ANNOTATE__` build constant makes the overlay import dead code in production.

## Alternatives

- A hosted review tool: another account, another integration, and it cannot name a source file.
- Calling the GitHub API from the overlay: needs a token in a client bundle on a public host.
- Shipping the overlay everywhere behind a query parameter: leaves development metadata in the
  production bundle, which bloats it and exposes the source tree.

## Consequences

- Staging builds are development builds: larger, slower, and unminified. That is the cost of the
  metadata, and it does not affect production.
- `scripts/verify-robots.mjs` asserts both sides — `__svelte_meta` and the `ds-annotate` marker
  present in staging, absent in production — including the adversarial case where the production
  build inherits `NODE_ENV=development`.
- `site.repo` in `src/lib/content/site.ts` must name a real repository before the overlay's issue
  link works.
