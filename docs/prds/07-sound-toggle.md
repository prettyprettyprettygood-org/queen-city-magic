# PRD 06 — Sound Toggle

## Start-work prompt

Implement docs/prds/07-sound-toggle.md. Read CLAUDE.md first. Use
`public/audio/geoffharvey-let-the-mystery-unfold-122118-128k.mp3`. This control now lives
inside `src/components/ThemeSelect.astro`'s existing dropdown (see "Placement — decided" below)
rather than as its own fixed-position button — read that section before touching markup, since
it changes where the audio element and its script logic live relative to `ThemeSelect` and
`Navbar.astro`.

## What it does

A "Sound: On/Off" row at the bottom of the existing house-color dropdown (`ThemeSelect`),
below a divider, paired with a single looping `<audio>` element carrying the ambient track.
Audio starts only from an explicit user click — no autoplay attempt.

## Placement — decided (2026-07-16)

This PRD originally specced a standalone fixed-position corner button. **Superseded.** The
toggle now lives as the last row inside `ThemeSelect`'s dropdown panel (`.select-options`),
under a divider line separating it from the house-color radio options above it.

- This closes out the open question PRD 11 (Site Layout) partially addressed (fixed-corner
  collision with other chrome) by removing the fixed-position footprint entirely — there's no
  longer a separate corner element to collide with anything. The "just make sure mobile looks
  good" note from 2026-07-14 no longer applies to a corner tap target; it now applies to the
  dropdown row instead, which already inherits its sizing from `ThemeSelect`'s existing
  `.option-label` treatment (see below), already verified to work at mobile widths.
- **Because `ThemeSelect` is rendered twice** (`Navbar.astro`'s desktop nav and its mobile
  disclosure panel — both exist in the DOM simultaneously, one just `display: none`'d by
  media query), the sound-toggle row also exists twice. The theme radios handle this for free:
  same `name="qcmm-theme"` across both instances means the browser's native radio grouping
  keeps them in sync with no extra JS. A toggle `<button>` gets no such native grouping, so
  the implementation must explicitly keep both instances' visible state (and `aria-pressed`)
  in sync with each other and with the one real `<audio>` element — e.g. a shared script
  querying every `[data-sound-toggle]` node the same way `ThemeSelect`'s own script already
  queries every `[data-theme-select]` node.
- **The `<audio>` element itself is a singleton** — exactly one in the DOM regardless of how
  many toggle rows exist. It does not belong inside `ThemeSelect.astro` (which is instantiated
  twice); put it once in `Navbar.astro` (which already hosts both `ThemeSelect` instances) or
  in `BaseLayout.astro`.
- Stay in vanilla `<script>`, consistent with `ThemeSelect`'s existing implementation and
  CLAUDE.md's guidance to reserve React islands for things that genuinely need client
  interactivity beyond a toggle + audio element.

## Interaction/animation behavior, in plain terms

- Inside `ThemeSelect`'s `.select-options` panel, after the existing theme `<fieldset>`: a
  thin `1px` rule using `var(--color-surface-border)` (matching the panel's own border and
  the option icon chips' border — not `Divider.astro`, which is an ornamental prose-section
  divider with a gold `Sparkle` glyph, the wrong visual weight for a compact menu row).
  Purely decorative — `aria-hidden`/`role="presentation"`, same treatment `Divider.astro`
  already uses for its own lines.
- Below that divider: a single full-width row, styled like `ThemeSelect`'s `.option-label`
  rows (same `min-height: 2.25rem`, padding, hover background) for visual consistency, but a
  real `<button>` rather than a radio — this is an independent on/off setting, not a member of
  the house-color radio group, so it stays outside the `<fieldset>`.
- Label text is literally **"Sound: On"** / **"Sound: Off"**, swapping with the state. Note:
  this is a deliberate deviation from the ARIA APG toggle-button pattern's usual advice to keep
  the accessible name stable and convey state only via `aria-pressed` — here the visible label
  swap is the point (client asked for a plain on/off readout matching the menu style). Keep
  `aria-pressed` in sync alongside the text as a redundant, non-conflicting state cue, not a
  replacement for it.
- No icon swap (no flame/quill). The corner-button design's icon-based on/off states are
  dropped along with the corner placement — a text row matches the rest of the dropdown's
  text-first option rows better than an icon would.
- Clicking the row toggles play/pause with a short volume fade-in/fade-out (avoids an abrupt
  jolt of sound starting or stopping). **Decision:** unlike selecting a theme, clicking the
  sound row does not close the dropdown (`details` stays open) — flipping sound on/off is a
  quick, repeatable flip a visitor may want to redo without reopening the menu, unlike
  committing to a theme choice.
- Default state on load: paused, muted. No `autoplay` attribute, no attempt to start audio
  programmatically before a user gesture — both because the brief asks for it explicitly and
  because browsers block unprompted autoplay anyway.
- Preference optionally persisted in `localStorage` so a returning visitor's choice is
  remembered — but even if the stored preference is "on," most browsers still require a
  fresh user gesture on that page load before `audio.play()` will actually succeed. Both
  toggle rows can reflect the saved "on" state visually on load, but the code needs to retry
  playback on the visitor's first click/keypress anywhere on the page if the initial attempt
  is silently blocked. Documenting this as a real technical constraint, not something fully
  solvable client-side.

## Accessibility branch

- A real `<button>`, with `aria-pressed` reflecting on/off state alongside the swapping
  visible label (see the deliberate-deviation note above) — following the ARIA APG
  toggle-button pattern otherwise.
- Target size ≥24×24px CSS at minimum (WCAG 2.2 2.5.8) — already satisfied by matching
  `ThemeSelect`'s `.option-label` row sizing (`min-height: 2.25rem` ≈ 36px), which the
  dropdown context inherits automatically by reusing that treatment.
- Visible `.focus-glow` ring when tabbed to, matching `ThemeSelect`'s own trigger/options
  focus treatment and the rest of the site.
- The decorative divider needs no ARIA role of its own (`aria-hidden`/`role="presentation"`,
  per `Divider.astro`'s existing precedent) — the `<fieldset>`/`<legend>` above it already
  names the radio group, and the button below it has its own accessible name.
- No icon-flicker/reduced-motion consideration remains for this control specifically (the
  icon-swap design that motivated it is gone) — `prefers-reduced-motion` still applies as
  usual to the volume fade-in/fade-out if that's implemented with an animated/timed
  transition rather than a direct value set.
- Keyboard/dismissal behavior (Escape closes the dropdown and returns focus to its trigger,
  outside-click closes it) is already handled by `ThemeSelect`'s existing `details` keydown
  listener and needs no reimplementation — the sound row is just another focusable child
  inside that same disclosure.

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

None remaining — placement resolved 2026-07-16 (see "Placement — decided" above); everything
else was already resolved 2026-07-14, see the audio-asset notes above.

## Dependencies

- PRD 01 (design tokens: focus-glow, radius/border/panel tokens already reused from
  `ThemeSelect`'s own styling).
- **PRD 11 (Site Layout)** — hard dependency now, where it previously had none. The toggle is
  built as an addition to `ThemeSelect.astro` and lives inside the `Navbar.astro` chrome that
  PRD 11 shipped; there's no longer a standalone fixed-position element that could be built
  independently of that dropdown existing.
- No dependency on Gallery — its earlier soft dependency on this PRD's mute state was cut
  alongside Gallery's 2026-07-14 rewrite (no flip SFX to gate anymore) and stays cut; this
  rewrite doesn't reintroduce it.
