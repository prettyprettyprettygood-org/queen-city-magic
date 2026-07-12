# CLAUDE.md — Queen City Magic Redesign

Project conventions for working in this repo. Read this before starting work on any PRD in
`docs/prds/`.

## Workflow

- This build is scoped as a set of PRDs in `docs/prds/`. Each PRD has a "Start-work prompt"
  at the top — use it to kick off work on that PRD with the right context loaded.
- Don't start implementing a new feature area without a PRD covering it, reviewed and with
  open questions resolved. See `docs/prds/00-INDEX.md` for build order and dependencies.
- Once a PRD is fully implemented, verified, and committed, move its file from
  `docs/prds/` to `docs/prds/archive/`. Keeps the active list showing only what's in flight.

## Testing

- Do not run Playwright/e2e tests proactively. Only run them when explicitly asked, or when
  a change is high-risk enough that skipping verification would be irresponsible (core
  interaction logic, the donation flow, an accessibility-critical path). Small design/style
  tweaks don't need a Playwright run — a dev-server visual check is enough.
- Run typecheck/lint before considering a PRD done.

## Code structure

- Keep files small and single-purpose. If a component is growing past ~200–300 lines or
  doing several unrelated things, split it.
- Before writing new UI, check existing components for something reusable first. Don't
  duplicate a card/button/section-wrapper/etc. that already exists — extend or compose
  instead of writing a parallel version.
- Astro components by default; reach for a React island only when the piece genuinely needs
  client-side interactivity (hero diary effect, particle canvas, cursor, gallery, sound
  toggle). Static content stays static — don't ship JS for it.
- TypeScript: no untyped `any` without a specific reason; components get explicit prop
  types/interfaces.

## Design tokens

- Never hardcode colors, spacing, font sizes, radii, shadows, etc. in a component. Always
  reference the Tailwind theme tokens established in PRD 00. If a value you need doesn't
  exist as a token yet, add it to the token set — don't inline a one-off hex/px value.

## Accessibility (WCAG 2.2)

- Every PRD's accessibility branch is implemented alongside the feature, not bolted on
  afterward.
- For every new interactive/animated piece, check as you build it (not just at the end):
  reduced-motion behavior, focus-visible state, ARIA correctness, target size (≥24×24px),
  and a non-drag alternative for any drag gesture.

## Code hygiene / commits

- Before committing: sweep for dead code, unused imports/variables, leftover
  `console.log`s, and commented-out blocks.
- Commit after finishing each PRD. If a PRD is large/exhaustive, commit at sensible
  checkpoints within it too (a sub-feature working and verified), rather than one giant
  commit at the end.
- Only create commits when asked — but when a PRD wraps up, that's the natural moment to
  surface "ready to commit?" rather than waiting to be asked cold.

## Performance

- Keep scroll/hover/entrance animations restricted to `opacity`/`transform`/`filter` — the
  GPU-composited properties. This applies to any new animation anywhere in the site, not
  just the scroll choreography PRD.
- Images go through Astro's image optimization; no unoptimized full-resolution drops into
  `public/`.

## Secrets

- Formspree endpoint and Turnstile site/secret keys go through environment variables, never
  committed directly. `.env` stays gitignored.
