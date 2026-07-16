# PRD 10 — Pre-Launch Production Readiness Audit

## Start-work prompt

> Run docs/prds/11-pre-launch-audit.md against the built site — as of 2026-07-16 every page
> in the current nav (Home, Events, Schedule, About, FAQ, Gallery, Donate) plus Legal,
> Attributions, and 404 already exists in `src/pages/`, so this is likely runnable now. Read
> CLAUDE.md first for project conventions.
> This is a gate, not a feature — work through each category below, and for every finding,
> sort it into "code fix" (do it directly, or open a follow-up task if it's non-trivial) vs
> "client must confirm" (add it to the consolidated handoff checklist, don't attempt to
> resolve legal/financial/ownership questions yourself). Treat category 4 (payment/donation)
> and category 9 (account ownership) as high priority — they carry real legal/financial
> risk for a volunteer-run org. **Category 4's nonprofit-status question is now resolved
> (confirmed 2026-07-16: QCMM is not a nonprofit) — don't re-flag it as open.** Produce a
> written report: a "fixed in code" list and a separate client-facing checklist — don't bury
> findings in commit messages. Lighthouse scores are being checked by the user directly, not
> by whoever runs this PRD — category 13 covers only the code-level prerequisites that feed
> into that score, not running Lighthouse itself.

## What it does

A structured audit pass, run once the in-scope pages are built and before the site goes
live, covering security, privacy, third-party risk, payments, accessibility, code
hygiene/structure, test coverage, dependency health, SEO, performance prerequisites, and
ownership/legal handoff. Every finding gets sorted into two buckets — things fixable
directly in code, and things that need the client's own decision or sign-off, often with a
lawyer or accountant — and this PRD deliberately keeps those two buckets separate rather
than blurring them.

## Audit categories

### 1. Security headers
- **Code fix:** Content-Security-Policy, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy`, `Permissions-Policy`, frame-ancestors/`X-Frame-Options`, and HSTS —
  **hosting is confirmed as Vercel (2026-07-14)**, so this is `vercel.json`'s `headers` config
  specifically, not a multi-platform "whichever is chosen" decision anymore.
- CSP needs to allowlist exactly the third-party origins actually in use (built from
  category 3's inventory, not guessed at).

### 2. Privacy / cookie disclosures
- **Code fix:** a footer link to a privacy policy page/section, and plain-language
  disclosure of any `localStorage` use — currently the house-theme choice
  (`qcmm-theme`, already live in `ThemeSelect.astro`/`BaseLayout.astro`'s anti-FOUC script)
  and, once PRD 06 (Sound Toggle) ships, its on/off preference. Not a cookie technically, but
  worth disclosing on the same principle. Note: `/legal` already exists but is an IP/
  trademark disclaimer only (no affiliation with Warner Bros./J.K. Rowling/Wizarding World) —
  it is not a privacy policy and shouldn't be mistaken for satisfying this item.
- There's no stored/overridable `prefers-reduced-motion` setting to disclose —
  `useReducedMotion()` only reads the OS-level media query reactively, nothing gets written to
  `localStorage` for it. Drop that line item unless a manual override control gets added
  later.
- **Client must confirm:** whether any analytics/tracking gets added at all (none is
  currently planned in any PRD). If it is, that changes consent-banner requirements
  depending on audience — a real decision, not a default to assume.

### 3. Third-party scripts
- **Code fix:** enumerate every third-party script/origin actually loaded and confirm each is
  necessary, current, and loaded with appropriate `rel`/`crossorigin`/SRI where applicable.
  As of 2026-07-16 that inventory is just a Vimeo player iframe embedded on the Gallery page
  (`player.vimeo.com`, the QCMM highlight video — already passes `dnt=1` and a strict
  `referrerpolicy`, both privacy-conscious defaults worth keeping). Pixieset is a plain
  outbound `<a>` link on Gallery (the guest-login handoff), not an embedded script — no
  CSP/frame-src implication there, only the Vimeo iframe needs a `frame-src` allowance. Fonts
  are self-hosted `woff2` in `public/fonts/`, not a Google Fonts CDN link, so no third-party
  origin for type. There is no contact/join form on this site (confirmed 2026-07-16 — out of
  scope entirely, not deferred), so no Turnstile/Formspree origins to account for either.
- **Client must confirm:** that nothing gets bolted on later (a marketing pixel, a chat
  widget) without this inventory being revisited — worth a line in the handoff doc.

### 4. Payment / donation integration risk
- **Code fix:** if a payment processor is used, only ever integrate via a hosted
  checkout/redirect or a vetted embeddable widget (Stripe Checkout, PayPal donate button,
  Givebutter, etc.) — never build a custom card-collection form. Confirm the Donate page
  never touches card data directly (PCI scope stays entirely with the processor).
- **Confirmed 2026-07-14: mechanism is settled** — the Donate page is a Venmo QR/link
  (`@qcmmsva`) only, no hosted checkout, no card-collection form, no processor integration to
  audit here. This resolves the "which processor" half of the original question.
- **Resolved 2026-07-16: QCMM is not a nonprofit.** Confirmed directly by the client (this
  supersedes the earlier 2026-07-14 note, which was a stated guess, not a confirmed answer).
  "Tax-deductible" language must never appear anywhere on the Donate page or elsewhere on the
  site — this is now a settled fact to enforce, not an open question to keep re-flagging.
  `content.md`'s FAQ mentions participating non-profits as *other* organizations at the
  festival, distinct from QCMM itself — that reference is unaffected by this.
- **Client must confirm — still open:** who owns/reconciles the `@qcmmsva` Venmo account
  (ties to category 9, account ownership).
- The Donate page itself needs no further code changes for this category — it's a QR code
  and a link to `venmo.com/qcmmsva`, nothing else to integrate or harden.

### 5. Accessibility / WCAG issues
- **Code fix:** a full-site automated pass (axe-core or Lighthouse a11y audit) plus a manual
  keyboard-only and screen-reader spot check across every page that now exists — Home,
  Events, Schedule, About, FAQ, Gallery, Donate, Legal, Attributions, and 404 — cross-checked
  against every "Accessibility branch" section across the other PRDs. There is no longer a
  standalone "10 Years interstitial" page to include here — it was folded into Gallery
  (2026-07-15, see PRD 08's archive note); its Pixieset handoff copy/link lives in a `Card` on
  the Gallery page and gets covered under Gallery's own check. This is where per-feature a11y
  work gets verified as a whole site, not just per-component.
- **Client must confirm:** whether a public accessibility statement page is wanted (common
  for public-facing event orgs; not strictly required unless the client is a government
  entity or receives certain public funding).

### 6. Dependency vulnerabilities
- **Code fix:** `npm audit` (or equivalent) clean or explicitly triaged, lockfile committed,
  no wildcard version ranges on anything security-sensitive. As of 2026-07-16 the actual
  dependency surface (`package.json`) is Astro, `@astrojs/react`, `@astrojs/sitemap`, React/
  react-dom, `framer-motion`, `@lucide/astro`, Tailwind v4 (`@tailwindcss/vite`), plus
  `opentype.js`/`wawoff2` (font-subsetting build tooling) — there is no `three` dependency
  (cut when the hero's Three.js scope was dropped, see the scope-decisions note in PRD 02's
  archive). **The repo is confirmed on GitHub**
  (`prettyprettyprettygood-org/queen-city-magic`), so Dependabot (or equivalent) applies for
  real now, not just hypothetically — no `.github/dependabot.yml` exists yet.

### 7. SEO metadata
- **Code fix:** title/meta description per page, Open Graph + Twitter card tags with real
  preview images (not placeholders), canonical URLs, `Event` structured data (schema.org)
  for the festival dates and, now that PRD 09 (Events) exists, for the individual events on
  that page too — its structured data model maps onto `Event` schema cleanly since it's
  already got dates/location/description. Cover the new Schedule page here too (added outside
  the original PRD sequence, in the 2026-07-15/16 content pass — not present in
  `docs/prds/00-INDEX.md`'s page list). Alt-text coverage ties back to category 5.

### 8. Robots / sitemap
- **Code fix:** `@astrojs/sitemap` is already an installed integration (`astro.config.mjs`),
  but `astro.config.mjs` has no `site:` option set — the integration needs it to emit correct
  absolute URLs, so this isn't done yet, just scaffolded. Likely blocked on the production
  domain not being locked in (see category 9); set it once that's confirmed, don't guess a
  placeholder domain. No `robots.txt` exists yet in `public/` either — still a real code-fix
  item, not just a verification. **Confirmed 2026-07-14: there is a public staging URL**,
  `https://queen-city-magic.vercel.app/` — this specific Vercel preview domain needs
  `noindex`/`nofollow` (e.g. `X-Robots-Tag` header in `vercel.json`, scoped to that
  deployment) before the real domain goes live, so the preview doesn't get indexed alongside
  or instead of the production domain.

### 9. Account ownership
- **Client must confirm — high priority:** who owns the domain registrar login, the hosting
  account (**confirmed Vercel, 2026-07-14**), the Pixieset account, any font licenses, and
  the GitHub repo itself. For a volunteer-run org, the real risk is a personal account — an
  individual volunteer's login — becoming the org's single point of failure. Recommend
  everything live under an org-controlled email/account rather than an individual's, and get
  this confirmed explicitly before launch, not discovered later when someone moves on.

### 10. Legal / compliance handoff
- **Client must confirm, with a lawyer where noted:** terms of use and privacy policy
  content (lawyer); accessibility statement (optional, see category 5); donation/tax-receipt
  language accuracy (accountant, ties to category 4); **photo/image consent policy for the
  gallery and any event photography** — a public festival with 20,000+ attendees, likely
  including minors, and publishing their photos on the redesigned site is a genuine
  model-release/consent question worth flagging directly rather than assuming existing
  practice already covers it; any volunteer liability/waiver links, if the org has them
  elsewhere and wants them referenced from the new site.

### 11. Code hygiene & structure
- **Code fix:** run `npm run typecheck` (`astro check`) and `npm run lint` (`biome check .`)
  clean before considering this pass done — cheap, already expected proactively per
  CLAUDE.md, but worth a final confirming run here across the whole site rather than trusting
  every individual PRD's own pass caught everything. Sweep for dead code, unused
  imports/variables/exports, leftover `console.log`s, and commented-out blocks.
- Biome's `recommended` preset (`biome.json`) does catch unused imports/variables for
  plain JS/TS, but every `.astro` file in this repo carries `// biome-ignore
  lint/correctness/noUnusedImports`/`noUnusedVariables` comments on frontmatter values that
  are only referenced from the template — Biome's Astro analysis doesn't see markup usage, so
  it can't verify these itself. Spot-check that each of those suppression comments still
  points at something genuinely used in the template below it, rather than trusting the
  comment blindly — a copy-pasted suppression next to something that actually became dead
  would slip past `biome check` silently.
- **File size — CLAUDE.md's ~200–300 line guideline.** Verified against current line counts
  (`wc -l`), these components exceed it and are worth a real split-or-justify look, not just a
  guideline check: `Gallery.astro` (452 lines), `EventCard.astro` (417), `Navbar.astro`
  (384), `Footer.astro` (364). `ThemeSelect.astro` (293) and `Card.astro` (278) are borderline
  — fine if each is still doing one cohesive thing, worth a second look if not. Page files
  (`schedule.astro` at 383, `about.astro` at 278) are less clear-cut since pages are expected
  to carry more content than components, but still worth checking whether any section inside
  them should be pulled out as its own component rather than left inline.
- **Repeated hardcoded value found:** the exact same panel drop-shadow,
  `box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35)`, is duplicated verbatim in `Card.astro`,
  `ThemeSelect.astro`, and `Navbar.astro` — a real instance of the "don't inline a one-off
  hex/px value, add it to the token set" rule in CLAUDE.md's Design tokens section being
  missed. Promote it to a shared token (e.g. `--shadow-panel`) and reference it from all
  three instead of three independent copies that can drift.
- Beyond that one, no other hardcoded hex/rgb colors turned up in component `<style>` blocks
  outside `tokens.css` as of 2026-07-16 — token discipline is otherwise holding up; treat the
  shadow value above as the one concrete fix, not evidence of a wider problem.
- **Reuse check:** confirm no parallel/duplicate implementation of `Card`, `Button`,
  `Section`, `Divider`, `PageHeader`, or `EmblemIcon`'s replacement (`Shield` via
  `@lucide/astro`) exists anywhere a page could have composed the existing one instead.

