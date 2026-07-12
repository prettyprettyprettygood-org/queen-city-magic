# PRD 10 — Pre-Launch Production Readiness Audit

## Start-work prompt

> Run docs/prds/11-pre-launch-audit.md against the built site once Home, Gallery, the 10
> Years interstitial, Donate, and Events all exist. Read CLAUDE.md first for project
> conventions.
> This is a gate, not a feature — work through each category below, and for every finding,
> sort it into "code fix" (do it directly, or open a follow-up task if it's non-trivial) vs
> "client must confirm" (add it to the consolidated handoff checklist, don't attempt to
> resolve legal/financial/ownership questions yourself). Treat category 4 (payment/donation)
> and category 10 (account ownership) as high priority — they carry real legal/financial
> risk for a volunteer-run org. Produce a written report: a "fixed in code" list and a
> separate client-facing checklist — don't bury findings in commit messages.

## What it does

A structured audit pass, run once the in-scope pages are built and before the site goes
live, covering security, privacy, third-party risk, payments, accessibility, spam
protection, dependency health, SEO, and ownership/legal handoff. Every finding gets sorted
into two buckets — things fixable directly in code, and things that need the client's own
decision or sign-off, often with a lawyer or accountant — and this PRD deliberately keeps
those two buckets separate rather than blurring them.

## Audit categories

### 1. Security headers
- **Code fix:** Content-Security-Policy, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy`, `Permissions-Policy`, frame-ancestors/`X-Frame-Options`, and HSTS if the
  host supports it — configured via the hosting platform's headers config (e.g. Netlify
  `_headers`, Vercel `vercel.json`) or Astro middleware.
- CSP needs to allowlist exactly the third-party origins actually in use (built from
  category 3's inventory, not guessed at).

### 2. Privacy / cookie disclosures
- **Code fix:** a footer link to a privacy policy page/section, and plain-language
  disclosure of any `localStorage` use (sound-toggle preference, any reduced-motion
  override) — not a cookie technically, but worth disclosing on the same principle.
- **Client must confirm:** whether any analytics/tracking gets added at all (none is
  currently planned in any PRD). If it is, that changes consent-banner requirements
  depending on audience — a real decision, not a default to assume.

### 3. Third-party scripts
- **Code fix:** enumerate every third-party script/origin actually loaded (Turnstile,
  Formspree, web fonts — Pixieset is a link, not an embedded script) and confirm each is
  necessary, current, and loaded with appropriate `rel`/`crossorigin`/SRI where applicable.
- **Client must confirm:** that nothing gets bolted on later (a marketing pixel, a chat
  widget) without this inventory being revisited — worth a line in the handoff doc.

### 4. Payment / donation integration risk
- **Code fix:** if a payment processor is used, only ever integrate via a hosted
  checkout/redirect or a vetted embeddable widget (Stripe Checkout, PayPal donate button,
  Givebutter, etc.) — never build a custom card-collection form. Confirm the Donate page
  never touches card data directly (PCI scope stays entirely with the processor).
- **Client must confirm — high priority:** which payment/donation processor to use (not
  specified anywhere in the original brief); whether donations go to a registered 501(c)(3),
  a fiscal sponsor, or an individual/informal account, since that determines whether
  "tax-deductible" language is legally allowed on the page at all; who owns/reconciles the
  receiving account. This is a real legal/tax question for a volunteer-run festival — route
  it to the client's accountant, don't assume an answer.

### 5. Accessibility / WCAG issues
- **Code fix:** a full-site automated pass (axe-core or Lighthouse a11y audit) plus a manual
  keyboard-only and screen-reader spot check across Home, Gallery, 10 Years interstitial,
  and Donate — cross-checked against every "Accessibility branch" section across the other
  PRDs. This is where per-feature a11y work gets verified as a whole site, not just
  per-component.
- **Client must confirm:** whether a public accessibility statement page is wanted (common
  for public-facing event orgs; not strictly required unless the client is a government
  entity or receives certain public funding).

### 6. Forms / spam protection
- **Code fix:** confirm Formspree + Turnstile is wired end-to-end (the Turnstile token is
  actually verified server-side, not just rendered client-side), the form doesn't
  over-collect PII beyond what's needed, honeypot/rate-limit behavior matches or exceeds
  Formspree's defaults.
- **Client must confirm:** what happens to submitted contact/join data after Formspree
  receives it — who monitors the inbox, how long it's retained. Operational, not code, but
  worth confirming so it doesn't silently go unmonitored.

### 7. Dependency vulnerabilities
- **Code fix:** `npm audit` (or equivalent) clean or explicitly triaged, lockfile committed,
  no wildcard version ranges on anything security-sensitive (Turnstile SDK, Formspree
  client, Three.js), Dependabot or equivalent enabled if the repo lives on GitHub.

### 8. SEO metadata
- **Code fix:** title/meta description per page, Open Graph + Twitter card tags with real
  preview images (not placeholders), canonical URLs, `Event` structured data (schema.org)
  for the festival dates and, now that PRD 09 (Events) exists, for the individual events on
  that page too — its structured data model maps onto `Event` schema cleanly since it's
  already got dates/location/description. Alt-text coverage ties back to category 5.

### 9. Robots / sitemap
- **Code fix:** `robots.txt`, `sitemap.xml` (Astro's sitemap integration), and explicit
  noindex on anything that shouldn't be publicly indexed — e.g. a staging/preview deployment
  URL, if this redesign is previewed anywhere before going live on the real domain.

### 10. Account ownership
- **Client must confirm — high priority:** who owns the domain registrar login, the hosting
  account (Netlify/Vercel/whichever is chosen), the Formspree account, the Turnstile/
  Cloudflare account, the Pixieset account, any font licenses, and the GitHub repo itself.
  For a volunteer-run org, the real risk is a personal account — an individual volunteer's
  login — becoming the org's single point of failure. Recommend everything live under an
  org-controlled email/account rather than an individual's, and get this confirmed
  explicitly before launch, not discovered later when someone moves on.

### 11. Legal / compliance handoff
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
references) and a separate "client action needed" checklist (categories 4, 10, and 11
primarily, plus anything else that surfaced) — handed to the client as its own document, not
buried in commit messages where it'll get lost.

## Open questions / assumptions

- Hosting platform isn't chosen yet — affects exactly how security headers get configured
  (Netlify `_headers` vs. Vercel `vercel.json` vs. something else).
- Payment/donation processor isn't chosen yet (category 4) — this is the single
  highest-leverage unknown in this whole PRD and is worth resolving with the client well
  before this audit runs, not discovered at audit time.
- Whether this redesign gets a public staging URL before going live — affects category 9's
  noindex needs.

## Dependencies

Runs last, after Home, Gallery, 10 Years interstitial, Donate, and Events are all built —
i.e., after every other PRD in `docs/prds/` is complete. This is a launch gate, not part of
the sequential feature build order in `docs/prds/00-INDEX.md`.
