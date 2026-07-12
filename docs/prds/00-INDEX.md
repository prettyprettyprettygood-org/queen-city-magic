# QCMM Redesign Demo — PRD Index & Build Order

This directory breaks the redesign build prompt into one PRD per feature area, per the
requested workflow: scope and review before implementation. Nothing here is code yet.

Before starting work on any PRD, read [CLAUDE.md](../../CLAUDE.md) at the repo root — it
covers testing policy, file-size/reuse conventions, theme-token discipline, the WCAG 2.2
expectations that apply across every PRD, commit cadence, and the archive convention below.
Each PRD in this directory opens with a **Start-work prompt** you can hand to an agent to
begin that PRD with the right context already loaded.

## Archive convention

Once a PRD is fully implemented, verified, and committed, move its file from `docs/prds/`
into `docs/prds/archive/`. Keeps this index showing only what's actually in flight.

## Source assets

Raw client-provided assets live in `/assets` at the repo root (images, audio, an
`attribution.md`) — added ahead of the app existing. PRD 00 (Project Scaffold) is
responsible for sorting these into the actual Astro project structure (`src/assets/` for
build-processed images, `public/audio/` for static audio passthrough); don't assume a final
location for them until that PRD runs.

## PRDs

| # | PRD | Risk / independence |
|---|-----|----------------------|
| 00 | [Project Scaffold & Initialization](./01-project-scaffold.md) | True foundation — hard blocker for everything, including PRD 01 |
| 01 | [Design Tokens & Typography Scaffold](./02-design-tokens-typography.md) | Hard blocker for every feature PRD |
| 02 | [Hero Diary Effect](./03-hero-diary-effect.md) | High visibility, several open questions |
| 03 | [Ambient Particle Layer](./04-ambient-particle-layer.md) | Depends on hero's z-index contract |
| 04 | [Scroll Choreography](./05-scroll-choreography.md) | Owns the image-reveal primitive Gallery reuses |
| 05 | [Gallery Flip Interaction](./06-gallery-flip-interaction.md) | Depends on Scroll Choreography's reveal primitive; soft-depends on Sound Toggle for flip-SFX mute state |
| 06 | [Sound Toggle](./07-sound-toggle.md) | Otherwise independent, but Gallery now depends on its mute state — build relatively early |
| 07 | [Custom Cursor](./08-custom-cursor.md) | Fully independent, low risk |
| 08 | [10 Years of Pictures Interstitial](./09-ten-years-interstitial.md) | Fully independent, lowest risk |
| 09 | [Events Page](./10-events-page.md) | Independent; the date-bucketing logic (timezone-aware, midnight cutover) is the real substance here |
| 10 | [Pre-Launch Production Readiness Audit](./11-pre-launch-audit.md) | Launch gate, not a build-order item — runs after 00–09 are done |

## Shared utilities (build once, in the scaffold phases)

Several PRDs lean on the same primitives. Building these once avoids duplicated,
possibly-inconsistent handling across features:

- **PRD 00** creates `src/lib/hooks/` and the overall app structure every other PRD's code lives in.
- `useReducedMotion()` — reactive wrapper on `prefers-reduced-motion`, built in PRD 01. Consumed by: hero, particles, scroll choreography, gallery, cursor, sound-toggle icon animation.
- `useHoverCapable()` — reactive wrapper on `(hover: hover) and (pointer: fine)`, built in PRD 01. Consumed by: cursor.
- `.focus-glow` — shared focus-visible utility (soft amber glow ring), built in PRD 01. Consumed by: every interactive element, every PRD.
- Contrast-checked color tokens, built in PRD 01 — consumed by: every PRD.
- Image reveal primitive (desaturate/blur → resolve) — owned by Scroll Choreography (PRD 04), reused by Gallery (PRD 05) for card entrance (distinct from the flip gesture itself).
- Sound mute-state/context — owned by Sound Toggle (PRD 06), read by Gallery (PRD 05) for its flip sound effect.

## Recommended build order

