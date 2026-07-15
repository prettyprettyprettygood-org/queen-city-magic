# PRD 04 — Scroll Choreography (Section Transitions)

## Start-work prompt

> Implement docs/prds/05-scroll-choreography.md. Read CLAUDE.md first. Depends on PRD 01.
> Scope was narrowed 2026-07-14: this PRD now owns only the section-transition wipe between
> stacked page sections (soft `clip-path` wipe tied to scroll progress). The image-reveal
> primitive (desaturate/blur → resolve on scroll-into-view) that used to live here was cut
> entirely as part of simplifying the Gallery PRD (docs/prds/06-gallery.md) — don't build it,
> and don't let it come back in disguise as a "nice to have." When done: sweep for dead code,
> commit, then archive.

## What it does

Section transitions (Home's stacked sections — Hero → recap → "the magic explained" → "you
belong here" → "what to expect," per PRD 13's section list, alternating twilight/plum/forest
backgrounds per PRD 12's section-shell convention) use a soft wipe rather than a hard cut as
the visitor scrolls from one to the next.

## Interaction/animation behavior, in plain terms

- **Section transitions — confirmed as a soft wipe.** A `clip-path` transition tied to
  scroll progress via Framer Motion's `useScroll`/`useTransform`, rather than a literal
  skeuomorphic page-curl. A true page-turn (curved edge, shadow, perspective skew) is
  heavier and riskier for mobile performance; it's noted as a possible later stretch goal,
  not part of this baseline.
- All animated properties are restricted to `opacity`, `transform`, and `filter` — the
  GPU-composited properties — never `width`/`height`/`top`/`left`, per CLAUDE.md's
  performance rule.

## Accessibility branch

- Section transitions become an instant cut or a very short opacity crossfade (~150ms) under
  `prefers-reduced-motion: reduce` — no wipe, no skew, no page-turn motion of any kind.
- Motion deltas are kept small to avoid vestibular triggers.
- A scroll-triggered animation on one element must never end up obscuring whatever element
  currently holds keyboard focus (WCAG 2.2 2.4.11 Focus Not Obscured).

## Cut from scope (2026-07-14)

The **image-reveal primitive** (`IntersectionObserver`-driven grayscale/blur → resolve on an
image's first scroll-into-view) originally lived here specifically to feed Gallery's card
entrance. Gallery was simplified to a plain grid with hover-only effects (see
docs/prds/06-gallery.md) and no longer wants a scroll-reveal moment, so this PRD no longer
owns or builds that primitive. Events page (PRD 09/`10-events-page.md`) had a *soft*
dependency on it for card art ("ships without it, picks it up later") — that pickup no longer
applies; Events ships with static card images permanently unless a future PRD reintroduces a
reveal effect on its own terms. No open questions remain for this PRD — the two previously
tracked here (re-trigger vs. once-only, and site-wide vs. gallery-only scope) were both about
the now-cut primitive and have been removed from docs/open-questions.md.

## Dependencies

- PRD 01 (design tokens, `useReducedMotion` hook).
- No longer feeds Gallery or Events — this PRD is now self-contained, section-transitions
  only.
