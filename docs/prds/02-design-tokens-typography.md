# PRD 01 — Design Tokens & Typography Scaffold

## Start-work prompt

> Implement docs/prds/02-design-tokens-typography.md for the QCMM redesign. Read CLAUDE.md
> first for project conventions. Dependency: PRD 00 (docs/prds/01-project-scaffold.md) must
> be done — the Astro app, Tailwind, and `src/lib/hooks/` need to exist before this PRD has
> anywhere to put its config and hooks. Every later PRD depends on what gets set up here
> (Tailwind theme tokens, font loading, the `useReducedMotion`/`useHoverCapable` hooks, the
> `.focus-glow` utility, the contrast matrix). Check docs/prds/00-INDEX.md's "Shared
> utilities" list so these get built generically enough for hero, particles, cursor, scroll
> choreography, gallery, and sound toggle to all consume them without rework later. Propose
> the palette + full contrast matrix as a reviewable artifact before locking it in, since
> it's originated for this demo rather than pulled from existing brand assets. When done:
> sweep for dead code (see CLAUDE.md), commit, then move this file to docs/prds/archive/.

## What it does

Establishes the visual and technical foundation every other PRD builds on: the Tailwind
theme (jewel-tone palette + amber accent), the type scale (display serif anchor + script
accent for eyebrows only + body face), texture assets, and the shared accessibility
utilities (`useReducedMotion`, `useHoverCapable`, focus-glow ring) that get reused across
the rest of the build. This is a config/scaffold PRD, not an animated feature — its "behavior"
section is about what gets set up, not what moves.

## What it does, in plain terms

- Tailwind config extended with named color tokens instead of raw hex sprinkled through
  components: something like `twilight` (indigo-950 base), `plum`, `forest`, and `amber`
  (the warm accent/light source), plus neutral `parchment` (off-white/cream, for text on
  dark surfaces) and `ink` (near-black, for text on light/parchment surfaces).
- Font loading: the existing display serif from the QCMM logo is the anchor face for
  headings — needs the actual font file/license from the client's brand kit, since it's
  not something we can guess from the live GoDaddy site. One hand-lettered/script face
  added for section eyebrows only.
- Base layer: body font, heading font, and a `.focus-glow` utility class (soft amber
  box-shadow ring, not just an outline color swap) applied via `:focus-visible`.
- Two hooks: `useReducedMotion()` (reactive `matchMedia('(prefers-reduced-motion: reduce)')`
  listener) and `useHoverCapable()` (reactive `matchMedia('(hover: hover) and (pointer: fine)')`
  listener) — every later interactive/animated PRD imports these rather than re-implementing
  media-query listening.
- Texture assets: parchment grain, ink-wash, wax-seal, brass-instrument, and constellation
  motifs as reusable background images/SVGs, scoped so they read as Victorian/Edwardian
  occult-adjacent rather than a specific franchise (no basin-and-wisp iconography, no
  house-crest iconography, no maroon/gold pairing as a system).

## Accessibility branch

This PRD *is* the accessibility branch for everything downstream, in the sense that it's
where the shared tools get built once:

- `useReducedMotion()` / `useHoverCapable()` hooks, built here, reused everywhere else —
  this is the mechanism by which every other PRD's reduced-motion behavior stays consistent
  instead of six slightly-different implementations.
- `.focus-glow` must itself be checked for non-text contrast (3:1) against both the darkest
  surface (twilight/plum) and the lightest (parchment) it can appear on.
- Deliverable: a contrast matrix — every planned text/background pairing (body text 4.5:1,
  large text/UI 3:1) checked at the *actual* production hex values, not eyeballed against
  the jewel-tone direction. This has to happen before any page ships copy in these colors.

## Open questions / assumptions

- Do we have the actual display-serif font file and a license for web use, or do we need to
  source a close visual match? The current site is GoDaddy Website Builder, which typically
  doesn't expose the underlying font file directly — will need it from the client or extracted
  from their logo/brand assets.
- Script accent face: no candidate chosen yet. Needs a face that's clearly decorative/script
  but still legible at small eyebrow sizes — will propose 2–3 candidates (e.g. a licensed
  Google Fonts hand-lettered face) for the client to react to, since this is a visible brand
  choice, not just a technical one.
- Exact hex values for the jewel tones are not locked yet — "twilight indigo, plum, deep
  forest, warm amber" is a direction, not a swatch. Will propose a candidate palette with the
  full contrast matrix attached so it can be reviewed as one artifact, not adjusted color by
  color later.
- No existing non-maroon/tan brand assets to anchor against — this palette is being
  originated for the demo, so it should be treated as a proposal for client reaction, not a
  locked decision.

## Dependencies

PRD 00 (Project Scaffold) must be done first. Every other feature PRD depends on this one.
