# PRD 05 — Gallery

## Start-work prompt

> Implement docs/prds/06-gallery.md. Read CLAUDE.md first. Depends on PRD 01 (design tokens,
> `useReducedMotion`, focus-glow) and PRD 12 (Site Layout, for `BaseLayout`/section shell) and
> PRD 13 (Content Pages, which stubs the `/gallery` route and its Vimeo embed/Pixieset link —
> this PRD adds the photo grid to that same page, it doesn't create the route from scratch).
> Rewritten 2026-07-14: no flip/stack mechanic, no scroll-triggered image reveal, no
> pool/ripple effect — those are all cut, not deferred. Build a plain responsive image grid
> with a tasteful hover sparkle and, per the open question below, a click-to-lightbox for
> full-size viewing. Nothing here should read as a showpiece interaction — keep it closer to
> "nice normal gallery" than "flagship animation." When done: sweep for dead code, commit,
> then archive.

## Why this changed

The original brief called for a scrapbook/flip interaction plus a follow-up ripple-reveal
effect. After review, the client/user decided this was more than the gallery needs — a plain
grid with a light hover treatment reads better than a heavy interaction mechanic here.
Supersedes the previous "Gallery Flip Interaction" PRD entirely (renamed
`06-gallery-flip-interaction.md` → `06-gallery.md`); the flip/ripple/scroll-reveal
approach is cut, not parked for later.

## What it does

A responsive grid of photos — **confirmed final set** (2026-07-14): the existing starter set
at `assets/images/` (city-street, games, music-sign, phonebooth-professor, professor,
train-station, you-belong-here) is the gallery's own set, not shared with hero art. Hovering
(and focusing, for keyboard users) a thumbnail shows a small sparkle accent; clicking a
thumbnail opens it larger in a lightbox (confirmed below).

## Interaction/animation behavior, in plain terms

- **Grid layout**: CSS Grid, responsive column count (e.g. 2 columns on mobile, 3–4 on
  desktop), consistent aspect-ratio crop per thumbnail (`object-fit: cover`) so the grid
  stays even regardless of source image dimensions.
- **Hover/focus sparkle — confirmed 2026-07-14.** `@lucide/astro`'s `Sparkles` icon (already
  a project dependency per PRD 01, no new icon asset needed) in the amber accent color,
  fading/scaling in near a corner of the thumbnail on `:hover`/`:focus-visible`, using only
  `opacity` and `transform` (GPU-composited, per CLAUDE.md). A soft `filter: drop-shadow` glow
  in the same amber is a reasonable small addition for a bit more "magic glint" without
  turning it into a burst/particle effect — still one subtle accent per thumbnail, not
  several.
- **Click-to-lightbox — confirmed 2026-07-14.** Activating a thumbnail opens it at a larger
  size in a modal/dialog with Prev/Next controls, rather than only ever being visible at grid
  thumbnail size.
- No scroll-triggered reveal, no flip/rotation, no drag gesture, no ripple/pool effect
  anywhere in this PRD.

## Accessibility branch

- Grid is a real labeled region (e.g. `role="group"` with an accessible name like "Photo
  gallery").
- Every thumbnail is a real, keyboard-focusable control (`<button>` or `<a>`, not a `<div>`
  with a click handler) with `.focus-glow` and ≥24×24px effective target size.
- Every image needs real `alt` text — ideally client-provided captions; placeholder
  descriptive alt text until then.
- Sparkle hover accent triggers on `:focus-visible` as well as `:hover`, so keyboard users
  get the same affordance sighted mouse users do, not just a visual-only hover state.
- Lightbox: focus moves into it on open and returns to the triggering thumbnail on close (Esc
  or a visible close control), per standard dialog/disclosure focus management; Left/Right
  arrow keys move between images while it's open.
- `prefers-reduced-motion: reduce`: the sparkle accent appears instantly (no fade/scale-in)
  or is suppressed entirely — it's decorative, not informational, so reduced-motion visitors
  lose nothing by skipping the animation.

## Open questions / assumptions

None remaining — resolved 2026-07-14, see "confirmed" notes above.

## Dependencies

- PRD 01 (design tokens, `useReducedMotion` hook, focus-glow, `@lucide/astro`).
- PRD 12 (Site Layout) for the page shell. PRD 13 (Content Pages) stubs the `/gallery` route
  and its Vimeo embed/Pixieset link — this PRD adds the grid to that page.
- No dependency on PRD 04 (Scroll Choreography) anymore — the image-reveal primitive it used
  to provide was cut alongside this simplification.
- No dependency on PRD 06 (Sound Toggle) — `assets/audio/spooky-magic.mp3` (previously
  slated as the flip-click SFX) isn't wired into this simplified version. It's still a real,
  attributed asset if a future pass wants a hover/click chime once Sound Toggle exists, but
  that's not part of this build.