### 12. Test coverage
- **No test runner exists yet** — `package.json` has no `vitest`/test script, and there are no
  `*.test.*`/`*.spec.*` files anywhere in `src/`. This is a real gap to close here, not
  something to assume is out of scope.
- **Code fix, kept deliberately small:** add a minimal Vitest setup and a handful of unit
  tests for the pure-logic helpers that are easy to get subtly wrong and hard to notice
  visually — the Events page's date-bucketing logic (timezone-aware, DST-crossing, midnight
  cutover into Upcoming/Happening Now/Past) is the clearest candidate, and `EventCountdown`'s
  date math is a close second. Don't chase broad coverage, component-render tests, or e2e —
  Playwright stays reserved for explicit/high-risk-change requests per CLAUDE.md's testing
  section; this category is about a few cheap, high-value unit tests for logic that would
  fail silently, not a general test-suite buildout.

### 13. Performance / Lighthouse prerequisites
- **The user checks Lighthouse scores directly** — this category isn't asking whoever
  implements this PRD to run Lighthouse themselves, only to verify the code-level things that
  feed into that score are actually in place.
- **Code fix found:** the Vimeo iframe on the Gallery page (`player.vimeo.com`, the highlight
  video) has no `loading="lazy"` attribute — it's below the fold behind the photo grid, so
  it's currently loaded eagerly for no reason. Add `loading="lazy"` (and confirm the same for
  any other below-the-fold iframe/image that isn't already going through Astro's `<Image>`
  optimization).
