# 0002. Prerender every route

Status: accepted

## Context

A marketing site serves identical content to every visitor. It still needs server-rendered HTML: to
stay readable without JavaScript, and to be indexed. SvelteKit distinguishes runtime SSR (HTML per
request) from prerendering (HTML at build time); both produce that HTML.

## Decision

Prerender everything: `export const prerender = true` in the root layout, with
`@sveltejs/adapter-static`. Hydration stays on so progressive behaviour works, but every section is
complete in the HTML before any script runs. Set `prerender.handleMissingId` and
`handleHttpError` to `fail`, so a broken `#anchor` or a link to a route that does not exist breaks
the build instead of shipping.

## Alternatives

- Runtime SSR with `adapter-node` or an edge adapter: a server to run and pay for, with no benefit
  while every visitor sees the same page. Switching later means changing the adapter and removing
  the `prerender` export; no component changes.
- A client-only SPA: fails without JavaScript and indexes badly.

## Consequences

- Content changes require a rebuild and redeploy.
- `handleMissingId: 'fail'` is load-bearing. Navigation and in-page links are verified at build
  time, which is why the demo content links only to section ids that exist.
- Anything genuinely per-request would need a different adapter and its own decision.