1. **Project Scaffold & Initialization** — the actual "hard blocker for everything," ahead of design tokens. Nothing else has an app to build inside until this runs.
2. **Design Tokens & Typography Scaffold** — hard blocker for every feature PRD.
3. **Hero Diary Effect** — highest-visibility signature moment; also forces the (now-decided) Three.js placement and hero/particle z-index contract.
4. **Ambient Particle Layer** — shares hero's z-index contract, easiest to sequence right after while that context is fresh. Not a hard dependency, just convenient ordering.
5. **Scroll Choreography** — establishes the shared image-reveal primitive.
6. **Gallery Flip Interaction** — hard-depends on #5's reveal primitive, soft-depends on Sound Toggle's mute state for its flip SFX.
7. **Sound Toggle** — no hard dependency on 3–5, but Gallery (#6) now depends on it, so pulling it earlier (even before Gallery) avoids Gallery shipping its SFX half-wired.
8. **Custom Cursor** — no dependency on 3–6, could be pulled earlier and built in parallel.
9. **10 Years of Pictures Interstitial** — no dependency on 3–6, lowest risk, good parallel/filler task.
10. **Events Page** — no hard dependency on anything but PRD 01; soft-depends on Scroll Choreography's image reveal for card art, ships fine without it and picks that up later. Independent of everything else — good parallel/filler task alongside 10 Years.

Steps 1 and 2 are true hard blockers for everything. Step 6 hard-depends on step 5 and
soft-depends on step 7. Steps 7–10 have no hard dependency on 3–5 and can be parallelized
against them if that's useful for pacing — but step 7 should land before or alongside step
6, not long after, given the SFX coupling.

**PRD 10 (Pre-Launch Production Readiness Audit) runs last**, once Home, Gallery, the 10
Years interstitial, Donate, and Events all exist — it's a launch gate, not a step in this
sequence.

## Explicitly out of scope for this pass (per the original prompt)

- The Formspree + Turnstile contact/join form on Home — this is a standard build task, not a
  design-forward feature area, so it isn't getting its own PRD. It'll be scoped inline when
  the Home page is implemented, using the design tokens and focus/ARIA conventions established here.
- Pool/ripple memory-reveal effect for gallery images (next phase).
- Final Harry-Potter-lean-in/lean-away decision (client's to make).
- Final copy/password policy for the 10 Years interstitial (client's to provide).
- Join us/FAQs/MAPS pages — still deferred, reuse the same design system components later.
  **Events is no longer on this deferred list** — it was originally grouped with these as
  "not the focus of the first demo pass," but the client has since asked for it explicitly;
  see PRD 09.

## Scope decisions — confirmed

These were open questions that materially changed scope; all are now settled:

1. **Script accent face vs. hero headline.** Diary-effect headline uses the display serif,
   not the script face; the script face is reserved for a small eyebrow line above it.
   Decided in PRD 02.
2. **What "flip" means in the gallery.** Flip is the *transition mechanic* between
   sequential photos, replacing the slider's slide — not a front/back content reveal per
   card. Decided in PRD 05.
3. **How literal is "page-turn"?** Baseline is a soft `clip-path` wipe (cheaper, safer on
   mobile). A true skeuomorphic page-curl is a possible later stretch goal, not part of this
   build. Decided in PRD 04.
4. **Where does the one Three.js moment live?** In the hero, as subtle scroll-linked
   parallax on a hero illustration, layered behind the particle canvas and ink/handwriting
   SVG. Decided in PRD 02.

## New from added assets

Real image and audio assets landed in `/assets` after the PRDs above were first drafted;
they surfaced things not in the original brief:

1. **Gallery flip sound effect.** `assets/audio/spooky-magic.mp3` is attributed as a "sound
   effect for pensive click on gallery" — not mentioned in the original brief. Added into
   PRD 05 (Gallery) as supplementary, non-essential audio feedback on flip, gated by PRD 06
   (Sound Toggle)'s shared mute state so it never plays unexpectedly for a muted-by-default
   visitor.
2. **Ambient loop is melodic, not ambient — resolved (provisional).** `assets/audio/
   geoffharvey-let-the-mystery-unfold-122118.mp3` is a titled music track, diverging from the
   brief's "not anything melodic" instruction. Decided 2026-07-11: use it for now, the client
   may swap it later. See PRD 06's "Audio asset — decided (provisional)" section.
3. **`assets/images/firebolt-5k-flyer.jpg`** — previously unplaced — is the card image for
   the Firebolt 5K entry on the new Events page (PRD 09).
4. **`assets/images/you-belong-here.jpg`** — confirmed (via a screenshot of the source
   Facebook post) to be QCMM's own mural artwork bearing the literal phrase "you belong
   here," matching the hero's planned closing line. Strengthens the case, noted in PRD 02,
   that this is real hero art rather than a coincidental filename.

## Contrast note

Every text/background pairing in PRD 01's palette needs to be checked at the *actual* hex
values before anything ships — this is called out as a deliverable, not assumed from the
jewel-tone direction being "dark enough."
