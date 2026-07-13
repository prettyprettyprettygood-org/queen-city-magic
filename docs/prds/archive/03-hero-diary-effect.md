# PRD 02 — Hero Section

## Start-work prompt

> Implement docs/prds/03-hero-diary-effect.md for the QCMM redesign. Read CLAUDE.md first.
> Dependency: PRD 01 (docs/prds/02-design-tokens-typography.md) must be done — this PRD
> consumes its color tokens, display serif/script fonts, and `.focus-glow`/reduced-motion
> conventions. Scope is intentionally small: a static display-serif headline (unchanged
> across visits, no per-character animation), a small eyebrow line above it that fades
> between two lines of copy, and a castle-silhouette background image with simple
> scroll-linked parallax (plain CSS transform via a scroll listener, not an animation
> library). No Three.js, no particle canvas, no per-character handwriting reveal, no ink-blot
> dissolve — those were in the original brief and got scoped out; see "Revision history"
> below for why. When done: sweep for dead code, commit, then archive this file.

## What it does

The hero shows a small eyebrow line that fades between "a night of mischief & magic" and
"you belong here," a static headline below it ("Queen City Mischief & Magic"), and a
castle-silhouette illustration behind both that drifts slightly slower than the page as the
visitor scrolls — a simple parallax depth cue, not a scroll-triggered animation sequence.

## Interaction/animation behavior, in plain terms

- **Eyebrow fade** (`FadeSwapText.astro`): shows "a night of mischief & magic," fades out,
  fades in "you belong here," holds there. Plain CSS `opacity` transition driven by a small
  vanilla-JS timer — no animation library. Built generic/reusable (`lines: string[]`, any
  number of lines, holds on the last one) since other parts of the site may want the same
  reveal/disappear/reveal treatment later.
- **Headline**: a real, static `<h1>` — "Queen City Mischief & Magic." No per-character
  reveal, no dissolve, no animation. It's just styled in the display serif at rest.
- **Parallax background** (`HeroParallaxImage.astro`): the castle silhouette is absolutely
  positioned behind the hero content. A scroll listener (rAF-throttled) offsets it via
  `transform: translate()` at roughly 12% of scroll speed, so it appears to recede slightly
  as the visitor scrolls past the hero. Implemented as a plain scroll listener + CSS
  transform, not `background-attachment: fixed` (unreliable on mobile Safari) and not
  Framer Motion.

## Accessibility branch

- The eyebrow's fading text is `aria-hidden`; a real `sr-only` element always holds the
  final line ("you belong here") so screen readers get the resting content immediately, with
  no dependency on the fade ever completing.
- Reduced motion: the eyebrow's fade is pure CSS (`motion-reduce:`/`motion-safe:` variants),
  correct at first paint before any script runs — under reduced motion the final line shows
  immediately, no fade, no flash of the opening line. The parallax scroll listener is never
  attached at all under `prefers-reduced-motion: reduce` (checked via `matchMedia` before
  attaching); the image renders in a fixed position with no scroll-linked movement.
- The static `<h1>` needs no accessibility scaffolding beyond normal heading semantics — it
  was always real, visible, load-bearing content, never a decorative animated stand-in.
- Ink/text color against the hero background ties back to PRD 01's contrast matrix
  (`--color-surface-primary` on `--color-surface-bg`, already verified per-theme).
- The castle image is `alt=""` / `role="presentation"` — purely decorative background art,
  not content a screen reader needs to announce.

## Revision history

**Original brief (superseded).** The first draft of this PRD described a much bigger
feature: 2–3 headline lines (dates/tagline/"you belong here") that handwrote themselves in
character-by-character with jittered timing, each dissolving into an ink blot before the
next line appeared, plus "the one reserved Three.js moment" — a parallax hero illustration
layered behind a particle canvas. That version was fully built (`HeroHeadline.tsx` with a
seeded-jitter character stagger and an SVG-filter ink-dissolve transition, `HeroParallax.astro`
with a raw-Three.js scene) — the client reviewed it and asked for something much simpler.
Reverted entirely rather than kept as a later "fancier mode," per the client's direction to
rewrite this PRD from scratch rather than layer a toggle on top of the discarded version.

**Simplified brief (current).** Client's own framing: "just the hero title like we had, and
a subtitle text with the simple reveal/disappear/reveal... simple, no animation, no framer
for now." Concretely: no Three.js, no particle canvas, no per-character handwriting, no ink
dissolve. The eyebrow fade (originally built with Framer Motion in `FadeSwapText.tsx` as a
React island) was also rebuilt as a dependency-free `FadeSwapText.astro` (plain CSS
transition + vanilla JS) to match "no framer." The "one reserved Three.js moment" from PRD
01's scope-decisions log is **no longer planned** — if a future PRD wants a Three.js moment
elsewhere, that's a fresh scope decision, not a carryover of this one.

**Real copy, sourced from the live site.** `https://queencitymagic.com/` was fetched
directly (client provided the URL) rather than guessing placeholder text. Its own headline
is literally "YOU BELONG HERE," confirming the hero's closing line. Its event-date copy
("9.28-29.2024, Staunton, VA") is a stale recap of last year's event, not current — the
correct upcoming date, September 26–27, 2026, comes from `project_qcmm_scope_decisions`
memory (confirmed during the Events page PRD work), not the live site's own copy. See
`reference_qcmm_live_site` memory for the full fetch record.

**Castle background image — trademark flag raised, client proceeded.** The client added
`src/assets/images/castle-background.png`, a black silhouette of an asymmetric multi-tower
castle on a cliff. Flagged before use: that specific tower arrangement and cliff base reads
as a Hogwarts-silhouette stock/clipart asset — more visually recognizable as Harry Potter
than anything else built in this project so far (more than the house colors or animal
icons). Client chose to use it as-is. See `feedback_ip_trademark_flagging` memory — this is
the highest-recognizability asset flagged to date; if further Hogwarts-adjacent imagery gets
proposed, treat this as the point past which the project is knowingly leaning into the
literal source material, not just an adjacent color/name choice.

## Dependencies

- PRD 00 (Project Scaffold) and PRD 01 (design tokens: colors, display serif, script face,
  focus utilities, reduced-motion convention).
- No dependency on PRD 03 (Ambient Particle Layer) anymore — the particle canvas and
  Three.js layer that would have shared a z-index contract with it are no longer part of
  this PRD's scope.
