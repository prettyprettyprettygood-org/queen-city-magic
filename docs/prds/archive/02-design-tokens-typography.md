# PRD 01 — Design Tokens & Typography Scaffold

## Start-work prompt

> Implement docs/prds/02-design-tokens-typography.md for the QCMM redesign. Read CLAUDE.md
> first for project conventions. Dependency: PRD 00 (docs/prds/01-project-scaffold.md) must
> be done — the Astro app, Tailwind, and `src/lib/hooks/` need to exist before this PRD has
> anywhere to put its config and hooks. Every later PRD depends on what gets set up here
> (Tailwind theme tokens, font loading, the `useReducedMotion`/`useHoverCapable` hooks, the
> `.focus-glow` utility, the contrast matrix). Check docs/prds/00-INDEX.md's "Shared
> utilities" list so these get built generically enough for hero, particles, cursor, scroll
> choreography, gallery, and sound toggle to all consume them without rework later. Propose
> the palette + full contrast matrix as a reviewable artifact before locking it in, since
> it's originated for this demo rather than pulled from existing brand assets. When done:
> sweep for dead code (see CLAUDE.md), commit, then move this file to docs/prds/archive/.

## What it does

Establishes the visual and technical foundation every other PRD builds on: the Tailwind
theme (jewel-tone palette + amber accent), the type scale (display serif anchor + script
accent for eyebrows only + body face), texture assets, and the shared accessibility
utilities (`useReducedMotion`, `useHoverCapable`, focus-glow ring) that get reused across
the rest of the build. This is a config/scaffold PRD, not an animated feature — its "behavior"
section is about what gets set up, not what moves.

## What it does, in plain terms

- Tailwind config extended with named color tokens instead of raw hex sprinkled through
  components: something like `twilight` (indigo-950 base), `plum`, `forest`, and `amber`
  (the warm accent/light source), plus neutral `parchment` (off-white/cream, for text on
  dark surfaces) and `ink` (near-black, for text on light/parchment surfaces).
- Font loading: the existing display serif from the QCMM logo is the anchor face for
  headings — needs the actual font file/license from the client's brand kit, since it's
  not something we can guess from the live GoDaddy site. One hand-lettered/script face
  added for section eyebrows only.
- Base layer: body font, heading font, and a `.focus-glow` utility class (soft amber
  box-shadow ring, not just an outline color swap) applied via `:focus-visible`.
- Two hooks: `useReducedMotion()` (reactive `matchMedia('(prefers-reduced-motion: reduce)')`
  listener) and `useHoverCapable()` (reactive `matchMedia('(hover: hover) and (pointer: fine)')`
  listener) — every later interactive/animated PRD imports these rather than re-implementing
  media-query listening.
- Texture assets: originally scoped as five background/decorative motifs (parchment grain,
  ink-wash, wax-seal, brass-instrument, constellation) — all five were removed during
  implementation (see "Scope addition" below); none currently exist in `public/textures/`.
  Any future texture work should still be scoped so it reads as Victorian/Edwardian
  occult-adjacent rather than a specific franchise (no basin-and-wisp iconography, no
  house-crest iconography, no maroon/gold pairing as a system).

## Accessibility branch

This PRD *is* the accessibility branch for everything downstream, in the sense that it's
where the shared tools get built once:

- `useReducedMotion()` / `useHoverCapable()` hooks, built here, reused everywhere else —
  this is the mechanism by which every other PRD's reduced-motion behavior stays consistent
  instead of six slightly-different implementations.
- `.focus-glow` must itself be checked for non-text contrast (3:1) against both the darkest
  surface (twilight/plum) and the lightest (parchment) it can appear on.
- Deliverable: a contrast matrix — every planned text/background pairing (body text 4.5:1,
  large text/UI 3:1) checked at the *actual* production hex values, not eyeballed against
  the jewel-tone direction. This has to happen before any page ships copy in these colors.

## Open questions / assumptions — resolved 2026-07-11

