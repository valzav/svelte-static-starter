# 0005. Design tokens as layered CSS custom properties

Status: accepted

## Context

Design values need one source of truth that survives a rebrand, a theme switch, and a component
being reused on a different page.

## Decision

Plain CSS with a three-layer token file, `site/src/lib/styles/tokens.css`:

1. **Primitive** — raw palette, type scale, spacing scale, radii, durations. Components never use
   these directly.
2. **Semantic** — role names (`--ds-bg`, `--ds-fg`, `--ds-fg-muted`, `--ds-accent`, `--ds-border`).
   Dark is the default on `:root`; the light theme redefines only these under `[data-theme='light']`.
3. **Component** — per-component aliases resolving to semantic tokens, so one component's spacing or
   colour can move without touching the palette.

`base.css` holds the reset, `@font-face`, focus ring, and reduced-motion rules. Components use
Svelte scoped styles that reference tokens only — no raw colours, sizes, or font names. An
end-to-end test asserts that no `.svelte` file contains a hex or `rgb()` literal.

## Alternatives

- Tailwind: a build dependency and a second styling vocabulary layered over a token system that
  already covers theming.
- A Svelte UI kit: brings its own visual system, which then has to be fought.

## Consequences

- A rebrand is a change to the primitive layer and the semantic mappings; components do not move.
- Theming is CSS-only, so it works before hydration and without JavaScript.
- Adding a component usually means adding component-layer tokens, which keeps the file long. That
  is the intended trade: the length lives in one reviewable place.
