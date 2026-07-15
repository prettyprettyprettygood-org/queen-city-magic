# PRD 11 — Site Layout (Navbar, Footer, Section Shell)

## Start-work prompt

> Implement docs/prds/12-site-layout.md for the QCMM redesign. Read CLAUDE.md first.
> Depends on PRD 01 (tokens) for colors/type/focus-glow, and structurally wraps PRD 02
> (Hero) — the hero becomes the first `<section>` inside this PRD's page shell rather than
> the whole `<body>`. Open questions are resolved as of 2026-07-14 against `docs/content.md`
> — see "Open questions / assumptions — resolved 2026-07-14" below before writing markup;
> only the sticky-nav-background question is still genuinely open. Nav links to the full
> six-page set; any page whose content PRD hasn't landed yet gets a minimal stub route so
> nothing 404s (PRD 13 fills those in immediately after). Reuses `src/content/attribution.md`
> as part of the footer's credits content instead of duplicating it.
> When done: sweep for dead code, report ready for commit, then move this file to
> docs/prds/archive/ once the user has committed.

## Why this exists

Every PRD so far has built a self-contained feature (hero, particles, gallery, sound
toggle, cursor) against a bare `<body>` with no shared chrome. `src/layouts/` has existed
since PRD 00 but is still empty (`.gitkeep` only) — nothing has needed a real page shell
yet because there's only been one page. That stops being true as soon as a second page
(Gallery, Donate, Events, the 10 Years interstitial) exists: without a shared layout, every
page reimplements its own header/footer, and they drift. This PRD builds that shell once,
now, while there's still only one page to retrofit.

It also closes an open question logged in PRD 06 (Sound Toggle): its fixed-corner placement
was explicitly "pending a layout pass to make sure it doesn't collide with other fixed UI."
This is that pass.

## What it does, in plain terms

- **`src/layouts/BaseLayout.astro`** — the shared page shell (`<html>`/`<head>`/`<body>`,
  meta tags, font preloads, the anti-FOUC theme script currently inline in `index.astro`)
  that every page renders through via `<slot />`. `index.astro` is refactored to use it
  instead of owning the full document itself.
- **Navbar** — site-wide, persistent header. Contains the wordmark/site title (text-based;
  no logo asset exists yet — see open questions), links to the other pages once they exist
  (Gallery, Events, 10 Years, Donate — see PRD 00-INDEX's page list), and becomes the new
  home for `ThemeSelect`, which currently lives inside the hero section as
  `.hero__switcher` and disappears the moment a visitor scrolls past it. Moving it to a
  persistent navbar is the layout fix PRD 01 deferred.
- **Footer** — site-wide, persistent. Renders `src/content/attribution.md`'s credits
  (SFX/music attribution — currently unused by any component) and is the natural home for
  whatever else a real site footer needs (social links, contact, copyright line) — scoped
  minimally here since most of that content doesn't exist yet; this PRD builds the
  structural footer and wires in what's actually available (attribution) rather than
  inventing placeholder content.
- **Section shell convention** — the hero becomes the first `<section>` inside
  `<main>`, not the entire viewport/body. Establishes the pattern later PRDs' sections
  (Gallery, "who this is for"-style content blocks, etc.) follow: consistent horizontal
  padding/max-width, alternating background tokens (twilight/plum/forest per PRD 01),
  consistent section spacing rhythm — so each new page/section PRD isn't re-deriving its
  own container conventions.
- **Nothing else moves out of the hero.** `HeroParallaxImage`, `FadeSwapText`, and the
  heading stay exactly where PRD 02 put them — this PRD only changes what wraps the hero,
  not the hero itself.

## Accessibility branch

- Navbar is a real `<nav>` landmark with an accessible label if more than one nav region
  ends up on the page (e.g. distinguishing primary nav from a footer nav).
- A "skip to content" link, visually hidden until focused, as the very first focusable
  element — currently nothing in the codebase provides one, and it's the kind of thing
  that's genuinely bolted-on-later if it's not built alongside the nav itself.
- Footer credits render as real text (not an image), inheriting the standard body-text
  contrast pairing already verified in PRD 01.
- Nav links and the relocated `ThemeSelect` keep `.focus-glow` and ≥24×24px target size,
  same as their existing implementations — no new a11y surface being invented, just
  relocated.
- If the navbar becomes a mobile hamburger menu (see open questions), that toggle follows
  the same ARIA disclosure pattern as `ThemeSelect`'s existing `<details>`-based dropdown
  (already reused there instead of a from-scratch implementation) if the two can share an
  approach, or the standard `aria-expanded`/`aria-controls` button pattern if not.

## Open questions / assumptions — resolved 2026-07-14

`docs/content.md` (client-provided copy, verbatim from the live site) landed and settles most
of what this section originally left open. Resolved against it, per user decision:

- **Nav link set — confirmed final: Home, Gallery, FAQ, Events, 10 Years, Donate.** FAQ is
  new — it wasn't in PRD 00-INDEX's page list before `content.md` surfaced it as a full page
  of its own. Render all six as real nav links now rather than "omit until the page exists":
  the full page set is confirmed, and PRD 13 (Content Pages, immediately following this one)
  plus PRD 09 (Events) and PRD 08 (10 Years) land the actual routes right after. Any route
  that doesn't have its content PRD landed yet gets a minimal stub page (`BaseLayout` +
  heading only) in this PRD purely so nav links resolve instead of 404ing — not final content,
  just enough for the link to be real. Content PRDs replace the stub, they don't create the
  route from scratch.
