# PRD 03 — Ambient Particle Layer

## Start-work prompt

> Implement docs/prds/04-ambient-particle-layer.md. Read CLAUDE.md first. Depends on PRD 01
> for tokens/hooks, and shares a z-index/layer contract with PRD 02 (hero) — read
> docs/prds/03-hero-diary-effect.md's layer stack (Three.js illustration → particle canvas →
> ink SVG → static heading) before wiring this in, so the canvas lands in the right place.
> Build as a reusable `<ParticleField>` island gated by IntersectionObserver, not a
> hard-coded hero-only effect, since section dividers reuse the same component. When done:
> sweep for dead code, commit, then archive this file.

## What it does

A 2D canvas sprite system — embers, fireflies, or drifting sparkle motes — drifting behind
the hero and section dividers, for atmosphere. Explicitly not Three.js: a sprite system is
lighter and easier to gate behind reduced motion.

## Interaction/animation behavior, in plain terms

- A reusable `<ParticleField>` React island, mounted per-section (hero + divider sections),
  gated by `IntersectionObserver` so it only animates while its section is actually on
  screen.
- Sprite pool sized for the viewport (roughly 40–80 particles on desktop, scaled down on
  smaller viewports) — each with a position, a slow drift (gentle upward/downward float plus
  horizontal sine-wave sway), a size, a flickering opacity, and a warm amber/ember color
  pulled from the design tokens with slight hue variance so they don't look identical.
- Single `requestAnimationFrame` loop per mounted instance, capped `devicePixelRatio` for
  canvas sizing (uncapped DPR on a retina display tanks perf for no visible gain here), and
  the loop stops entirely — not just slows — when the tab is hidden (`visibilitychange`) or
  the section scrolls out of view.
- One consistent motif (proposing amber embers) across hero and dividers for this baseline
  demo, rather than a different sprite type per section — keeps the effect legible as "the
  site's atmosphere" rather than a novelty per section. Open question below.

## Accessibility branch

- `aria-hidden="true"` on the canvas — it's decorative, carries no content.
- `pointer-events: none` and kept below interactive content in z-index, so it can never
  intercept clicks or visually sit on top of a focus ring.
- `prefers-reduced-motion: reduce`: per the brief's instruction to disable or drastically
  simplify rather than just slow down, the canvas simply doesn't mount at all under reduced
  motion. If some ambient texture is still wanted for those users, that's a static
  background treatment (e.g. a subtle fixed gradient/texture image), not a frozen single
  frame of the particle sim — proposing no static fallback for the baseline demo and
  revisiting if it reads as too flat.
- Frame budget is watched so the canvas redraw doesn't cause scroll jank on mobile — this is
  a canvas `fillRect`/sprite-draw loop, not DOM/layout animation, so it stays off the main
  thread's layout/paint costs beyond the canvas itself.

## Open questions / assumptions

- Single motif (embers) everywhere, or does hero get sparkle motes while gallery/donate get
  fireflies? Proposing one consistent motif for the baseline demo to keep scope down;
  variant motifs per section are an easy follow-up once the base system exists.
- Single global fixed canvas spanning multiple sections, or one instance re-mounted per
  section? Proposing per-section mount gated by `IntersectionObserver` — simpler to reason
  about, and naturally pauses work for off-screen sections without extra bookkeeping.
- Particle density on lower-end devices: proposing a coarse heuristic (viewport width,
  possibly `navigator.hardwareConcurrency`) to reduce count rather than a full perf-detection
  system — flagging this as "good enough for a demo," not a production perf strategy.

## Dependencies

- PRD 01 (design tokens: particle color, `useReducedMotion` hook).
- Shares a z-index/layer contract with PRD 02 (Hero Diary Effect) — particles render behind
  the hero's ink/text layer and the Three.js parallax illustration in hero. Sequencing this
  right after hero (rather than before) means that contract is already settled when this
  PRD starts.
