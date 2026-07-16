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

## Process

This isn't a fully automated CI check — it's a structured, mostly-manual pass run once,
after the in-scope pages exist, before DNS cutover/launch. The automatable pieces
(`npm audit`, Lighthouse/axe, header checks) can be scripted; the ownership and legal items
are inherently conversations, not scans, and shouldn't be treated as checkboxes to silently
tick off.

Output is a written report with two parts: a "fixed in code" list (with commit/PR
references) and a separate "client action needed" checklist (categories 4, 9, and 10
primarily, plus anything else that surfaced) — handed to the client as its own document, not
buried in commit messages where it'll get lost.

## Open questions / assumptions

Resolved 2026-07-14 — hosting is Vercel, staging URL is
`https://queen-city-magic.vercel.app/`, and the donation mechanism is Venmo-only (see
categories 1, 4, 8, 9 above). One item remains genuinely open: QCMM's own nonprofit/tax
status (categories 4 and 10) — not resolved by this pass, correctly a "client must confirm"
item, not something to guess at further.

## Dependencies

Runs after every page currently in scope is built. As of 2026-07-16 that set is Home, Events,
Schedule, About, FAQ, Gallery (which now absorbs the former "10 Years interstitial" — that
page was folded into Gallery on 2026-07-15 rather than shipped standalone, see PRD 08's
archive note), Donate, Legal, Attributions, and 404 — all already exist in `src/pages/`. This
is a launch gate, not part of the sequential feature build order in `docs/prds/00-INDEX.md`,
and unlike when this PRD was first drafted, it's likely runnable now rather than blocked on
outstanding page builds.
