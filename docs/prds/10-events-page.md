# PRD 09 — Events Page

## Start-work prompt

> Implement docs/prds/10-events-page.md for the QCMM redesign. Read CLAUDE.md first.
> Dependency: PRD 01 (Design Tokens) for styling only — PRD 04 (Scroll Choreography)'s
> image-reveal primitive was cut from scope entirely (2026-07-14, alongside the Gallery
> simplification), so event cards ship with plain static images permanently, not "for now."
> **Simplified 2026-07-15: no date-bucketing logic.** Each event just carries a manually-set
> `status: "upcoming" | "past"` field in its frontmatter — the client edits this by hand when
> an event's status changes, there is no computed timezone/date-math bucketing and no
> "Happening Now" state to detect automatically. That means this page is plain static output,
> no SSR/`prerender = false` requirement. Seed data for the four confirmed real events (QCMM
> festival, Firebolt 5K, Puffs performances, Puffs auditions) is in the "Seed event data"
> section below. When done: sweep for dead code, commit, then archive.

## What it does

A new Events page listing festival-related events — the main QCMM festival, side events
(Firebolt 5K), and associated events run by partner organizations (the Puffs stage
production) — grouped into **Upcoming** and **Past**, based on a status the client sets
manually per event, not computed from dates. This page was originally out of first-pass scope
("Events" was listed as reusing the design system later); it's now in scope for this build.

## Behavior, in plain terms

### Data model

Each event is a structured record, not free-form copy:

```
{
  title: string
  category: "Festival" | "Side Event" | "Performance" | "Get Involved"
  status: "upcoming" | "past" — set and maintained manually by the client; this page does
    not compute it
  dateLabel: string — human-readable date range, written as plain text (e.g. "Sept 26–27,
    2026" or "Wed Jul 22 & Sun Jul 26, 2026, 6–8pm"), not a machine date to run logic on
  location: string
  description: string
  primaryLink: { label: string, url: string }
  secondaryLink?: { label: string, url: string } — e.g. Firebolt 5K's medal-vote form
  image?: string
}
```

Astro Content Collection (`src/content/events/`) for this rather than a plain array in a
component — gives typed frontmatter validation and keeps event data editable without touching
component code, since the client updates `status` and copy themselves. **Confirmed
2026-07-14: no CMS integration** — hardcoded Content Collection markdown files are the answer,
not a demo-only shortcut pending a lightweight CMS. Keep it simple.

### Grouping

No algorithm — group by the `status` field as authored:

- `status: "upcoming"` → **Upcoming** section.
- `status: "past"` → **Past** section.

Within each section, sort by whatever order the client authored the files in (no computed
sort key). When the client tells us an event's status has changed, we update that one field
by hand — no rebuild-triggering logic, no timezone handling, no "Happening Now" detection.

### Rendering strategy

Plain static output — Astro's default. Since grouping is just reading a frontmatter field,
there's no build-vs-request skew to worry about and no need for SSR or scheduled rebuilds.
The page is only as stale as the client's last edit to an event's `status`, same as any other
content change on the site.

### Layout

- **Upcoming** — the main content, shown first.
- **Past** — de-emphasized (muted styling, collapsed behind a `<details>`/`<summary>` native
  disclosure per CLAUDE.md's accordion convention) rather than equal visual weight to
  upcoming — nobody's primary reason to visit this page is to read about what already
  happened, but it shouldn't just vanish either.
- Each card: title, category badge, date range (`dateLabel`, as authored), location,
  description, primary CTA link (and secondary link/image if present, e.g. Firebolt 5K's
  medal-vote form), image if present.
- Cards use plain static images — the Scroll Choreography image-reveal primitive this used
  to soft-depend on was cut from scope entirely (2026-07-14), not just deferred.

## Seed event data

Real events, provided directly rather than placeholders:

1. **Queen City Mischief & Magic** — Festival — Sept 26–27, 2026 — Staunton, VA —
   `status: upcoming` — the flagship event this whole site is for. Primary link: this site's
   own Home page (no external link needed — it's a bit odd for the festival's own site to
   link out to its own Facebook page as the "event," when the event *is* this site).
   **Confirmed 2026-07-14: yes, this gets its own card**, for consistency.
2. **Firebolt 5K and Race of 100 Harrys** — Side Event — Sat, Sept 26, 2026 — `status:
   upcoming` — held in conjunction with QCMM. Primary link: facebook.com/Firebolt5ksva.
   Secondary link: the medal-design vote form (Fillout), using
   `assets/images/firebolt-5k-flyer.jpg` (or the converted `.jpg`/`.png` — see
   `docs/events.md`) as the card image.
3. **Puffs, or Seven Increasingly Eventful Years at a Certain School of Magic and Magic** —
   Performance — Sept 25–27, 2026 (four performances across three days) — `status: upcoming`
   — presented by Silver Line Theatre Exchange. Primary link:
   silverlinetheatre.org/auditions.
4. **Puffs auditions** — Get Involved — Wed Jul 22 & Sun Jul 26, 2026, 6–8pm each — Staunton,
   VA — `status: past` — **confirmed as its own fourth seed entry (2026-07-14)**, not folded
   into the Puffs performance card as prose. Primary link: silverlinetheatre.org/auditions
   (same as the performance card).

The client will update each event's `status` by hand going forward (e.g. flipping entries 1–3
to `past` after the festival weekend) — no PRD change needed for that, just an edit to the
content file.

## Accessibility branch

- Section headings use real headings (`<h2>Upcoming</h2>`, `<h2>Past</h2>`), not just visual
  grouping, so the page structure is navigable by screen reader heading-jump the same way it
  reads visually.
- The Past section's `<details>/<summary>` disclosure follows CLAUDE.md's native-disclosure
  rule — no custom click-handler-on-a-div accordion.
- Every event card's primary/secondary links follow the same "clear accessible name,
  indicate external destination" convention as the 10 Years interstitial's outbound link —
  "Visit Firebolt 5K on Facebook (opens external site)," not "Learn more."
- No motion/reduced-motion surface introduced beyond whatever this page inherits from
  reused components (image reveal, focus-glow) — their existing gating applies here, not a
  new one.

## Open questions / assumptions

None remaining.

## Dependencies

- PRD 01 (Design Tokens) for styling, focus-glow, badges.
- No dependency on Scroll Choreography — its image-reveal primitive was cut from scope
  entirely, so this PRD ships with plain static card images with nothing to "pick up" later.
- No dependency on Hero, Particles, Cursor, Sound Toggle, or Gallery.
