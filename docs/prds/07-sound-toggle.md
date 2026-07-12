# PRD 06 — Sound Toggle

## Start-work prompt

> Implement docs/prds/07-sound-toggle.md. Read CLAUDE.md first. Depends only on PRD 01
> (tokens, `useReducedMotion` for icon animation) — safe to build any time relative to
> hero/particles, but build it *before or alongside* Gallery (PRD 05) if possible, since
> Gallery's flip SFX reads this PRD's shared mute state/context. Use
> `assets/audio/geoffharvey-let-the-mystery-unfold-122118.mp3` as the ambient loop — this is
> a provisional decision (see "Audio asset — decided (provisional)" below), so keep the
> audio source swappable from one place, not hardcoded in multiple spots. Export the
> mute-state as something Gallery's SFX can read (context/store/module-level signal — pick
> whichever fits the rest of the state approach). When done: sweep for dead code, commit,
> then archive.

## What it does

A small, corner-anchored, icon-based toggle (flame or quill) for a soft ambient loop (fire
crackle, wind, distant chatter — not anything melodic). Muted by default; playback only ever
starts from an explicit user click, no autoplay attempt.

## Interaction/animation behavior, in plain terms

- A persistent fixed-position `<button>` (proposing bottom-right corner, pending a layout
  pass to make sure it doesn't collide with other fixed UI — see open questions) paired with
  a single looping `<audio>` element carrying the ambient track.
- Default state on load: paused, muted. No `autoplay` attribute, no attempt to start audio
  programmatically before a user gesture — both because the brief asks for it explicitly and
  because browsers block unprompted autoplay anyway.
- Click toggles play/pause with a short volume fade-in/fade-out (avoids an abrupt jolt of
  sound starting or stopping) and swaps the icon between an "off" state (quill/flame
  outline) and an "on" state (lit/animated flame).
- Preference optionally persisted in `localStorage` so a returning visitor's choice is
  remembered — but even if the stored preference is "on," most browsers still require a
  fresh user gesture on that page load before `audio.play()` will actually succeed. The
  button can reflect the saved "on" state visually, but the code needs to retry playback on
  the visitor's first click/keypress if the initial attempt is silently blocked. Documenting
  this as a real technical constraint, not something fully solvable client-side.

## Accessibility branch

- A real `<button>`, with a stable accessible name (e.g. "Ambient sound") and `aria-pressed`
  reflecting on/off state — following the ARIA APG toggle-button pattern (state conveyed via
  `aria-pressed`, not by swapping the label text itself, which would be confusing for screen
  reader users mid-toggle).
- Target size ≥24×24px CSS at minimum (WCAG 2.2 2.5.8), with a comfortable mobile tap area
  in practice given the corner placement.
- Visible `.focus-glow` ring when tabbed to, matching the rest of the site's focus treatment.
- If the "on" icon animates (e.g. a flickering flame), that flicker itself respects
  `prefers-reduced-motion` — a static lit icon instead of an animated flicker under reduced
  motion. This is icon-level motion, independent of whether the audio itself plays.

## Audio asset — decided (provisional)

`assets/audio/geoffharvey-let-the-mystery-unfold-122118.mp3` is in the repo, attributed as
"Music" from Pixabay — melodic, which technically diverges from the brief's "not anything
melodic" instruction. **Decision (2026-07-11): use it as the ambient loop for now.** This is
explicitly provisional — the client may swap it for something else later if it doesn't feel
right once it's actually running on the site. Implementation should keep the swap cheap: one
audio source reference, not something wired in six places.

## Open questions / assumptions

- Exact corner placement on mobile, given other fixed UI that may exist (nav, any future
  fixed gallery controls) — needs a layout pass once other fixed-position elements are known,
  to avoid overlap.
- File format/size budget for the loop: `geoffharvey-let-the-mystery-unfold-122118.mp3` is
  256kbps/3.8MB — larger than ideal for a background loop; if it (or its replacement) ships,
  it should be re-encoded to a smaller size (e.g. ~128kbps, trimmed to a shorter seamless
  loop) rather than shipped at source quality.

## Dependencies

- PRD 01 (design tokens: icon styling, focus-glow, `useReducedMotion` for icon animation).
- No dependency *on* other feature PRDs, but PRD 05 (Gallery) now has a soft dependency *on*
  this one for its flip SFX's mute state — this is no longer fully isolated the way it was
  before that connection existed, worth building relatively early as a result.
