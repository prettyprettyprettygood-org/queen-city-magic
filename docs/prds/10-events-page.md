# PRD 09 — Events Page

## Start-work prompt

> Implement docs/prds/10-events-page.md for the QCMM redesign. Read CLAUDE.md first.
> Dependency: PRD 01 (Design Tokens) for styling; reuses PRD 04 (Scroll Choreography)'s
> image-reveal primitive for event card art if that PRD is done, otherwise ship without it
> and wire it in later — this isn't a hard blocker like Gallery's dependency on it. The core
> of this PRD is the date-bucketing logic (upcoming/active/past), computed in
> `America/New_York` time with the past-transition landing at midnight at the end of each
> event's end date — get the timezone handling right (DST-aware, not a fixed UTC offset)
> before worrying about card visuals. Seed data for the three real events currently known
> (QCMM festival, Firebolt 5K, Puffs) is in the "Seed event data" section below — use it
> as-is pending the open question about a fourth entry (Puffs auditions). When done: sweep
> for dead code, commit, then archive.

## What it does

A new Events page listing festival-related events — the main QCMM festival, side events
(Firebolt 5K), and associated events run by partner organizations (the Puffs stage
production) — automatically sorted into **Happening Now**, **Upcoming**, and **Past**
buckets based on each event's date range, so the page stays accurate without a manual reorder
every time an event passes. This page was originally out of first-pass scope ("Events" was
listed as reusing the design system later); it's now in scope for this build.

## Behavior, in plain terms

### Data model

Each event is a structured record, not free-form copy:

```
{
  title: string
  category: "Festival" | "Side Event" | "Performance" | "Get Involved"
  startDate: date (YYYY-MM-DD, America/New_York)
  endDate: date (YYYY-MM-DD, America/New_York) — same as startDate for single-day events
  startTime?: string — optional, for events where the specific hours matter (e.g. auditions);
    defaults to the full day (00:00–23:59:59 America/New_York) when omitted
  endTime?: string — same
  location: string
  description: string
  primaryLink: { label: string, url: string }
  secondaryLink?: { label: string, url: string } — e.g. Firebolt 5K's medal-vote form
  image?: string
}
```

Proposing an Astro Content Collection (`src/content/events/`) for this rather than a plain
array in a component — gives typed frontmatter validation and keeps event data editable
without touching component code, which matters since this is exactly the kind of content a
volunteer-run org will want to update themselves eventually.

### Bucketing algorithm

For each event, compute in `America/New_York` (the actual IANA timezone, which correctly
shifts between EDT/EST — **not** a fixed UTC-5 offset; September events run on EDT/UTC-4, so
hardcoding "EST" would be off by an hour):

- `activeStart` = `startDate` (+ `startTime` if given) at America/New_York wall-clock time.
- `activeEnd` = midnight at the end of `endDate` (+ `endTime` if given) — i.e., the instant
  `endDate + 1 day, 00:00:00 America/New_York` when no `endTime` is set.
- `now` = current instant.
- `now < activeStart` → **Upcoming**
- `activeStart <= now < activeEnd` → **Happening Now**
- `now >= activeEnd` → **Past**

This is exactly "moves events around based on their end date (midnight of end date), Eastern"
as specified — the past-transition happens at the literal midnight boundary, not at some
fuzzy end-of-day.

### Rendering strategy (real open question, not a formality)

Astro pages are static by default — bucketing computed only at build time would leave an
event showing as "Upcoming" for up to 24+ hours after it's actually started, until the next
deploy. Three ways to keep this accurate without a rebuild on every date change:

1. **Client-side reconciliation (recommended default):** bucket at build time as the
   fallback (correct as of last deploy), then a small script re-evaluates each event's
   bucket against the visitor's actual current time on page load and re-sorts/re-labels if
   it's changed. Works on pure static hosting, degrades gracefully for no-JS visitors (they
   see the last-deployed state, which is usually still correct), no infra dependency.
2. **On-demand/SSR rendering** for just this page, computed fresh per request — accurate
   always, but requires a hosting target that supports it (ties to PRD 00's still-open
   hosting-platform question).
3. **Scheduled rebuild** (e.g. nightly) — simplest infra-wise, but introduces up to 24h of
   staleness right at a transition, which is the exact case this logic is supposed to get
   right.

Proposing option 1 for this build given no hosting platform is locked in yet (PRD 00) — it
doesn't foreclose adding SSR later if the platform ends up supporting it.

### Layout

- **Happening Now** — shown first, only rendered as a section at all when at least one event
  is active; visually distinct (not just another card in a list) since "the festival is
  literally happening right now" is the highest-value state this page can communicate.
