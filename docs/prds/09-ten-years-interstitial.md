# PRD 08 — "10 Years of Pictures" Interstitial

## Start-work prompt

> Implement docs/prds/09-ten-years-interstitial.md. Read CLAUDE.md first. Depends only on
> PRD 01. Lowest-risk PRD in the set. Build with placeholder copy/password-policy language
> (final copy is pending client input per this PRD's open questions) — structure it so
> dropping in final copy later doesn't require touching layout code. Recommendation on file:
> keep this page visually quiet rather than reusing the full particle/ink treatment, since
> it's a transactional handoff page — flag if that reads wrong once built. When done: sweep
> for dead code, commit, then archive.

## What it does

A branded interstitial page that stands between the site and the external Pixieset login,
instead of linking straight to a bare third-party login page. Sets expectations (external
gallery, login required), matches the site's visual language, then hands off.

## Interaction/animation behavior, in plain terms

- A mostly static, low-motion page — its job is to set expectations and hand off quickly,
  not to be a showpiece. Proposing it stay deliberately quiet: site typography and color
  tokens, maybe a light texture background, but *not* the full particle/ink treatment used
  on the hero — this is a transactional page, and heavy decoration would work against its
  purpose. Flagged as a recommendation below, not a locked decision.
- Content: a heading ("10 Years of Pictures" or the client's preferred title), short
  explanatory copy (placeholder for now: "You're about to leave queencitymagic.com — our 10
  years of photos live on Pixieset, a third-party gallery, and you may need the event
  password to view them."), and one clearly-labeled outbound CTA to the Pixieset gallery
  URL.
- Actual copy and access/password policy are pending client input per the brief — this PRD
  builds the page and its structure now, with placeholder copy, so the final text can be
  dropped in without a rebuild once confirmed.

## Accessibility branch

- The outbound link's accessible name says where it goes and that it leaves the site (e.g.
  "Continue to Pixieset gallery" with visually-hidden or icon-paired text indicating it's an
  external site) — not a bare "Click here."
- If the link opens in a new tab, that's programmatically indicated (visually-hidden text or
  icon+label), since an unexpected new-tab context change is itself an accessibility
  concern.
- Standard heading structure, `.focus-glow` on the CTA, and body copy contrast checked
  against PRD 01's matrix like every other page.
- No new animation surface introduced beyond whatever ambient treatment (if any) this page
  reuses from other PRDs — and if it does reuse particles/texture, it inherits that PRD's
  existing reduced-motion gating rather than introducing a separate one.

## Open questions / assumptions

- **Final copy and password/access policy** — explicitly pending client input per the brief.
  Building now with placeholder copy, wiring final copy in once confirmed.
- **New tab vs. same tab** for the outbound Pixieset link — not yet decided.
- **How much visual treatment this page gets** — proposing minimal/quiet (recommendation
  above) since it's a transactional handoff page, not a moment to showcase the design
  system. Open to the client/user preferring more atmosphere here; flagging it as a
  deliberate choice rather than an oversight.

## Dependencies

- PRD 01 (design tokens, typography) only. Lowest-risk, most independent PRD in the set —
  good candidate for early or parallel work alongside the Sound Toggle.
