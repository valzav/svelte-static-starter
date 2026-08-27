# 0001. Build the site with SvelteKit

Status: accepted

## Context

A marketing or landing site is mostly repeated building blocks — sections, cards, columns, metrics,
a disclosure list — wrapped around copy that changes more often than the markup. Hand-written HTML
duplicates those blocks and scatters the copy through the markup, so a copy change becomes a search
across files.

## Decision

Build the site as a SvelteKit application (Svelte 5 runes, TypeScript, Vite) in `site/`. `site/` is
the only publishable part of the repository and references nothing outside itself, so its build
output is the whole deploy artifact. Primitives live in `site/src/lib/components/ui/`, layout
chrome in `layout/`, and routes compose them.

## Alternatives

- Plain HTML and CSS: no build step, but no reuse and no mechanical check that copy is complete.
- Astro or Eleventy: equally good for a static page. SvelteKit wins when parts of the page need
  real interactivity, because the same component model covers both.

## Consequences

- A Node toolchain is required. Node 24 and pnpm 10 are pinned; see the README.
- Sections receive typed content as props (ADR-0004) and contain no literal copy.
- Keeping `site/` self-contained means brand masters and planning documents are copied in by hand
  rather than imported across the repository boundary.
