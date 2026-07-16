# PRD 13 — Page & Section Layout Conventions

## Start-work prompt

> Implement docs/prds/14-page-section-layout.md for the QCMM redesign. Read CLAUDE.md first.
> Depends on PRD 11 (Site Layout) for BaseLayout/Section, and touches every page PRD 12
> (Content Pages) landed. **Resolved 2026-07-15: PageHeader is standalone (not embedded in
> the first Card), takes an optional icon prop defaulting to none, and SectionHeader only
> covers headings outside a Card — Card's own `slot="title"` styling is untouched.** All
> three open questions below are decided; build to that shape, not the raw recommendation
> language.
> When done: sweep for dead code, report ready for commit, then move this file to
> docs/prds/archive/ once the user has committed.

## Why this exists

PRD 11 standardized the chrome *around* `<main>` (Navbar, Footer, Starfield, the `Section`
shell for horizontal padding/max-width). Nothing standardizes what goes *inside* `<main>` on
a per-page basis, and now that PRD 12 landed real content on six pages, the gap shows:

- **The h1 treatment is copy-pasted, not shared**, and has already drifted. `about.astro`,
  `donate.astro`, `faq.astro`, `gallery.astro`, `events.astro`, and `attributions.astro` each
  carry their own near-identical `<style> h1 { font-size: clamp(1.5rem, 3.5vw, 2rem);
  font-weight: 400; margin: 0; color: var(--color-surface-primary); } </style>` block. It's
  the same rule six times over, one edit away from silently diverging further.
- **The h2 treatment has already diverged.** Home's intro heading is
  `clamp(1.35rem, 3vw, 1.65rem)`, Gallery's is `clamp(1.2rem, 2.5vw, 1.5rem)`, About's is
  `clamp(1.25rem, 3vw, 1.5rem)` — three different sizes for what's visually the same role.
- **`ten-years.astro` is a bare stub that skips the convention entirely** — a raw `.stub` div
  with an unstyled `<h1>`, not using `Section`/`Card`/any shared heading treatment at all. It's
  currently the worst-looking page on the site because it never got pulled into what the other
  six pages built ad hoc.
- **`Divider` — a fully built, theme-reactive ornamental rule — is used exactly once**, on
  Home between the intro and the card grid. CLAUDE.md is explicit: "check existing components
  for something reusable first... don't duplicate... extend or compose instead." Multi-section
  pages (About's bio vs. press, Gallery's video vs. archive-teaser) currently rely on `Section`
  padding alone to separate their parts, when this exact "line / glyph / line" break already
  exists and is exactly what those seams need.

This PRD closes all four gaps in one pass: a shared `PageHeader` for the h1 moment, a shared
`SectionHeader` for the h2 moment, and a stated convention for when `Divider` is used —
applied to every page, including bringing `ten-years.astro` up to the same baseline as
everything else.

## What it does, in plain terms

