# PRD 02 — Hero Diary Effect

## Start-work prompt

> Implement docs/prds/03-hero-diary-effect.md for the QCMM redesign. Read CLAUDE.md first.
> Dependency: PRD 01 (docs/prds/02-design-tokens-typography.md) must be done — this PRD
> consumes its color tokens, display serif, and `useReducedMotion` hook. Scope is already
> decided (see this PRD's "Decided" section): the headline uses the display serif, not the
> script face; the one reserved Three.js moment (hero-illustration parallax) lives here,
> layered behind the particle canvas and ink/handwriting SVG. `assets/images/you-belong-here.jpg`
> is a candidate source image for this hero — check it before sourcing/commissioning
> anything new. Still open: final hero copy (use placeholder copy from the current site
> until provided) and whether the ink dissolve needs full occlusion of the outgoing line.
> Build the sr-only static heading and the aria-hidden animated layer together from the
> start, not the animated layer first with accessibility retrofitted. When done: sweep for
> dead code, commit, then archive this file.

## What it does

The hero's headline area writes itself in, 2–3 short lines (event dates, tagline, "you
belong here"), like handwriting rather than a uniform typewriter tick, then each line
dissolves into an ink blot before the next line appears. The final line writes in and
stays — a static, fully legible headline at rest.

## Interaction/animation behavior, in plain terms

- Content lives in the DOM twice, for different audiences: a real static `<h1>`/`<p>` for
  screen readers and no-JS/reduced-motion visitors, and a decorative `aria-hidden` layer
  that does the writing/dissolving animation for sighted, motion-enabled visitors.
- Handwriting reveal: built as SVG text (or per-character spans) with a staggered
  Framer Motion timeline. "Variable speed, not uniform" means per-character delay has
  jitter (e.g. randomized 30–90ms per character, seeded so it's reproducible rather than
  actually random each load) plus slightly longer pauses at word boundaries, so it reads
  as a hand pausing to think rather than a metronome.
- Ink dissolve: an irregular blob shape (either a handful of pre-drawn SVG blob paths
  morphed between via interpolation, or an SVG filter using `feTurbulence` +
  `feDisplacementMap` for an organic edge) expands from a point to cover the line's
  bounding box, then the next line begins underneath/after it. This is the transition
  between lines, not a decoration — it needs to fully occlude the outgoing line before the
  incoming one starts, so there's no overlap/legibility gap.
- The final line does not dissolve — it writes in and holds, matching the static heading
  exactly in content and typography.
- Total animation duration is capped (e.g. under ~4–5s end to end) so visitors who don't
  wait around aren't stuck looking at an unfinished sentence for a long time.
- **The one reserved Three.js moment lives here:** a hero illustration renders behind the
  particle layer and reacts to scroll with a subtle parallax offset (illustration moves at
  a different rate than the foreground content as the user scrolls past the hero). This is
  the only Three.js usage on the site — everything else stays DOM/canvas-2D.

## Accessibility branch

- The entire animated SVG/canvas layer is `aria-hidden="true"` and `focusable="false"`.
- A real, static heading is present in the DOM at all times with the final headline
  content — this is what screen readers and no-JS visitors get, immediately, with no
  animation dependency.
- **Design decision needing sign-off:** rather than crossfading between "animated layer"
  and "static layer" at the end (which risks a visible duplicate-text flash), the proposal
  is that the animated layer's resting frame *is* the visible legible headline — styled
  identically to the real heading typography — while the real `<h1>` stays visually
  `sr-only` (present, accessible, never visually shown). This is the same accepted pattern
  used for text-scramble/reveal effects elsewhere; flagging it explicitly since the brief's
  "settle on a final static, fully legible headline" phrasing is consistent with either
  reading.
- Under `prefers-reduced-motion: reduce`: skip the handwriting/ink animation entirely. The
  static heading is shown immediately at full opacity with no motion. If the animated layer
  mounts at all under reduced motion, it renders directly in its resting frame with no
  transition — never partially animated.
- No flashing faster than 3Hz — the ink dissolve must read as a soak/spread, not a strobe.
- Ink color against hero background must hit body/large-text contrast at the resting frame,
  tying back to PRD 01's contrast matrix.
- The parallax illustration's scroll-linked offset is disabled under
  `prefers-reduced-motion: reduce` — the illustration renders in a fixed position with no
  scroll-linked movement at all, not a reduced-magnitude version of it.

## Decided

1. **Script face conflict — resolved.** The diary-effect headline uses the **display
   serif**, not the script accent face — the headline carries actual information (dates,
   tagline). The script face is used for a small eyebrow line above the headline (e.g. "A
   festival of..."), which is decorative framing, not the load-bearing content.
2. **Three.js placement — resolved.** Lives in the hero, as hero-illustration parallax on
   scroll. Layer stack (back to front): Three.js illustration → 2D particle canvas →
   ink/handwriting SVG → sr-only static heading.

## Open questions / assumptions

1. **Copy.** Final 2–3 lines (dates/tagline/"you belong here") aren't locked — building
   against placeholder copy pulled from the current site until the client provides final
   text. Line length affects animation timing, so real copy should land before final tuning.
2. Does the dissolve need to fully hide the outgoing line, or is a partial ink-smear over
   still-legible text acceptable? Assuming full occlusion (cleaner, avoids double-exposure
   readability issues) unless told otherwise.
3. `assets/images/you-belong-here.jpg` lines up with the "you belong here" hero line — worth
   confirming it's meant as the parallax illustration itself (or source art for it) rather
   than a coincidence, before building placeholder art.

## Dependencies

- PRD 00 (Project Scaffold) and PRD 01 (design tokens: colors, display serif,
  `useReducedMotion` hook, focus utilities).
- Shares a z-index/layer contract with PRD 03 (Ambient Particle Layer) — particles sit
  behind the hero content, so the two need to agree on stacking order.
- Hosts the one reserved Three.js signature moment (decided above).
