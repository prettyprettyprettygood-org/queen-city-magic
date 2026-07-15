# PRD 07 — Custom Cursor

## Start-work prompt

> Implement docs/prds/08-custom-cursor.md. Read CLAUDE.md first. Depends only on PRD 01
> (tokens, `useReducedMotion`/`useHoverCapable` hooks) — fully independent, safe to build
> any time. Gate on `(hover: hover) and (pointer: fine)` via JS `matchMedia` so the island
> doesn't mount at all on touch devices, not just hidden via CSS. When done: sweep for dead
> code, commit, then archive.

## What it does

A sparkle-trail cursor that follows the pointer, desktop-only. Falls back to the system
cursor on touch devices and under reduced motion. Decorative only.

## Interaction/animation behavior, in plain terms

- A single React island mounted at the app root, listening to `pointermove` and spawning
  small sparkle particles at the pointer's position, each with a short fade-out/scale-down
  lifecycle (a capped pool — proposing ~15–20 concurrent sparkles — rendered via
  Framer Motion `AnimatePresence` or a lightweight canvas, trailing just behind the actual
  pointer). **Confirmed 2026-07-14: a small amber star/dot** matching the accent color, per
  the sparkle visual already used elsewhere (Gallery's hover sparkle, PRD 05).
- The system cursor is hidden (`cursor: none`) only within the gated scope described below —
  never globally, so a visitor who doesn't match the gate always keeps a real cursor.
- Real interactive elements keep their own `:hover`/`:focus-visible` styling entirely
  independent of the sparkle trail — the trail is additive decoration layered on top of
  normal interaction states, never a replacement for them.
- **Confirmed 2026-07-14: subtle cursor reaction over interactive elements is in scope** —
  a small extra sparkle burst or soft amber glow when the pointer is over a link/button,
  layered on top of the trail rather than replacing it. Keep it subtle (a slight
  intensity/density bump, not a shape or size change to the cursor itself) — this is meant to
  read as a light magical touch, not a flashy hover state competing with the real
  `:hover`/`:focus-visible` styling called out above.

## Accessibility branch

- Gated by `(hover: hover) and (pointer: fine)`, checked via `matchMedia` in JS (not just a
  CSS rule) so the React island itself doesn't mount — and doesn't do any pointer-tracking
  work — on touch/imprecise-pointer devices, rather than mounting and merely hiding.
- Also gated by `useReducedMotion()`: even on a desktop with a fine pointer, the trail is
  disabled and the system cursor restored under `prefers-reduced-motion: reduce`, per the
  brief's explicit instruction.
- Confirmed decorative-only: no interactive element may rely on the cursor trail as its sole
  hover indicator. Every interactive element needs its own visible hover/focus treatment
  regardless of whether the cursor trail is active.
- Sparkles render at a z-index/opacity that never obscures a focus ring (WCAG 2.2 2.4.11
  Focus Not Obscured) and never visually implies a hit target different from the real one
  (2.5.8 Target Size considerations).
- Doesn't interfere with native text selection or drag operations — if sparkle rendering
  during an active text selection reads as visual noise, that's a candidate to suppress
  during selection, though not treated as a hard requirement.

## Open questions / assumptions

Resolved (see "confirmed" notes above). One item remains informational only, not a question
needing an answer: perf ceiling on lower-end laptops hasn't been tested yet — verify once
built, not something to over-engineer for up front.

## Dependencies

- PRD 01 (design tokens: sparkle color, `useReducedMotion` and `useHoverCapable` hooks).
- Otherwise fully independent — no dependency on any other feature PRD.
