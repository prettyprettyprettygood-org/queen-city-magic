# PRD 05 — Gallery Flip Interaction

## Start-work prompt

> Implement docs/prds/06-gallery-flip-interaction.md. Read CLAUDE.md first. Hard dependency:
> PRD 04 (Scroll Choreography, docs/prds/05-scroll-choreography.md) — confirm its
> image-reveal primitive exists and import it for card entrance rather than reimplementing.
> Flip semantics are decided: it's the sequential transition between photos (a page-flip
> rotation replacing the slider), not a front/back reveal per card — see this PRD's resolved
> decision. `assets/audio/spooky-magic.mp3` exists as the flip/click sound effect (see the
> new "Sound effect" note below) — gate it on the same mute state PRD 06 (Sound Toggle) owns,
> don't build a second independent audio toggle. Pool/ripple reveal is explicitly out of
> scope for this pass, don't build it. When done: sweep for dead code, commit, then archive.

## What it does

Replaces the current plain slider with a scrapbook/photo-album flip interaction: stacked
photo cards, drag or click to flip through them. The pool/ripple reveal effect for
individual photos is explicitly a follow-up phase, not part of this PRD.

## Interaction/animation behavior, in plain terms

- **Reading of "flip" — confirmed.** Flip is the *transition mechanic between sequential
  photos*, functionally replacing the slider's slide with a page-flip rotation — not each
  card flipping over to reveal separate front/back content.
- Cards are stacked (CSS `transform-style: preserve-3d`, `backface-visibility: hidden`), and
  advancing rotates the current card away (`rotateY`) to reveal the next one underneath —
  built with Framer Motion driving the rotation.
- Drag (`drag="x"`, constrained) is the enhancement path for advancing. It is never the
  *only* path: visible Prev/Next controls perform the identical flip transition and are
  always rendered, not hover-revealed — this satisfies WCAG 2.2 2.5.7 (Dragging Movements)
  by construction rather than as an afterthought.
- Each card's *entrance* into the stack (its initial appearance, before any flip) reuses the
  desaturate→resolve reveal primitive from the Scroll Choreography PRD, so a card first
  resolves into color, and only afterward becomes flip-able. These are sequenced, not
  simultaneous, so they don't compete for the same transform.
- **Sound effect (new — not in the original brief, added from a client-provided asset):**
  `assets/audio/spooky-magic.mp3` is labeled as a "sound effect for pensive click on
  gallery" — a short SFX on flip/advance. This plays only when the visitor has opted into
  sound via the corner sound toggle (PRD 06) — it reads the same shared mute state, not an
  independent always-on effect, so a muted-by-default visitor never hears an unexpected
  sound from interacting with the gallery. See Dependencies below.

## Accessibility branch

- The gallery is a real widget: a labeled region (e.g. `role="group"` with an accessible
  name like "Photo gallery"), with Prev/Next buttons always visible (not drag-only, not
  hover-only) and sized for comfortable tapping (proposing ≥44×44px touch targets, which
  comfortably clears the WCAG 2.2 2.5.8 24×24px minimum).
- Keyboard: Left/Right arrow keys move through the stack when the gallery has focus, in
  addition to activating the Prev/Next buttons directly via Tab + Enter/Space.
- A visually-hidden `aria-live="polite"` region announces position and content on change
  (e.g. "Image 3 of 24: [caption/alt text]") so screen reader users get concise updates
  instead of the whole DOM re-announcing.
- Every image needs real `alt` text — ideally client-provided captions; placeholder
  descriptive alt text until then.
- `prefers-reduced-motion: reduce`: the 3D `rotateY` flip is replaced with a simple opacity
  crossfade between cards (~150–200ms), no rotation transform at all.
- If a full-size/lightbox view ends up being part of this (open question below), focus moves
  into it on open and returns to the triggering control on close (Esc), per standard
  disclosure/dialog focus management.
- Flip rotation duration and perspective are kept moderate (~400–600ms, subtle perspective)
  to stay clear of vestibular-trigger territory — this isn't a full spin, it's a page-turn.
- The flip SFX is purely supplementary feedback — the `aria-live` position announcement
  above is the actual accessible signal that the flip happened, so a screen reader user
  loses nothing if sound is muted or unavailable.

## Open questions / assumptions

1. Does the gallery need a separate full-size/lightbox view, or are the stacked cards
   themselves the full presentation of each photo? Affects whether this PRD needs dialog
   focus-management on top of the in-stack navigation.
2. Image source/count for the demo — a real starter set now exists at `assets/images/`
   (city-street, games, music-sign, phonebooth-professor, professor, train-station,
   you-belong-here) — confirm whether these are the intended gallery set, hero art, or a mix
   of both before wiring up card content.
3. Confirming scope boundary: this PRD does **not** include the pool/ripple reveal effect —
   that's explicitly next-phase per the brief, noted here so it doesn't creep in.
4. Whether the flip SFX should also fire on keyboard-triggered advances (arrow keys/Prev-Next
   buttons) as well as drag, or drag-only — proposing all advance methods trigger it
   uniformly, since it's meant to read as a page-turn sound regardless of input method.

## Dependencies

- PRD 01 (design tokens, `useReducedMotion` hook, focus-glow).
- Hard-depends on PRD 04 (Scroll Choreography) for the image-reveal primitive used on card
  entrance — build Scroll Choreography first, or at minimum land its reveal hook before
  starting this one.
- Soft-depends on PRD 06 (Sound Toggle) for the shared mute-state — the flip SFX reads
  whatever global sound preference that PRD owns. Doesn't block starting Gallery work, but
  the SFX hookup needs Sound Toggle's mute state/context to exist before it can be wired in.
