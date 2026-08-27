# Brand guidelines

Deliberately empty. [`README.md`](README.md) covers the mechanical side — token layers, component
contracts, the checklist — and none of that changes between projects. This file holds the part that
does: what the brand sounds like, what its marks may and may not do, and which decisions are settled
rather than merely current.

Fill each section or delete it. A heading kept with placeholder text under it is worse than no
heading, because it reads as answered.

## Positioning and voice

Who the audience is, what the product claims, and the register it claims it in. Three or four
adjectives with an example of each in use beats a paragraph of adjectives alone. Say what the voice
is **not** — that is the half that settles arguments.

## Logo

The marks in `site/src/lib/assets/logos/` are placeholders. Record:

- Which variant goes where. `Logo`'s `theme` prop names the background the mark sits **on**, so
  `dark` carries light ink.
- Minimum size and clear space.
- What is forbidden: recolouring, stretching, effects, mark plus wordmark side by side, the mark on
  a busy photograph.

## Colour

Values live in the primitive layer of `tokens.css` and are listed in
[`README.md`](README.md#tokens). Record here only what the file cannot say:

- Where each colour comes from and which are fixed by brand rather than by taste.
- The accent's role and the ratio it should hold against the ground.
- Contrast floor. The template targets WCAG AA (4.5:1 for body text) and
  `tests/e2e/contrast.spec.ts` measures the muted foreground against every supported surface.

## Typography

The template self-hosts Source Sans 3 (SIL OFL 1.1) as a working default. Record:

- The licensed family, its web-embedding terms, and where the files came from.
- Which weights are permitted, and the fallback stack when the file has not loaded.
- Any pairing rule — display versus body, and where each may appear.

If the licence for the intended family is unconfirmed, say so here and name the interim face. An
interim typeface that nobody wrote down becomes permanent.

## Layout and imagery

Grid, density, and how much air a page is expected to carry. Photography and illustration direction,
including what is off-limits. If there is no imagery, say that — an absent rule invites stock.

## Accessibility

The template ships with: prerendered HTML readable without JavaScript, native disclosure markup,
44px minimum tap targets, a visible focus ring on every interactive element, and motion that is
absent under `prefers-reduced-motion: reduce`. Record anything stricter this brand commits to, and
who signs off.

## Open questions

Decisions that are not yet made, with the person who owns each. Keep this section — a guidelines
document with nothing open is usually one that stopped being maintained.