- **Mobile nav pattern — resolved: disclosure/hamburger, not inline wrap.** Six links plus the
  relocated `ThemeSelect` control is too much for a small viewport to wrap inline without
  crowding tap targets. Use the same `<details>`-based disclosure convention `ThemeSelect`
  already established (native-semantic, no ARIA authoring needed) for the mobile toggle,
  per this PRD's own accessibility branch.
- **Footer content beyond attribution — resolved, real content available.** From
  `content.md`: a copyright line ("Queen City Magic — All Rights Reserved," current year
  computed at build/render time, not hardcoded — the source site's own `{current_year}`
  placeholder confirms they already treat this as dynamic), a Facebook link
  (facebook.com/queencitymagic) and Instagram link (instagram.com/queencitymagicsva/) each
  with an icon, and a "woman-owned & queer-friendly" badge. The badge is a value statement
  from the client, not a design placeholder — render it as real accessible text/icon (not
  literally just the 🏳️‍🌈 emoji standing alone, which screen readers announce inconsistently),
  same contrast/target-size bar as everything else in the footer. Attribution credits
  (`src/content/attribution.md`) still render alongside these, unchanged from the original
  plan.
- **Wordmark/logo — unchanged.** No logo asset has landed. Still styled text (display-serif
  "Queen City Magic"), not a graphic, until a real logo file is provided.

**OQ-12-2 resolved 2026-07-14: port `content.md`'s terminology as-is, don't tone it down.**
Per the user: this is the client's own direct copy from their live site, so the project's
usual trademark-flagging caution is relaxed *for this specific ported content* — the client
may already have their own read on the risk ("for all I know, they have permission or
something"), and will be asked directly about toning anything down later rather than this
redesign pre-emptively softening their own words. This does **not** relax the flagging
pattern for genuinely *new* wizarding-world-adjacent choices this redesign might introduce on
its own initiative (new color palettes, new imagery, new naming) — see
`feedback_ip_trademark_flagging` — only for verbatim client-authored copy being carried
forward as-is.

**OQ-12-1 resolved 2026-07-15: sticky, transparent-over-hero → solid-on-scroll.** Confirmed
the recommended treatment — the navbar stays fixed to the top at all times, transparent while
the hero is behind it, then gains a solid background (opacity-only, GPU-composited) once
scrolled past it. Only opted into on Home; every other page's navbar is solid immediately
since there's no hero to sit over.

## Dependencies

PRD 01 (tokens, focus-glow) for styling. Structurally wraps PRD 02 (Hero) — the hero section
markup itself doesn't change, only what contains it. PRD 06 (Sound Toggle)'s open question
about fixed-UI collision on mobile should be revisited once this PRD's navbar/footer exist.
