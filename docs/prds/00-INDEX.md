# QCMM Redesign Demo — PRD Index & Build Order

This directory breaks the redesign build prompt into one PRD per feature area, per the
requested workflow: scope and review before implementation. Nothing here is code yet.

Before starting work on any PRD, read [CLAUDE.md](../../CLAUDE.md) at the repo root — it
covers testing policy, file-size/reuse conventions, theme-token discipline, the WCAG 2.2
expectations that apply across every PRD, commit cadence, and the archive convention below.
Each PRD in this directory opens with a **Start-work prompt** you can hand to an agent to
begin that PRD with the right context already loaded.

Every PRD's "Open questions / assumptions" section has been consolidated into
[docs/open-questions.md](../open-questions.md) for one-pass answering — check there rather
than each PRD individually.

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
| 02 | [Hero Section](./03-hero-diary-effect.md) | High visibility; scope simplified during implementation (no Three.js/particle layer) |
| 03 | [Ambient Particle Layer](./04-ambient-particle-layer.md) | Needs to render behind hero's content (no longer a shared z-index contract, hero's Three.js layer was scoped out) |
| 04 | [Scroll Choreography (Section Transitions)](./05-scroll-choreography.md) | Rewritten 2026-07-14 — now owns only the section-transition wipe; no longer feeds Gallery |
| 06 | [Sound Toggle](./07-sound-toggle.md) | Otherwise independent, but Gallery now depends on its mute state — build relatively early |
| 07 | [Custom Cursor](./08-custom-cursor.md) | Fully independent, low risk |
| 09 | [Events Page](./10-events-page.md) | Independent; the date-bucketing logic (timezone-aware, midnight cutover) is the real substance here |
| 10 | [Pre-Launch Production Readiness Audit](./11-pre-launch-audit.md) | Launch gate, not a build-order item — runs after 00–09 are done |
| 11 | [Site Layout (Navbar, Footer, Section Shell)](./12-site-layout.md) | Added after PRD 02 shipped hero-only; wraps the hero rather than changing it. Resolves PRD 06's deferred "layout pass" for fixed-UI placement. No hard blocker for 03–09, but the sooner it lands the less retrofitting later pages need |
| 12 | [Content Pages (Home Body, FAQ, Donate, Gallery Copy)](./13-content-pages.md) | Added once `docs/content.md` (real client copy) landed. Depends on PRD 11 for the shell/nav it fills in; independent of 03–09's interaction-heavy work otherwise |
| 13 | [Page & Section Layout Conventions](./14-page-section-layout.md) | Added once PRD 12 landed real content and its duplicated ad hoc h1/h2 CSS across 6 pages became visible. Depends on PRD 11's `Section` shell; touches every page PRD 12 filled in. Open questions resolved 2026-07-15 — ready to implement |

## Shared utilities (build once, in the scaffold phases)

Several PRDs lean on the same primitives. Building these once avoids duplicated,
possibly-inconsistent handling across features:

- **PRD 00** creates `src/lib/hooks/` and the overall app structure every other PRD's code lives in.
- `useReducedMotion()` — reactive wrapper on `prefers-reduced-motion`, built in PRD 01. Consumed by: hero, particles, scroll choreography, gallery, cursor, sound-toggle icon animation.
- `useHoverCapable()` — reactive wrapper on `(hover: hover) and (pointer: fine)`, built in PRD 01. Consumed by: cursor.
- `.focus-glow` — shared focus-visible utility (soft amber glow ring), built in PRD 01. Consumed by: every interactive element, every PRD.
- Contrast-checked color tokens, built in PRD 01 — consumed by: every PRD.
- ~~Image reveal primitive (desaturate/blur → resolve) — owned by Scroll Choreography, reused by Gallery for card entrance.~~ **Cut 2026-07-14** alongside the Gallery simplification — Gallery was its only consumer. Scroll Choreography now owns only the section-transition wipe.
- Sound mute-state/context — owned by Sound Toggle (PRD 06). No longer read by Gallery (PRD 05) — the flip SFX it used to gate no longer exists after Gallery's rewrite.

## Recommended build order

