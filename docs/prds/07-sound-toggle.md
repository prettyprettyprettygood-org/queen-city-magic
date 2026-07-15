# PRD 06 — Sound Toggle

## Start-work prompt

> Implement docs/prds/07-sound-toggle.md. Read CLAUDE.md first. Depends only on PRD 01
> (tokens, `useReducedMotion` for icon animation) — safe to build any time relative to
> hero/particles. Gallery (PRD 05, rewritten 2026-07-14) no longer has a flip SFX and doesn't
> read this PRD's mute state — that coupling is gone, so this PRD has no downstream
> dependents to sequence around anymore. Use
> `public/audio/geoffharvey-let-the-mystery-unfold-122118-128k.mp3` (re-encoded 2026-07-14,
> ~134kbps VBR — not the original 256kbps file) as the ambient loop — this is a provisional
> decision (see "Audio asset — decided (provisional)" below), so keep the audio source
> swappable from one place, not hardcoded in multiple spots. When done: sweep for dead code,
> commit, then archive.

## What it does

A small, corner-anchored, icon-based toggle (flame or quill) for a soft ambient loop (fire
crackle, wind, distant chatter — not anything melodic). Muted by default; playback only ever
starts from an explicit user click, no autoplay attempt.

## Interaction/animation behavior, in plain terms

- A persistent fixed-position `<button>` (bottom-right corner) paired with a single looping
  `<audio>` element carrying the ambient track. No other fixed-position UI has landed since
  PRD 12 (Site Layout) shipped, so there's no known collision to design around — just verify
  the corner placement reads/taps well on small viewports once built (confirmed 2026-07-14:
  "just make sure mobile looks good," not a specific alternate placement).
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

**Re-encoded 2026-07-14** to cut file size: `public/audio/geoffharvey-let-the-mystery-unfold-122118-128k.mp3`
(libmp3lame, VBR `-q:a 5`, ~134kbps actual, 2.1MB vs. the original's 3.8MB at 256kbps CBR).
Re-encoding an already-lossy MP3 to a lower bitrate is never literally lossless — some data
is discarded either way — but at VBR ~130kbps a soft ambient background loop played quietly
behind a page is generally indistinguishable from the 256kbps source to most listeners,
especially on laptop/phone speakers. **Use the `-128k` file when this PRD is built**, not the
original — the untouched original stays in the repo in case a future need for higher quality
comes up. Trimming to a shorter seamless loop point (also mentioned in the original
size-budget note) still hasn't been done — that requires actually listening for a clean loop
point, not a mechanical re-encode, so it's left as a manual task for whoever builds this PRD.

## Open questions / assumptions

None remaining — resolved 2026-07-14, see notes above.

## Dependencies

- PRD 01 (design tokens: icon styling, focus-glow, `useReducedMotion` for icon animation).
- No dependency *on* other feature PRDs. PRD 05 (Gallery)'s soft dependency on this PRD's
  mute state was cut alongside Gallery's 2026-07-14 rewrite (no flip SFX to gate anymore) —
  this PRD is fully isolated again, no longer anything else's build-order consideration.
