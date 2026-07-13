# PRD 03 — Ambient Particle Layer

## Start-work prompt

> Implement docs/prds/04-ambient-particle-layer.md. Read CLAUDE.md first. Depends on PRD 01
> for tokens/hooks. PRD 02 (hero, docs/prds/03-hero-diary-effect.md) was simplified during
> its own implementation — there's no Three.js layer or particle canvas in the hero anymore,
> just a static headline, a fading eyebrow line, and a parallax background image — so this
> PRD no longer inherits a z-index contract from it; read that PRD's current state before
> wiring this in so the canvas lands behind the hero's existing content, not a stack that no
> longer exists. Build as a reusable `<ParticleField>` island gated by IntersectionObserver,
> not a hard-coded hero-only effect, since section dividers reuse the same component. When
> done: sweep for dead code, commit, then archive this file.

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
- Needs to render behind PRD 02 (Hero Section)'s content (headline, eyebrow, parallax
  background image) — no longer a shared Three.js/particle z-index *contract* since PRD 02's
  Three.js layer was scoped out during its implementation, just a normal "particles sit
  behind foreground content" stacking requirement.

## Implementation notes

**Built as `src/components/ParticleField.tsx`, a plain React island** (canvas sprite pool,
`requestAnimationFrame` loop), currently mounted once in `Hero.astro` as `<ParticleField
className="hero__particles" client:idle />`. Reusability for section dividers (PRD 12's shell)
is real — the component takes no hero-specific props — but only proven at one call site so
far since dividers don't exist yet.

**`client:idle`, not `client:visible`.** The component intentionally SSRs to nothing (renders
`null` until a post-hydration effect confirms `prefers-reduced-motion` client-side — needed to
avoid a hydration mismatch between server, which can't read the media query, and client).
Astro's `client:visible` directive sets up its lazy-hydration `IntersectionObserver` on the
island's *rendered children* (`astro/dist/runtime/client/visible.js`) — with nothing rendered
server-side, there's nothing for it to observe, so hydration silently never fires. `client:idle`
hydrates the island root directly, sidestepping that dependency; the "only animate while
on-screen" requirement is still met by the component's own internal `IntersectionObserver`,
which starts/stops the rAF loop independent of the hydration timing directive.

**Ember color: reused `--color-surface-glow` / `--color-surface-primary` / `--color-surface-
accent`**, not a new dedicated token — same `getComputedStyle` + `MutationObserver`-on-
`data-theme` pattern `FadeSwapText.astro`'s sparkle canvas already uses. Reads as amber embers
on the dark Twilight/Ambitious themes and each light theme's own accent hue on the rest,
rather than clashing amber-on-blue.

**Stacking bug caught during verification, not code review alone.** The original `.hero__particles
{ z-index: -1 }` silently did nothing — `.hero` had `position: relative` but no property that
establishes a CSS stacking context, so the negative-z-index canvas escaped to the *document
root* stacking context and painted behind the hero's own gradient background, fully invisible.
Fixed by adding `isolation: isolate` to `.hero`. Caught by an actual dev-server + Playwright
screenshot check (a checksum-based "does the canvas content ever change" assertion doesn't
catch "renders correctly but is invisible"); a second, independent bug from `class` vs
`className` (Astro's compiler drops a literal `class="…"` attribute passed to a client-hydrated
framework island — it's intercepted for scoped-style forwarding and never reaches the component
as a prop) was caught the same way. Both are documented inline in `ParticleField.tsx` /
`Hero.astro` for the next component that wires a React island into a scoped-style parent.

**Single motif (amber embers), single global mount point for now** — the two "open questions"
above weren't revisited; both remain fair follow-ups once a second call site (a divider) exists
to design against.
