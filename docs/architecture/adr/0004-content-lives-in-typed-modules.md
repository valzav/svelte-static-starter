# 0004. Content lives in typed modules, not components

Status: accepted

## Context

On a site whose copy is reviewed and approved separately from its markup, two things must be true:
a copy change should touch one place and be readable in a diff, and unfinished copy must not be
publishable by accident.

## Decision

Every headline, list, number, link, and asset reference lives in a typed module under
`site/src/lib/content/`, with shapes in `types.ts`. Components are presentational: they take content
through props and contain no literal copy.

Unfinished content is explicit, never a bare placeholder string. An item carries
`status: 'stub'` (nothing written yet), `status: 'generated'` (draft copy awaiting approval), or
`status: 'approved'`; a `Link` without an `href` renders as plain text rather than a dead anchor.
`pnpm content:check` walks the whole inventory, reports every stub, every generated entry, and
every approved link whose URL is missing or blank, and exits non-zero. Run it in the production
build command so unapproved copy cannot publish, and leave it out of the staging build so the page
can be reviewed with every section present.

## Alternatives

- Copy inline in components: faster to write, but numbers and legal text scatter, and completeness
  cannot be checked mechanically.
- A CMS or Markdown pipeline: more moving parts than a small site needs, and the copy stops being
  reviewable in a code diff.

## Consequences

- Publication edits touch one directory.
- Staging deliberately shows stub and draft copy; production cannot.
- The content check is a plain recursive walk over the exported inventory, so any new module is
  covered the moment it is added to `content/index.ts`.