- Everything else in this category is already required elsewhere and just needs a final
  confirming check, not new work: animations restricted to `opacity`/`transform`/`filter`
  (CLAUDE.md Performance section), images through Astro's image pipeline rather than raw
  drops into `public/`, and fonts self-hosted as `woff2` rather than a render-blocking
  Google Fonts CDN link (already true per the design-tokens PRD).

## Process

This isn't a fully automated CI check — it's a structured, mostly-manual pass run once,
after the in-scope pages exist, before DNS cutover/launch. The automatable pieces
(`npm audit`, typecheck/lint, axe/header checks) can be scripted; the ownership and legal
items are inherently conversations, not scans, and shouldn't be treated as checkboxes to
silently tick off. Lighthouse itself is explicitly the user's own check, not part of this
PRD's automatable set — category 13 only covers the code prerequisites feeding into it.

Output is a written report with two parts: a "fixed in code" list (with commit/PR
references) and a separate "client action needed" checklist (categories 4, 9, and 10
primarily, plus anything else that surfaced) — handed to the client as its own document, not
buried in commit messages where it'll get lost.

## Open questions / assumptions

None remaining as of 2026-07-16. Hosting/staging/donation mechanism were resolved 2026-07-14
(categories 1, 4, 8, 9), and QCMM's nonprofit status was resolved 2026-07-16 — **confirmed
not a nonprofit** (category 4). The category-level "client must confirm" items (Venmo account
ownership, domain/hosting logins, lawyer-reviewed policy content, photo-consent policy) are
expected, ongoing outputs of running this audit, not unresolved questions about the PRD's own
scope — don't conflate the two.

## Dependencies

Runs after every page currently in scope is built. As of 2026-07-16 that set is Home, Events,
Schedule, About, FAQ, Gallery (which now absorbs the former "10 Years interstitial" — that
page was folded into Gallery on 2026-07-15 rather than shipped standalone, see PRD 08's
archive note), Donate, Legal, Attributions, and 404 — all already exist in `src/pages/`. This
is a launch gate, not part of the sequential feature build order in `docs/prds/00-INDEX.md`,
and unlike when this PRD was first drafted, it's likely runnable now rather than blocked on
outstanding page builds.
