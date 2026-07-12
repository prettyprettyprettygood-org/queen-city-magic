# PRD 00 — Project Scaffold & Initialization

## Start-work prompt

> Implement docs/prds/01-project-scaffold.md for the QCMM redesign. Read CLAUDE.md first —
> this PRD is what makes CLAUDE.md's conventions (file structure, TS, no-hardcoded-tokens,
> a11y hooks) actually enforceable, since right now there's no app for them to apply to. No
> dependencies — this runs first, before PRD 01 (Design Tokens). Raw source assets (images,
> audio, attribution) currently live in /assets at repo root — part of this PRD's job is
> sorting them into the Astro project's src/assets/ (build-processed images) vs public/
> (static passthrough audio) once the app skeleton exists, per the "Asset placement" section
> below. When done: sweep for dead code/unused scaffolding, commit, then move this file to
> docs/prds/archive/.

## What it does

Initializes the actual Astro application — dependencies, config, folder structure, tooling —
that every other PRD assumes already exists. PRD 01 (Design Tokens) talks about "extending
the Tailwind config"; that config doesn't exist until this PRD creates it. This is pure
scaffolding: no design decisions, no animation, no visual output beyond a blank running dev
server.

## What it does, in plain terms

- **Astro project init**: `npm create astro@latest` (or equivalent) with the TypeScript
  strict template, into the existing repo (not a fresh empty directory, since the repo
  already has CLAUDE.md, docs/, and assets/ — init needs to run in a way that doesn't
  clobber those, e.g. `astro create .` accepting the non-empty-directory prompt, or manual
  scaffold if the CLI insists on empty).
- **Integrations**: `@astrojs/tailwind` (or Tailwind v4's Vite plugin, whichever is current
  and recommended at build time), `@astrojs/react` (for the interactive islands every later
  PRD needs), `@astrojs/sitemap` (used later by the pre-launch audit PRD, cheap to add now
  while touching `astro.config`).
- **Dependencies**: `framer-motion`, `three` (+ `@react-three/fiber` if that's the chosen
  Three.js integration approach — a call worth making explicitly here rather than
  rediscovering it when the hero PRD needs it), Formspree's client helper if one is used
  (or plain `fetch` against the Formspree endpoint — simpler, fewer deps, proposed default),
  Turnstile's script/React wrapper.
- **Folder structure** (proposed, to confirm before other PRDs start assuming paths):
  ```
  src/
    assets/          # images/audio Astro processes at build time
    components/      # shared UI (buttons, cards, section wrappers) — checked before
                      # writing new markup, per CLAUDE.md
    islands/         # React components mounted as Astro islands (cursor, particle field,
                      # hero animation, gallery, sound toggle)
    layouts/         # page shells
    lib/
      hooks/         # useReducedMotion, useHoverCapable, etc. (PRD 01 builds these here)
    pages/           # Astro file-based routing: index, gallery, ten-years, donate
    styles/          # global.css / Tailwind entry
  public/
    audio/           # static audio passthrough (ambient loop, SFX)
  ```
- **TypeScript**: strict mode on, path aliases configured (e.g. `@/components/*`) so imports
  don't turn into `../../../` chains as the tree grows.
- **Linting/formatting**: ESLint + Prettier (or Biome, a lighter single-tool alternative
  worth considering given the small team) configured and wired to a `npm run lint` /
  `npm run typecheck` script — CLAUDE.md already says these run before a PRD is considered
  done, so the scripts need to exist.
- **Env var scaffolding**: `.env.example` with placeholder keys for `FORMSPREE_ENDPOINT`,
  `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`; `.env` gitignored.
- **Git hygiene**: `.gitignore` covering `node_modules`, `dist`, `.env`, `.astro`.
- **Base `astro.config.mjs`**: integrations wired, no site-specific config yet (that's
  PRD 01's job for theme, and the pre-launch audit's job for headers/sitemap specifics).
- **Smoke test**: a placeholder `src/pages/index.astro` that renders "Queen City Magic" in
  plain text, `npm run dev` boots without errors — proves the scaffold actually works before
  any other PRD builds on it.

## Asset placement

The images and audio currently sitting in `/assets` at repo root (moved there ahead of this
PRD) get sorted here, not before:
- `/assets/images/*.jpg` → `src/assets/images/` — these go through Astro's image
  optimization (`astro:assets` / `<Image>`), per CLAUDE.md's "no unoptimized full-resolution
  drops into public/" rule. They're candidate hero/about/gallery source photos; which image
  goes where is decided by the PRDs that actually use them (Hero, Gallery), not this one.
- `/assets/audio/*.mp3` → `public/audio/` — audio is served as a static file via `<audio>`,
  no build-time processing needed, so it belongs in `public/`, not `src/assets/`.
- `/assets/attribution.md` → becomes the seed for a real credits/attribution section
  (footer, per the file's own note) — content ownership stays with whichever PRD builds the
  footer, but the file itself moves into the project (e.g. `src/content/attribution.md` or
  directly into the footer component) rather than staying as a loose root-level file.

## Accessibility branch

Not directly applicable — this PRD has no user-facing surface. Its accessibility
contribution is indirect: it's where `src/lib/hooks/` gets created as a real location for
PRD 01's `useReducedMotion`/`useHoverCapable` hooks to live, so every later PRD imports from
one canonical place instead of each reinventing it.

## Open questions / assumptions

- **Package manager**: assuming npm unless there's a preference (pnpm/yarn) — cheap to
  switch now, annoying later.
- **Three.js integration approach**: raw `three` + manual canvas setup, or
  `@react-three/fiber` for a more declarative/React-idiomatic API? Given there's exactly one
  Three.js moment (hero parallax, per the confirmed scope decision), a case exists for
  keeping it raw/minimal rather than pulling in the R3F + drei ecosystem for one effect —
  flagging as a real tradeoff (raw = smaller dependency footprint, R3F = easier to maintain
  if the one moment grows). Proposing raw `three` for now given the narrow scope.
  Formspree client: proposing plain `fetch` against the form endpoint over pulling in a
  dedicated Formspree React package — one POST request doesn't need a dependency.
- **ESLint+Prettier vs. Biome**: proposing Biome for a small team/single-repo demo (one tool,
  fast, less config) unless there's an existing preference from other projects.
- **Deployment target** isn't chosen yet — doesn't block this PRD (Astro scaffolds
  framework-agnostically), but the pre-launch audit PRD's security-headers work depends on
  knowing this eventually (Netlify `_headers` vs. Vercel `vercel.json` vs. other).
- Does `astro create` need to run against an empty directory, forcing a "scaffold elsewhere
  then merge in" step? Worth checking against the current Astro CLI version at
  implementation time rather than assuming either way here.

## Dependencies

None — this is the true first step, ahead of PRD 01 (Design Tokens). Every other PRD depends
on this one existing and working (`npm run dev` boots) before it can start.
