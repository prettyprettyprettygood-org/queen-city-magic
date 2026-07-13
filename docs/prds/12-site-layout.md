# PRD 11 — Site Layout (Navbar, Footer, Section Shell)

## Start-work prompt

> Implement docs/prds/12-site-layout.md for the QCMM redesign. Read CLAUDE.md first.
> Depends on PRD 01 (tokens) for colors/type/focus-glow, and structurally wraps PRD 02
> (Hero) — the hero becomes the first `<section>` inside this PRD's page shell rather than
> the whole `<body>`. Before writing markup, resolve the open questions below (nav link set,
> ThemeSelect's new home, mobile nav pattern) — they change the shape of the shell. Reuses
> `src/content/attribution.md` as the footer's credits content instead of duplicating it.
> When done: sweep for dead code, commit, then move this file to docs/prds/archive/.

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

## Open questions / assumptions

- **Nav link set.** PRD 00-INDEX lists Home, Gallery, the 10 Years interstitial, Donate,
  and Events as the eventual page set — but only Home exists right now. Proposing the
  navbar render links for pages that exist yet and gracefully omit/placeholder the rest,
  rather than linking to routes that 404. Confirm before building.
- **Mobile nav pattern.** Hamburger/off-canvas vs. a simple inline-wrapping link list —
  depends on how many nav items actually ship (small list may not need a hamburger at all).
  Decide once the link set above is confirmed.
- **Is the navbar fixed/sticky or does it scroll away?** Sticky nav would sit on top of the
  hero's parallax image at all times (fine, `z-index` already establishes `.hero__switcher`
  above the parallax layer) but needs a background treatment for when it's overlaid on
  varying section background colors as the page scrolls beneath it — transparent-over-hero
  fading to solid-on-scroll is a common pattern but is a real design decision, not
  assumed here.
- **Footer content beyond attribution.** Social links, contact info, a real copyright line
  — none of this exists in the codebase or assets yet. Proposing the footer ship with just
  the attribution credits for now and grow as that content becomes available, rather than
  inventing placeholder links.
- **Wordmark/logo.** No logo asset exists in `src/assets/`. Proposing the navbar use styled
  text (display-serif "Queen City Magic") matching the hero heading's font, not a graphic,
  until a real logo file is provided.

## Dependencies

PRD 01 (tokens, focus-glow) for styling. Structurally wraps PRD 02 (Hero) — the hero section
markup itself doesn't change, only what contains it. PRD 06 (Sound Toggle)'s open question
about fixed-UI collision on mobile should be revisited once this PRD's navbar/footer exist.