- **Upcoming** — the main content, sorted soonest-first.
- **Past** — de-emphasized (muted styling, collapsed behind a `<details>`/`<summary>` native
  disclosure per CLAUDE.md's accordion convention) rather than equal visual weight to
  upcoming — nobody's primary reason to visit this page is to read about what already
  happened, but it shouldn't just vanish either.
- Each card: title, category badge, formatted date range (in a human-readable form, not raw
  ISO), location, description, primary CTA link (and secondary link/image if present, e.g.
  Firebolt 5K's medal-vote form), image if present.
- Reuses the Scroll Choreography image-reveal primitive for card art if that PRD exists yet;
  otherwise cards ship with static images now and pick up the reveal treatment for free once
  that primitive lands (it's a progressive addition, not a redesign).

## Seed event data

Real events, provided directly rather than placeholders — useful as-is and as test cases for
the bucketing logic (they span all three states depending on when the page is viewed):

1. **Queen City Mischief & Magic** — Festival — Sept 26–27, 2026 — Staunton, VA — the
   flagship event this whole site is for. Primary link: this site's own Home page (no
   external link needed — it's a bit odd for the festival's own site to link out to its own
   Facebook page as the "event," when the event *is* this site).
2. **Firebolt 5K and Race of 100 Harrys** — Side Event — Sat, Sept 26, 2026 — held in
   conjunction with QCMM. Primary link: facebook.com/Firebolt5ksva. Secondary link: the
   medal-design vote form (Fillout), using `assets/images/firebolt-5k-flyer.jpg` as the card
   image — this is what that asset is for.
3. **Puffs, or Seven Increasingly Eventful Years at a Certain School of Magic and Magic** —
   Performance — Sept 25–27, 2026 (four performances across three days) — presented by
   Silver Line Theatre Exchange. Primary link: silverlinetheatre.org/auditions. Note the date
   range starts a day before the main festival and matches the exact "different start/end
   than the flagship event" case the bucketing logic needs to handle correctly, not just the
   trivial same-dates case.

As of today (2026-07-11), all three are **Upcoming**. See the open question below about
whether Puffs auditions (Jul 22 & 26, 2026 — already close by the time of writing) should be
their own fourth calendar entry.

## Accessibility branch

- Bucket sections use real headings (`<h2>Happening Now</h2>`, etc.), not just visual
  grouping, so the page structure is navigable by screen reader heading-jump the same way it
  reads visually.
- The Past section's `<details>/<summary>` disclosure follows CLAUDE.md's native-disclosure
  rule — no custom click-handler-on-a-div accordion.
- Every event card's primary/secondary links follow the same "clear accessible name,
  indicate external destination" convention as the 10 Years interstitial's outbound link —
  "Visit Firebolt 5K on Facebook (opens external site)," not "Learn more."
- Date ranges are marked up with `<time datetime="...">` for correct machine-readability,
  with human-readable text as the visible content.
- If client-side reconciliation (rendering option 1) moves a card between sections after
  page load, that update shouldn't silently steal focus or jump scroll position — a visitor
  mid-read shouldn't have the page reflow under them. Reconciliation on load (before a
  visitor has started reading) is fine; avoid doing it on an interval that could shift things
  under an active visitor.
- No motion/reduced-motion surface introduced beyond whatever this page inherits from
  reused components (image reveal, focus-glow) — their existing gating applies here, not a
  new one.

## Open questions / assumptions

1. **Puffs auditions as a separate entry?** The auditions (Wed Jul 22, Sun Jul 26, 2026,
   6–8pm each) are a real, dated, time-boxed activity distinct from the performances —
   modeling them as their own "Get Involved" category event would exercise the
   `startTime`/`endTime` fields and give the site a natural "Past" example well before the
   festival itself happens. Proposing yes, as a fourth seed entry, unless the client would
   rather that information stay as prose inside the Puffs performance card.
2. **Does the main QCMM festival need its own card at all**, given this page lives on the
   festival's own site? Proposing yes — for consistency and so "Happening Now" can actually
   trigger correctly during the festival weekend itself — but flagging that its "primary
   link" is internal (Home), unlike every other event's external link.
3. Content ownership going forward: is a hardcoded Content Collection acceptable for this
   demo, or does the client want to self-serve event updates via some lightweight CMS
   eventually? Not blocking this build, but affects whether "just edit the markdown files in
   the repo" is a real long-term answer or a demo-only shortcut.
4. Rendering strategy (above) is a recommendation, not a lock — revisit once PRD 00's hosting
   decision lands, since that may make server-rendering this one page free or easy.

## Dependencies

- PRD 01 (Design Tokens) for styling, focus-glow, badges.
- Soft-depends on PRD 04 (Scroll Choreography) for card-image reveal — not a hard blocker,
  ships with static images if that PRD isn't done yet and picks up the reveal treatment
  later.
- No dependency on Hero, Particles, Cursor, Sound Toggle, or Gallery.
