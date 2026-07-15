# Open Questions — QCMM Redesign

Consolidated from every active PRD's "Open questions / assumptions" section. Answers get
folded back into the PRD they came from as soon as they're given (see each PRD's own "Open
questions" section for the resolution), then struck from here.

**How to use this:** answer inline under each question, or reply referencing the ID.

---

## Resolved 2026-07-14

Everything answered as of 2026-07-14 has been folded into its PRD (Gallery, Sound Toggle,
Custom Cursor, 10 Years Interstitial, Events Page, Pre-Launch Audit, Site Layout, Content
Pages) — see each file's "Open questions / assumptions" section for the resolution, marked
"confirmed"/"resolved 2026-07-14" inline. Notable outcomes worth knowing without re-reading
every PRD:

- Hosting is **Vercel**; staging URL is `https://queen-city-magic.vercel.app/` (needs
  noindex). This changed the Events Page's rendering strategy from client-side reconciliation
  to per-request SSR (Vercel supports it natively), and PRD 11's security-headers/audit
  categories now target `vercel.json` specifically.
- Donate is Venmo-only, final (not a placeholder pending a real processor). QCMM's own
  nonprofit/tax status is still genuinely unknown — stays a client-must-confirm item in PRD 11.
- Gallery's image set, lightbox, and sparkle styling are locked (see PRD 05, `06-gallery.md`).
- Ambient loop audio was re-encoded to cut file size:
  `public/audio/geoffharvey-let-the-mystery-unfold-122118-128k.mp3` (~134kbps VBR, 2.1MB, down
  from 3.8MB at 256kbps) — use this file, not the original, when PRD 07 is built.
- Content tone: `content.md`'s wizarding-world terminology gets ported as-is, not toned down —
  see PRD 12's resolved note and the `feedback_ip_trademark_flagging` memory update. This
  applies to verbatim client copy specifically, not to new creative choices this redesign
  might introduce on its own.
- Home's recap/save-the-date section is the one piece of `content.md` getting rewritten
  rather than ported verbatim — see PRD 13.

## Resolved 2026-07-15

- **OQ-12-1 — navbar is sticky, transparent-over-hero → solid-on-scroll**, the originally
  recommended treatment, confirmed and built. See PRD 12's resolved note.

## Resolved 2026-07-15 (continued)

- **New Home overview/hours copy in `content.md`** — appended after this doc's Gallery
  section with no page header (the "Staunton is magic! But especially during QCMM..."
  paragraphs + Saturday/Sunday hours). Confirmed with the user: goes on Home as a new fifth
  body section, placed first (below Hero, before the recap). See PRD 13's resolved note.

## Still open

- **10 Years Interstitial final copy and password/access policy** (PRD 09) — still pending
  the client directly, not something to resolve here. Building with placeholder copy per that
  PRD until it arrives.
