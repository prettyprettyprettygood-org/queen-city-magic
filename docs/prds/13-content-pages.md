# PRD 12 — Content Pages (Home Body, FAQ, Donate, Gallery Copy)

## Start-work prompt

> Implement docs/prds/13-content-pages.md for the QCMM redesign. Read CLAUDE.md first.
> Depends on PRD 01 (tokens) for colors/type/focus-glow and PRD 11 (Site Layout) for
> `BaseLayout`, the section-shell convention, and the nav/footer that link to these pages —
> land this PRD immediately after Site Layout so its stub routes get replaced with real
> content rather than sitting empty. Source copy is `docs/content.md` (client-provided,
> copied verbatim from the live site) — treat it as the copy source of truth, not a draft to
> rewrite; light editorial cleanup (fixing the source PDF's `ﬂ`/`ﬁ` ligature artifacts, e.g.
> "ﬁnd" → "find") is fine, rewriting tone/voice is not. Four pages: Home gets new body
> sections below the existing Hero; FAQ is a new accordion page; Donate is a short page with
> a Venmo QR/link (not a payment integration — flag anything more to PRD 11's audit, don't
> build a checkout); Gallery gets its real page copy and the Vimeo/Pixieset links (the photo
> grid itself is PRD 05's job, not this one — rewritten 2026-07-14 to a plain grid with a
> hover sparkle, no flip mechanic — if PRD 05 hasn't landed yet, ship the Vimeo embed and
> Pixieset link in a plain static layout and let PRD 05 add the grid later). When done: sweep
> for dead code, report ready for commit, then archive.

## Why this exists

`docs/content.md` landed with real copy for four pages — Home's body content beyond the
Hero, a full FAQ, the Donate page, and the Gallery page's supporting copy/links — none of
which existed as a PRD before. Building the demo further without a PRD for this content
would mean either inventing placeholder copy (explicitly against this project's convention —
see PRD 11's footer section and PRD 09's seed-data approach, both of which use real content
over placeholders) or leaving four nav links pointing at empty stubs. This PRD is scoped as
one unit rather than four separate PRDs because all four are primarily copy-in-shell work
sharing the same section-shell/accordion/link-card patterns, not four independent feature
builds.

## What it does, in plain terms

### Home — body sections (below Hero)

Per PRD 11's section-shell convention (alternating twilight/plum/forest backgrounds,
consistent padding/max-width), add these sections in order after the Hero:

1. **Event recap / save-the-date — rewrite, confirmed 2026-07-14, not a verbatim port.**
   Unlike the rest of this PRD's content (ported as-is per the start-work prompt), this one
   section gets rewritten rather than copied: a thank-you for the fun of last year's event,
   plus building excitement that this year's event is coming up soon (Sept 26-27, 2026).
   Tone: warm recap + anticipation, not a stale "thanks for attending" that reads as
   addressed to last year's visitors only. This is the one deliberate exception to the
   "port verbatim" rule elsewhere in this PRD.
2. **"The magic explained"** — the QCMM mission/description paragraph, verbatim.
3. **"YOU (probably) BELONG HERE"** — the volunteer-run/labor-of-love paragraph, verbatim.
   Note the literal echo with the hero's existing "you belong here" closing line (PRD 02) —
   don't dedupe or cut either occurrence without asking; they read as an intentional callback
   in the source copy, appearing at both the top and body of the page.
4. **"What to expect...and when(ish)"** — the FB-page/logistics paragraph, verbatim, with the
   `qcmm25.sched.com` link kept as a real external link (opens in a new tab, `rel="noopener
   noreferrer"`).

Each section is static Astro markup — no client-side JS needed, per CLAUDE.md's
Astro-by-default rule.

### FAQ page (`src/pages/faq.astro`) — new

An accordion of every Q&A pair from `content.md`'s FAQ section (18 entries, "How do I get
tickets" through "Where can I get tickets to the Hogwarts Reunion Banquet"), plus the
separate "Last year's schedule (2025)" block as its own expandable section at the end (it's
schedule data, not a Q&A, but lives on the same page in the source content).

**Schedule block — confirmed 2026-07-14:** ship the 2025 schedule as a placeholder preview
for now (as originally proposed — this year's schedule isn't published yet), but structure it
as easily-swappable data (not copy baked into prose) so dropping in the real 2026 schedule
once the client publishes it is a data update, not a rewrite. Same reasoning as the Events
Content Collection (PRD 09) — this is content a volunteer-run org will want to update
themselves.