- **`src/components/PageHeader.astro`** — the standard h1 treatment for every page *except*
  Home. Home's h1 lives in `Hero.astro` as a deliberately distinct diary-effect headline (see
  Scope decision below) and is out of scope here. Renders **standalone, above `Section`**
  (matching Home's `.intro` block) rather than embedded in the first `Card` — every page gets
  a consistent "title, then content" rhythm independent of how many Cards follow. Takes an
  **optional icon prop, defaulting to none**: About/Donate/Events currently show an icon in
  their first Card's header and can opt in via the prop; FAQ/Gallery/Attributions render
  without one, unchanged from today. Replaces the duplicated `<style>` block in About, Donate,
  FAQ, Gallery, Events, Attributions, and (newly) Ten Years — one component, one place to
  change the h1 rule going forward.
- **`src/components/SectionHeader.astro`** — the standard h2 treatment for a section-level
  heading, **scoped to headings that sit outside a `Card`** (Home's "The magic explained…"
  intro heading, Gallery's bare `<h2>See a sneak peak</h2>`). `Card`'s own `slot="title"`
  styling (About's "In the press", Gallery's "Unforgettable Memories") stays **untouched** —
  already consistent via `.card__title :global(h1/h2/h3)`, not part of this PRD's scope.
  Supports an optional icon-in-circle treatment matching Home's existing `.intro__icon`
  (reusing `HouseSectionIcon` or a Lucide icon the same way Card's own icon slot already does),
  since that's the most fully-realized existing example of the pattern.
- **Divider convention, stated explicitly**: any page rendering more than one sibling
  `<Section>` gets a `<Divider />` between them. Applies immediately to About (bio /
  press) and Gallery (video / archive-teaser); applies to any future page or PRD that lands a
  second `<Section>` (Events, once it grows past its current single-card placeholder).
- **`ten-years.astro` is rebuilt onto the shared convention** — `PageHeader` + `Section`
  instead of its current one-off `.stub` div, even though its real content is still pending
  the client per PRD 08 (`09-ten-years-interstitial.md`). This is a shell-only change; that
  PRD still owns the actual interstitial content/interaction.
- Net effect: seven pages lose their duplicated `<style> h1 {...} h2 {...} </style>` blocks
  in favor of `PageHeader`/`SectionHeader` usage; total heading CSS surface shrinks from
  ~7 near-duplicate rule sets to 2 shared components.

## Accessibility branch

- One `<h1>` per page, no exceptions: `PageHeader` renders it on every page except Home
  (where `Hero` already does, unchanged). Nothing else on a page renders an `<h1>`.
- Heading hierarchy stays `PageHeader` → h1, `SectionHeader` → h2, `Card`'s own
  `slot="title"` → contextual h1/h2/h3 exactly as it already works — this PRD doesn't change
  what heading level a `Card` title renders, only what wraps it.
- `Divider` keeps its existing `role="presentation"` / `aria-hidden` treatment on its glyph
  and lines — it's a decorative rule between landmarks, not a landmark itself, and wider reuse
  doesn't change that contract.
- Any icon on `PageHeader`/`SectionHeader` stays `aria-hidden="true"`, matching `Card`'s own
  icon slot and Home's `.intro__icon` — decorative only, the heading text carries the meaning.
- `ten-years.astro`'s rebuild picks up real focus-visible/target-size behavior for the first
  time (its current stub has none beyond default browser behavior) simply by moving onto
  `Section`/`PageHeader`, which already carry that baseline.

## Open questions / assumptions — resolved 2026-07-15

All three resolved per the recommendation stated when this PRD was drafted; no
counter-argument came back, so each is now a decision, not an option:

1. **`PageHeader` placement — resolved: standalone above `Section`**, not embedded in the
   first `Card`. Matches Home's already-shipped `.intro` treatment (the most polished existing
   instance of this pattern) and gives every page a consistent "title, then content" rhythm
   regardless of how many Cards follow.
2. **`PageHeader` icon — resolved: optional per-page prop, default none.** Preserves the
   current mixed usage (About/Donate/Events show one today, FAQ/Gallery/Attributions don't)
   without forcing every page to invent an icon it doesn't have a real one for yet.
3. **`SectionHeader` vs. `Card`'s `slot="title"` — resolved: outside-Card only.** `Card`
   already styles its own title slot consistently via `.card__title :global(h1/h2/h3)`;
   `SectionHeader` doesn't touch it. Keeps this PRD scoped to "fix the duplicated ad hoc
   heading CSS," not "restyle Card," which isn't broken and isn't asked for.

## Dependencies

PRD 11 (Site Layout) for `BaseLayout`/`Section`/`.focus-glow` this builds on top of. Touches
every page PRD 12 (Content Pages) landed real copy for for. No hard blocker for anything else
in the build order — can land any time — but the sooner it lands, the less rework later pages
(Events' real build, any future page) inherit from copying the current ad hoc pattern instead
of a shared one.