1. **Project Scaffold & Initialization** — the actual "hard blocker for everything," ahead of design tokens. Nothing else has an app to build inside until this runs.
2. **Design Tokens & Typography Scaffold** — hard blocker for every feature PRD.
3. **Hero Section** — highest-visibility moment; scope was simplified during implementation (static headline, fading eyebrow line, simple scroll-parallax background image — no Three.js, no particle canvas, no handwriting/ink-dissolve).
4. **Ambient Particle Layer** — easiest to sequence right after hero while that context is fresh, but no longer has a shared z-index *contract* to inherit (hero's Three.js/particle layer was cut). Not a hard dependency, just convenient ordering.
5. **Scroll Choreography** — section-transition wipes only, as of the 2026-07-14 rewrite. No
   longer a dependency for anything else in this list.
6. **Gallery** — as of the 2026-07-14 rewrite, a plain grid with a hover sparkle. No
   dependency on Scroll Choreography or Sound Toggle; can be built in any order relative to
   them.
7. **Sound Toggle** — independent; nothing else in this list depends on it anymore (Gallery's
   flip SFX coupling was cut alongside its rewrite).
8. **Custom Cursor** — no dependency on 3–6, could be pulled earlier and built in parallel.
9. **Events Page** — no hard dependency on anything but PRD 01. No longer soft-depends on
    Scroll Choreography (that image-reveal primitive was cut, not just deferred) — ships with
    static card images permanently. Independent of everything else — good parallel/filler
    task alongside the remaining independent PRDs.

Steps 1 and 2 are true hard blockers for everything. Steps 4–10 no longer have any
cross-dependencies on each other as of the 2026-07-14 Gallery simplification — all are
freely parallelizable.

**PRD 10 (Pre-Launch Production Readiness Audit) runs last**, once Home, Gallery, the 10
Years interstitial, Donate, and Events all exist — it's a launch gate, not a step in this
sequence.

**PRD 11 (Site Layout) was added after this build order was drafted**, once Hero (#3)
shipped hero-only and it became clear nothing wraps it in shared navbar/footer chrome. No
other PRD hard-depends on it, but it's lowest-friction landed soon after Hero — every PRD
after it (Gallery, Sound Toggle, Events, etc.) otherwise risks building against a bare
`<body>` that later needs retrofitting once real page chrome exists.

**PRD 12 (Content Pages) was added 2026-07-14**, once `docs/content.md` (real copy from the
client's live site) landed with content for Home's body, a new FAQ page, Donate, and the
Gallery page's supporting copy/links. **Reordered ahead of PRDs 4–8** (Scroll Choreography
through 10 Years Interstitial) at the client's request: PRD 11 (Site Layout) and PRD 12
(Content Pages) run next, back-to-back, so the real page/nav structure and real content exist
before returning to the more design/interaction-heavy PRDs. Depends on PRD 11 landing first
(fills in the stub routes Site Layout's nav creates); otherwise independent of 4–8's
interaction work.

**PRD 13 (Page & Section Layout Conventions) was added 2026-07-15**, once PRD 12's six pages
of real content made visible that every page had independently reinvented near-duplicate
h1/h2 CSS, and that `ten-years.astro` (still a stub) hadn't even picked up the `Section`/`Card`
convention the other pages share. Depends on PRD 11's `Section` shell; touches every page PRD
12 filled in. No hard blocker for anything downstream. Its three open questions (PageHeader
placement, icon opt-in, whether `SectionHeader` touches `Card`'s own title slot) were resolved
2026-07-15, each per the recommendation stated in the PRD — ready to implement.

## Explicitly out of scope for this pass (per the original prompt)

- The Formspree + Turnstile contact/join form on Home — this is a standard build task, not a
  design-forward feature area, so it isn't getting its own PRD. It'll be scoped inline when
  the Home page is implemented, using the design tokens and focus/ARIA conventions established here.
- ~~Pool/ripple memory-reveal effect for gallery images (next phase).~~ **Cut entirely,
  2026-07-14** — Gallery was rewritten to a plain grid with a hover sparkle; ripple/pool is no
  longer a planned future phase, just dropped scope.
- Final Harry-Potter-lean-in/lean-away decision (client's to make).
- Final copy/password policy for the 10 Years interstitial (client's to provide).
- Join us/MAPS pages — still deferred, reuse the same design system components later.
  **Events and FAQ are no longer on this deferred list.** Events was originally grouped here
  as "not the focus of the first demo pass," but the client asked for it explicitly (PRD 09).
  FAQ wasn't part of the original deferred list at all — it surfaced as a full page once
  `docs/content.md` landed with real FAQ copy; see PRD 12 (Content Pages).

## Scope decisions — confirmed

These were open questions that materially changed scope; all are now settled:

1. **Script accent face vs. hero headline.** Diary-effect headline uses the display serif,
   not the script face; the script face is reserved for a small eyebrow line above it.
   Decided in PRD 02.
2. ~~**What "flip" means in the gallery.** Flip is the *transition mechanic* between
   sequential photos, replacing the slider's slide — not a front/back content reveal per
   card.~~ **Superseded 2026-07-14** — Gallery no longer has a flip mechanic at all; rewritten
   to a plain grid with a hover sparkle. See PRD 05 (`06-gallery.md`).
3. **How literal is "page-turn"?** Baseline is a soft `clip-path` wipe (cheaper, safer on
   mobile). A true skeuomorphic page-curl is a possible later stretch goal, not part of this
   build. Decided in PRD 04 — this now applies only to section transitions (PRD 04's sole
   remaining scope after the 2026-07-14 rewrite), not to Gallery, which has no page-turn
   mechanic anymore.
4. **Where does the one Three.js moment live?** ~~In the hero, as subtle scroll-linked
   parallax on a hero illustration, layered behind the particle canvas and ink/handwriting
   SVG.~~ **Superseded** — PRD 02's scope was simplified during implementation (static
   headline, fading eyebrow, plain-CSS scroll-parallax background image, no Three.js, no
   particle canvas, no handwriting/ink-dissolve). There is currently no reserved Three.js
   moment anywhere in the build; if one gets proposed later, it's a fresh scope decision, not
   a revival of this one.

## New from added assets

Real image and audio assets landed in `/assets` after the PRDs above were first drafted;
they surfaced things not in the original brief:

1. ~~**Gallery flip sound effect.**~~ `assets/audio/spooky-magic.mp3` is attributed as a
   "sound effect for pensive click on gallery." Originally wired to Gallery's flip mechanic,
   gated by Sound Toggle's mute state — **no longer wired in** as of Gallery's 2026-07-14
   rewrite (no flip to attach it to). Still a real, attributed asset if a future pass wants a
   hover/click chime once Sound Toggle exists.
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
