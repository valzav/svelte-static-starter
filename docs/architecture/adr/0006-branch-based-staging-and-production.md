# 0006. Branch-based staging and production environments

Status: accepted

## Context

A public site needs a place to review changes that search engines must not index, and the
distinction has to survive a misconfigured deploy.

## Decision

One environment variable, `PUBLIC_SITE_ENV`, decides. **Anything but the exact string `production`
is staging**, so a missing or misspelled value fails safe to noindex. Production sets it explicitly;
staging, previews, and local development leave it unset.

Staging emits `<meta name="robots" content="noindex, nofollow">` and a disallowing `robots.txt`;
production emits neither. `static/_headers` adds a host-level `X-Robots-Tag: noindex` for the
staging domain and every `pages.dev` preview host, so the guarantee does not depend on the page
alone. `src/lib/site-env.ts` holds the pure mapping and imports no `$env` module, so unit tests can
drive both environments; `src/lib/env.ts` is the only file that reads the real environment.

Branches carry the mapping: `dev` is the integration branch and deploys staging, `main` is the
release branch and deploys production, and promotion is a `dev` → `main` pull request. Only the
production environment sets `PUBLIC_SITE_ENV`; pull-request previews inherit staging behaviour for
free. `.github/workflows/ci.yml` runs on both branches.

`scripts/verify-robots.mjs` builds both environments and asserts the outputs of each. It is the only
check that observes a production build, so it belongs in CI.

## Alternatives

- Treating an unset variable as production: one forgotten variable indexes a staging site.
- `$env/static/public`: emits one export per *defined* variable, so an unset `PUBLIC_SITE_ENV`
  fails the build rather than defaulting to staging. `$env/dynamic/public` is used instead; values
  are still frozen at build time because every page is prerendered (ADR-0002).

## Consequences

- Every deploy target must set `PUBLIC_SITE_ENV=production` for production and nothing else
  anywhere else.
- `verify:robots` runs two full builds, so it is slower than the other checks.
- The same flag gates the annotate overlay (ADR-0007).