- **Display-serif font file**: no brand kit / logo font file was available (GoDaddy Website
  Builder doesn't expose it). Resolved by sourcing a period-accurate visual match instead of
  guessing at the client's actual logo face: **IM Fell English** (self-hosted woff2), chosen
  over Cinzel Decorative / UnifrakturMaguntia (both considered, both judged too illegible at
  small sizes / too heavy-handed for body-adjacent headings) and over Cormorant Garamond /
  Libre Caslon Display (considered as the initial proposal, superseded once the "genuinely
  period-accurate, not blackletter" direction was picked).
- **Script accent face**: **Marck Script** — most legible of the three candidates proposed
  (vs. Mrs Saint Delafield, Give You Glory) at small eyebrow sizes. Used for eyebrow lines
  only, never the hero headline (see `project_qcmm_scope_decisions` memory / PRD 00-INDEX
  scope-decisions log, decision #1).
- **Body face**: **EB Garamond** — humanist text serif, holds up in long paragraphs at
  mobile body sizes where the display face would not.
- **Jewel-tone palette**: locked as originally proposed — **twilight** `#160F2E` (primary dark
  ground), **plum** `#2B1730` and **forest** `#0E2A1E` (alternating section grounds), **amber**
  `#F2B347` (accent/light-source, with a dedicated `#C1630B` "amber-glow" for the shared focus
  ring — the bright accent amber only clears 1.65:1 against parchment, nowhere near the 3:1 a
  focus ring needs there, so the ring gets its own tone), **parchment** `#F8F1E4` and **ink**
  `#1C1712` (light-surface/text-on-light neutrals). Full contrast matrix computed against the
  real hex values (not eyeballed) — every pairing clears its WCAG 2.2 threshold (4.5:1 body
  text, 3:1 large text/UI); see the review artifact from the PRD 01 implementation session for
  the full table.

## Scope addition — four house-inspired theme identities (added mid-implementation, 2026-07-11)

Not in the original brief. The client asked for four additional switchable color themes named
after the four Hogwarts houses, with film-canon color pairings (scarlet+gold, green+silver,
blue+bronze, yellow+black) and a dropdown to switch between them. This went through three
naming rounds before landing:

1. **House names + film-canon hexes** (as first requested). Flagged: literal house names +
   film-canon hex values on QCMM's real public site is real trademark exposure — Warner Bros.
   actively enforces against unlicensed wizarding-world branding, even for nonprofit fan
   events — and it directly reversed this PRD's own original scope line ("no house-crest
   iconography, no maroon/gold pairing as a system"). Resolved by de-canoning: original names
   (Ember/Ivy/Nocturne/Meadow), hexes shifted off both the film canon and the client's own
   example values.
2. **Renamed to house mascots** (Lion/Snake/Crow/Badger). Flagged again: mascot names paired
   with the same color families make the house mapping just as recognizable as the original
   names would have, without literally using the trademarked words. Client proceeded anyway.
3. **Renamed to house traits** — Daring, Ambition, Wisdom, Loyalty. This round was a genuine
   de-risking, not just another relabel: abstract virtue nouns show up in mottos, schools, and
   sports clubs generically and don't require the animal+color pairing to read as Harry Potter
   at all.
4. **Renamed to trait+color pairs** (final) — **Daring Red**, **Ambitious Green**, **Clever
   Blue**, **Loyal Gold**. ("Wisdom" → "Clever," matching Ravenclaw's "wit" trait as much as
   "intelligence.") A further de-risking, not a reversal: naming the hue directly makes these
   read as ordinary color-swatch labels ("sunset orange"-style), which is arguably *less*
   HP-identifiable than the abstract trait-only names, while also being more useful for a
   color picker specifically — the name now tells you both the vibe and the hue. Internal
   slugs/CSS-variable prefixes renamed to match: `ambition→ambitious`, `wisdom→clever`,
   `loyalty→loyal` (`daring` unchanged).

See `feedback_ip_trademark_flagging` memory — if the client renames again or asks to lean
further into the wizarding-school framing, re-raise the trademark point every time, since this
has proven to be a recurring judgment call rather than a one-time settled decision.

**Revised architecture — background ≠ primary, per-theme light/dark mode (2026-07-12).**
The first pass used the theme's saturated brand hue (`deep`) directly as the page background,
with a bright pastel `tint` as a secondary. Client feedback: the page background shouldn't be
the fully-saturated primary color, and the tint swatch read as "too bright." Reworked to five
semantic roles per theme:

- **`bg`** — the actual page background: a low-saturation (~6–13%) tint at the theme's hue,
  not the saturated brand color. "A subtle color that compliments the theme," not a loud field.
- **`panel`** — a slightly stepped-up version of `bg`, for dropdown panels, table rows, cards.
- **`text`** — body text color (`ink-900` on light-mode themes, `parchment-50` on dark-mode).
- **`primary`** — the theme's saturated brand hue (what `deep` used to be) — now used for
  headings, links, icon tints, and button backgrounds, never as the page background.
- **`accent`** — unchanged concept: decorative-only metallic companion (borders, flourishes).

Each theme commits to one mode rather than mixing: **Twilight and Ambitious Green are dark
mode** (a subtle dark ground + light text), **Daring Red, Clever Blue, and Loyal Gold are
light mode** (a subtle light ground + dark text) — the client's own call ("Ambition can be
dark mode, the rest more light mode"). `glow` (the focus ring) is simply each theme's own
`primary` value now, reused rather than a separate hue — verified to clear 3:1 against both
that theme's `bg` and `panel` for every theme. Loyal Gold's `primary` became a deepened
gold-brown (`#7A5A0A`) rather than the literal near-black "house color," because near-black
text on a light background would be visually indistinguishable from ordinary body copy — a
"primary brand color" has to actually read as distinct from body text to do its job.

| Theme (slug) | Mode | `bg` | `panel` | `primary` | `accent` |
|---|---|---|---|---|---|
| Twilight (default) `twilight` | dark | `#160F2E` | `#1F1740` | `#F2B347` (amber-400) | `#C77F1C` (amber-600) |
| Daring Red `daring` | light | `#FAEBEC` | `#F0D8D9` | `#591317` | `#BE8A38` |
| Ambitious Green `ambitious` | dark | `#131C18` | `#1D2923` | `#519473` | `#75786E` |
| Clever Blue `clever` | light | `#EBEEFA` | `#D8DDF0` | `#152552` | `#8F6A38` |
| Loyal Gold `loyal` | light | `#FAF5EB` | `#F0E9D8` | `#7A5A0A` | `#D6A23B` |

Full contrast pass on the new values: `text` vs `bg` and vs `panel` ≥4.5:1 for every theme;
`primary` vs `bg` (as heading/link text) ≥4.5:1 for every theme; `primary` as the focus ring
≥3:1 against both `bg` and `panel` for every theme. Button/CTA elements use a per-theme
`on-primary` text color (whichever of ink-900/parchment-50 wins the higher contrast against
that theme's `primary` — computed per theme, not assumed).

Implemented as semantic `--surface-*` CSS custom properties (`--surface-bg`,
`--surface-panel`, `--surface-text`, `--surface-primary`, `--surface-on-primary`,
`--surface-accent`, `--surface-glow`, `--surface-border`) that every component should
reference instead of any raw color name; `[data-theme="daring|ambitious|clever|loyal"]` on
any ancestor element re-points those variables. The base "Twilight" identity is simply the
absence of a `data-theme` override. A `ThemeSelect` component (custom `<details>` +
radio-group listbox, not a native `<select>` — native `<option>` elements cannot render icons,
which the theme picker needs) persists the choice to `localStorage` and is anti-FOUC'd via an
inline `<head>` script.

**Persistence and privacy.** The theme choice survives a refresh via `localStorage`
(`qcmm-theme` key) — this was already in place from the first implementation pass, not new.
No cookie-consent banner is needed for this: it's `localStorage`, not a cookie, used purely
for a functional UI preference (not analytics/advertising/tracking), which falls under the
GDPR ePrivacy "strictly necessary" exemption and isn't "sale/sharing" of personal data under
CCPA. Not a substitute for the client's own legal review if this ships as the real production
site, but no consent flow is needed for this specific mechanism.

**Icons: custom emblem → Lucide's `Shield`.** Each theme first got its own hand-drawn animal
icon (snake/lion/badger/crow), then a custom-drawn generic seal/monogram
(`EmblemIcon.astro`) once the client asked for "a small emblem or crest" and a literal
heraldic crest was flagged as the most recognizable HP visual device of anything built so
far. The client then asked to use Lucide's `shield` icon instead (filled solid, not outlined)
and explicitly OK'd adding an icon library since more icons will be needed later —
**`@lucide/astro` is now a project dependency**, reversing the earlier "no icon library,
neither has the right icons" decision from when the ask was still animal-specific.
`EmblemIcon.astro` was deleted; every theme option and identities-table row now renders
`<Shield color={theme-primary} fill={theme-primary} />` — same icon everywhere, tinted per
theme, which keeps the "one shape, recolored" reasoning that made the custom emblem
non-crest-like in the first place.

**Icon legibility: each icon needs its own background chip.** Every theme option in the
dropdown shows a *different* theme's shield color, but they all sit inside one shared panel
background (whichever theme is currently active). Computed contrast of every shield color
against every possible active-theme panel: several combinations fail badly — e.g. Twilight's
amber shield against a light-mode panel is ~1.65:1, and light-mode shields (Daring/Clever/
Loyal) against a dark-mode panel drop to ~1.1–2.6:1 — because shield colors are only
guaranteed legible against *their own* theme's background, not an arbitrary shared one, and no
single shared panel color can fix that (half the primaries are dark colors built for a light
background, the other half the reverse). Fixed by giving each icon its own small chip using
that theme's own `bg` color (`.option-icon-chip` / `.identities__emblem-chip`) — every icon
now always sits on exactly the background it was contrast-checked against, regardless of which
theme is currently active. Same fix applied in both `ThemeSelect` and `IdentitiesTable`.

**Texture assets removed.** The five original texture assets (parchment-grain, ink-wash,
wax-seal, brass-instrument, constellation) were all removed after review — the grain/ink-wash
looked "blurry/weird" once rendered (`feTurbulence`-based SVG filters rasterize poorly at
fixed `<img>` pixel dimensions) and the other three were dropped alongside the icon rework.
`public/textures/` is currently empty; any future texture work is a fresh scope item, not a
revival of these files.

**Preview consolidated.** The demo page originally showed one full preview card per identity
(5 repeated card layouts). Replaced with a single `IdentitiesTable.astro` — one table, one row
per identity, showing the icon + Background/Primary/Accent/Focus-ring swatches (Background
added as its own column specifically so the new subtle-bg-vs-saturated-primary distinction is
visible at a glance) — since five structurally-identical cards read as redundant rather than
as five things worth comparing side by side.

## Dependencies

PRD 00 (Project Scaffold) must be done first. Every other feature PRD depends on this one.
`@lucide/astro` was added as a dependency during this PRD's implementation (see "Icons" above)
— later PRDs needing icons should reuse it rather than introducing a second icon library.
