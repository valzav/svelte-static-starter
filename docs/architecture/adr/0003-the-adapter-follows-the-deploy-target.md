# 0003. The adapter follows the deploy target

Status: accepted

## Context

ADR-0002 makes the output fully static, so any static host can serve it. The adapter is therefore a
hosting decision, not an architectural one, and it should stay that way.

## Decision

Default to `@sveltejs/adapter-static` with Cloudflare Pages in mind: build root `site/`, output
`site/build/`, and a `static/_headers` file that Cloudflare reads from the build output. Nothing in
the component, content, or style architecture may depend on the adapter.

## Alternatives

- `adapter-cloudflare` (Workers), `adapter-vercel`, `adapter-netlify`: all one-line swaps, needed
  only when something must render per request.
- `adapter-node` behind your own server: a container to run and patch for content that never
  changes per request.

## Consequences

- Changing host means changing one import in `vite.config.ts`, and the `_headers` file if the new
  host does not read it.
- `static/_headers` and `scripts/verify-robots.mjs` name a staging hostname. Both must be updated
  for a real project; the wildcard `:project.pages.dev` rules are correct for any Pages project.
