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

## The reference is derived, not maintained

Two readers, one source. `scripts/build-token-reference.mjs` regenerates the token tables in
`design-system/README.md` and fails CI when they are stale; the `/styleguide` route parses the same
file at build time and renders every token as a swatch or a value. Neither is a hand-kept list, so
neither can disagree with the stylesheet.

The layer a token belongs to is declared by a `/* [layer] */` comment in `tokens.css`, which is what
both readers key on. Moving a token between layers is therefore a comment move, and is visible in a
diff.

## Consequences

- A rebrand is a change to the primitive layer and the semantic mappings; components do not move.
- Adding a token to `tokens.css` without regenerating the reference fails CI, by design.
- Theming is CSS-only, so it works before hydration and without JavaScript.
- Adding a component usually means adding component-layer tokens, which keeps the file long. That
  is the intended trade: the length lives in one reviewable place.