- Reuse the `<details>`-based disclosure pattern already established in `ThemeSelect.astro`
  rather than building a new accordion primitive from scratch, per CLAUDE.md's
  check-for-reusable-components-first rule — one `<details>` per question, `<summary>` as
  the trigger.
- Each entry gets its own `<details>` (not one shared open/close-all toggle) so a screen
  reader user or search-engine crawler sees real, independently-expandable content rather
  than one giant hidden blob.
- Content is static per-page markup (an array of `{question, answer}` in the page's
  frontmatter is sufficient — this isn't reused elsewhere the way Events' data model is, so
  it doesn't need its own Content Collection).
- Fix source-PDF ligature artifacts (`ﬂ` → `fl`, `ﬁ` → `fi`) present throughout the FAQ copy
  ("proﬁts" → "profits", "ﬁnd" → "find", etc.) — these are copy-paste artifacts from the
  source, not intentional typography.
- External links in the FAQ body (`qcmm25.sched.com`) get the same new-tab/`rel` treatment as
  Home's.

### Donate page (`src/pages/donate.astro`) — new

- Headline/copy from `content.md` verbatim ("Help us make the magic!" etc.).
- A Venmo QR code image (needs the actual QR asset — not yet in `/assets`, see open
  questions) and a text link to `@qcmmsva` on Venmo as a non-visual fallback (QR codes aren't
  screen-reader- or keyboard-accessible on their own).
- This is a link/QR to an external payment app, not an embedded checkout or card form — no
  PCI surface on this site at all. **Confirmed 2026-07-14: this is the final mechanism**, not
  a placeholder pending a real processor. PRD 11's category 4 still lists the
  account-ownership and tax-deductibility questions (who owns `@qcmmsva`, is QCMM a
  registered nonprofit) as genuinely open and client-owned — don't add "tax-deductible" or
  similar language to this page without that being confirmed first.

### Gallery page — copy and links (not the photo grid itself)

- The Vimeo embed (`content.md`'s iframe) — **confirmed 2026-07-14: add `dnt=1`** to the
  embed URL now (suppresses Vimeo's own tracking cookies) rather than leaving it for PRD 11's
  audit pass to catch later.
- "Unforgettable Memories: Queen City Magic in Pictures" heading/copy and the link to the
  10-Years Pixieset archive (already covered by PRD 08's interstitial — this page just needs
  to link to it, not reimplement it).
- If PRD 05 (Gallery, `06-gallery.md` — rewritten 2026-07-14 to a plain grid with a hover
  sparkle, no flip mechanic) hasn't shipped yet, this ships as a static page (Vimeo embed +
  heading + link) — PRD 05 adds the photo grid to this same route later rather than this PRD
  inventing a placeholder gallery grid.

## Accessibility branch

- FAQ accordion: native `<details>`/`<summary>` (no custom ARIA needed, matches
  `ThemeSelect`'s existing pattern), `.focus-glow` on every `<summary>`, ≥24×24px target size.
- All external links (Sched, Vimeo, Pixieset, Venmo, Facebook, Instagram) get visible
  focus-visible state and are distinguishable from body text by more than color alone
  (underline, not just a color change) per WCAG 2.2 non-color-dependent link identification.
- Donate page: QR code image gets real `alt` text describing its purpose and the Venmo
  handle is present as selectable/readable text, not only encoded in the image.
- Heading hierarchy across all four pages follows a single `<h1>` per page with sequential
  `<h2>`/`<h3>` for sections — verify this manually since content.md's source formatting
  (ALL-CAPS section titles) doesn't map 1:1 to real heading levels.

## Open questions / assumptions

None remaining — all resolved 2026-07-14, see "confirmed" notes above. QR code asset:
`src/assets/images/qr-code.webp` exists and was converted to `qr-code.png` — use the PNG.

## Dependencies

PRD 01 (tokens) for styling. PRD 11 (Site Layout) for `BaseLayout`, nav/footer, and the
section-shell convention — land immediately after it, since Site Layout's nav links to these
routes as stubs. Soft-relationship with PRD 05 (Gallery) and PRD 08 (10 Years Interstitial)
— this PRD ships the Gallery page's static copy/links either before or after those land,
whichever order the build ends up in, without blocking on either.
