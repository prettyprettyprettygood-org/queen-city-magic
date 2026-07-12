# PRD 04 — Scroll Choreography

## Start-work prompt

> Implement docs/prds/05-scroll-choreography.md. Read CLAUDE.md first. Depends on PRD 01.
> This PRD owns the image-reveal primitive (desaturate/blur → resolve) that PRD 05 (Gallery,
> docs/prds/06-gallery-flip-interaction.md) will import for card entrance — build it as an
> exported hook/component from the start, not something to extract later once gallery needs
> it. Section-transition wipe is decided as a soft clip-path wipe, not a literal page-curl —
> see this PRD's resolved decision. When done: sweep for dead code, commit, then archive.

## What it does

Photos enter desaturated and slightly blurred, then resolve to full color and sharpness as
they cross into the viewport. Section transitions use a soft wipe or page-turn rather than a
hard cut.

## Interaction/animation behavior, in plain terms

- **Image reveal primitive:** an `IntersectionObserver`-driven (or Framer Motion `useInView`)
  hook that transitions an image's `filter` (grayscale + blur, both composited-friendly)
  from "on" to "none," plus a small `opacity`/`transform` settle (slight scale or
  translate-in), over roughly 600–900ms with an eased curve, the first time the image enters
  the viewport. This is built once here and imported by the Gallery PRD for card-entrance —
  it does not duplicate as a second implementation there.
- Proposing **once-only** triggering (an image resolves the first time it enters view and
  stays resolved on subsequent scroll-up/down passes) rather than re-desaturating every time
  it leaves and re-enters — reads calmer and avoids images flickering back to gray if a user
  scrolls back and forth. Flagged as an assumption below since the brief doesn't specify.
- **Section transitions — confirmed as a soft wipe.** A `clip-path` transition tied to
  scroll progress via Framer Motion's `useScroll`/`useTransform`, rather than a literal
  skeuomorphic page-curl. A true page-turn (curved edge, shadow, perspective skew) is
  heavier and riskier for mobile performance; it's noted as a possible later stretch goal,
  not part of this baseline.
- All animated properties are restricted to `opacity`, `transform`, and `filter` — the
  GPU-composited properties — never `width`/`height`/`top`/`left`, per the brief's explicit
  mobile-perf constraint.

## Accessibility branch

- `prefers-reduced-motion: reduce`: images render immediately in their final state (full
  color, fully sharp) on mount — there is no desaturated/blurred starting state to reveal
  from at all under reduced motion, not just a faster transition to it.
- Section transitions become an instant cut or a very short opacity crossfade (~150ms) —
  no wipe, no skew, no page-turn motion of any kind under reduced motion.
- Motion deltas are kept small to avoid vestibular triggers — translateY/scale changes on
  image reveal capped (e.g. ≤24px translate, ≤1.05 scale), no large parallax or spin.
- Blur/desaturation is purely decorative transition styling — it never becomes the sole
  carrier of information (i.e., an image's content/meaning doesn't depend on catching it
  mid-transition; `alt` text is present and correct regardless of animation state).
- A scroll-triggered animation on one element must never end up obscuring whatever element
  currently holds keyboard focus (WCAG 2.2 2.4.11 Focus Not Obscured).

## Open questions / assumptions

- **Re-trigger vs. once-only** reveal on repeated scroll passes — proposing once-only.
- **Scope of the image-reveal primitive**: applying it to every content image site-wide
  (about section, gallery cards) or just specific sections? Proposing site-wide for
  consistency, with the Gallery PRD's card-entrance reusing the exact same hook rather than
  a gallery-specific variant.
- Gallery cards need to be clear that scroll-entrance reveal (this PRD) and the flip gesture
  (Gallery PRD) are two different animations on the same element, sequenced rather than
  conflicting — a card resolves into color on entrance, then can be flipped/advanced
  afterward. Flagging so the two PRDs don't end up fighting over the same transform.

## Dependencies

- PRD 01 (design tokens, `useReducedMotion` hook).
- Owns the image-reveal primitive that PRD 05 (Gallery) reuses — build this before or
  alongside Gallery, not after, so Gallery doesn't have to duplicate or retrofit it.
