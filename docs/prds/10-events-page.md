# PRD 09 — Events Page

## Start-work prompt

> Implement docs/prds/10-events-page.md for the QCMM redesign. Read CLAUDE.md first.
> Dependency: PRD 01 (Design Tokens) for styling only — PRD 04 (Scroll Choreography)'s
> image-reveal primitive was cut from scope entirely (2026-07-14, alongside the Gallery
> simplification), so event cards ship with plain static images permanently, not "for now."
> The core of this PRD is the date-bucketing logic (upcoming/active/past), computed in
> `America/New_York` time with the past-transition landing at midnight at the end of each
> event's end date — get the timezone handling right (DST-aware, not a fixed UTC offset)
> before worrying about card visuals. Seed data for the four confirmed real events (QCMM
> festival, Firebolt 5K, Puffs performances, Puffs auditions) is in the "Seed event data"
> section below — use it as-is, no longer pending. Rendering strategy is resolved: SSR this
> page (Vercel adapter, `prerender = false`), not client-side reconciliation — see "Rendering
> strategy" below. When done: sweep for dead code, commit, then archive.

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
volunteer-run org will want to update themselves eventually. **Confirmed 2026-07-14: no CMS
integration** — hardcoded Content Collection markdown files are the answer for now, not a
demo-only shortcut pending a lightweight CMS. Keep it simple.

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

### Rendering strategy — resolved 2026-07-14 (hosting is Vercel)

Astro pages are static by default — bucketing computed only at build time would leave an
event showing as "Upcoming" for up to 24+ hours after it's actually started, until the next
deploy. Three ways to keep this accurate without a rebuild on every date change:

1. **Client-side reconciliation:** bucket at build time as the fallback (correct as of last
   deploy), then a small script re-evaluates each event's bucket against the visitor's actual
   current time on page load and re-sorts/re-labels if it's changed. Works on pure static
   hosting, degrades gracefully for no-JS visitors, no infra dependency.
2. **On-demand/SSR rendering** for just this page, computed fresh per request — accurate
   always, but requires a hosting target that supports it.
3. **Scheduled rebuild** (e.g. nightly) — simplest infra-wise, but introduces up to 24h of
   staleness right at a transition, which is the exact case this logic is supposed to get
   right.

This PRD originally proposed option 1 (client-side reconciliation) specifically *because* no
hosting platform was locked in yet. **That's no longer true — PRD 11's audit confirmed
hosting is Vercel (2026-07-14)**, and Astro's Vercel adapter supports per-route SSR
(`export const prerender = false` on just this page, or `output: "hybrid"` site-wide) at no
extra infra cost. **Switching the default to option 2 (on-demand/SSR)**: it's strictly more
accurate than reconciliation (no build-vs-request skew window at all, not even the brief gap
reconciliation leaves for no-JS visitors) and costs nothing extra given the hosting choice
already made. Keep the bucketing function itself framework-agnostic either way — it's the
same pure function whether it runs at build time, per-request, or client-side.

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
- Cards use plain static images — the Scroll Choreography image-reveal primitive this used
  to soft-depend on was cut from scope entirely (2026-07-14), not just deferred.

## Seed event data

Real events, provided directly rather than placeholders — useful as-is and as test cases for
the bucketing logic (they span all three states depending on when the page is viewed):

1. **Queen City Mischief & Magic** — Festival — Sept 26–27, 2026 — Staunton, VA — the
   flagship event this whole site is for. Primary link: this site's own Home page (no
   external link needed — it's a bit odd for the festival's own site to link out to its own
   Facebook page as the "event," when the event *is* this site). **Confirmed 2026-07-14: yes,
   this gets its own card**, for consistency and so "Happening Now" can trigger correctly
   during the festival weekend itself.
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
4. **Puffs auditions** — Get Involved — Wed Jul 22 & Sun Jul 26, 2026, 6–8pm each — Staunton,
   VA — **confirmed as its own fourth seed entry (2026-07-14)**, not folded into the Puffs
   performance card as prose. Exercises `startTime`/`endTime` and is already a real "Past"
   example by the time most sessions pick this PRD back up, given today's date. Primary link:
   silverlinetheatre.org/auditions (same as the performance card).

By today's date, entry 4 (Puffs auditions) is already **Past**, and entries 1–3 remain
**Upcoming** — a good natural test case spanning two of the three bucket states without
needing to fake the system clock.

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
- With the now-default SSR rendering (option 2), bucketing is correct as of each request, so
  there's no client-side card-reshuffling to worry about. If a future change reintroduces
  client-side reconciliation (option 1) for any reason, the same rule applies as before: don't
  silently steal focus or jump scroll position, and don't reconcile on an interval that could
  shift things under an active visitor mid-read.
- No motion/reduced-motion surface introduced beyond whatever this page inherits from
  reused components (image reveal, focus-glow) — their existing gating applies here, not a
  new one.

## Open questions / assumptions

None remaining — resolved 2026-07-14, see "confirmed"/"resolved" notes above.

## Dependencies

- PRD 01 (Design Tokens) for styling, focus-glow, badges.
- No dependency on Scroll Choreography — its image-reveal primitive was cut from scope
  entirely, so this PRD ships with plain static card images with nothing to "pick up" later.
- No dependency on Hero, Particles, Cursor, Sound Toggle, or Gallery.
