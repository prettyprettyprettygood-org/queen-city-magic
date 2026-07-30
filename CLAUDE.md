# CLAUDE.md — Magic Festival

Project conventions for working in this repo. This is a generic, reusable event-site
template — placeholder branding, lorem ipsum copy, and stock imagery throughout — ready to be
re-skinned for a real event.

## Testing

- Do not run Playwright/e2e tests proactively. Only run them when explicitly asked, or when
  a change is high-risk enough that skipping verification would be irresponsible (core
  interaction logic, the donation flow, an accessibility-critical path).
- Do not start the dev server or drive a headless browser (Playwright, chromium-cli, etc.)
  yourself just to look at a UI/design change. That round-trips rendered screenshots through
  the model and costs far more in tokens than it's worth — the user can capture a screenshot
  for a fraction of the cost. This supersedes any general guidance elsewhere (including a
  skill's default behavior, e.g. `/verify` or a `run` skill) to launch-and-screenshot before
  reporting a UI change done.
- Instead: describe what changed and, if visual confirmation matters, explicitly ask the user
  for a screenshot rather than assuming — don't silently skip verification either. Applies to
  small tweaks and larger redesigns alike.
- Typecheck/lint (`astro check`, `biome check`) are still expected before considering a change
  done — those are cheap and stay proactive; they're not what this rule is about.

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
  reference the Tailwind theme tokens in `src/styles/tokens.css`. If a value you need doesn't
  exist as a token yet, add it to the token set — don't inline a one-off hex/px value.

## Accessibility (WCAG 2.2)

- Every feature's accessibility branch is implemented alongside it, not bolted on afterward.
- For every new interactive/animated piece, check as you build it (not just at the end):
  reduced-motion behavior, focus-visible state, ARIA correctness, target size (≥24×24px),
  and a non-drag alternative for any drag gesture.

## Code hygiene / commits

- Before considering any change done: sweep for dead code, unused imports/variables, leftover
  `console.log`s, and commented-out blocks.
- The user makes all commits themselves. Do not run `git commit`. When a change (or a
  sensible checkpoint within a large one) is finished and verified, report that it's ready and
  let the user decide when to commit — don't wait to be asked cold, but don't run the command
  either.
- Never run `git push` without separate, explicit approval, even after a commit exists.
- If the user explicitly asks for a commit to be made, make it — but never add a
  `Co-Authored-By: Claude` (or similar AI-attribution) trailer to the message in this repo.

## Performance

- Keep scroll/hover/entrance animations restricted to `opacity`/`transform`/`filter` — the
  GPU-composited properties. This applies to any new animation anywhere in the site.
- Images go through Astro's image optimization; no unoptimized full-resolution drops into
  `public/`.
