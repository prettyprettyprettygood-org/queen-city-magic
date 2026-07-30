# Magic Festival

A generic, reusable event-site template built with [Astro](https://astro.build). Placeholder
branding, lorem ipsum copy, and stock imagery throughout — ready to be re-skinned for a real
event (festival, race, convention, etc.).

## Tech stack

- **Astro** — static-first pages, islands only where interactivity is needed
- **React** — for the few genuinely interactive pieces (particle field, starfield, gallery,
  glow effects)
- **Tailwind CSS v4** — styled via design tokens in [`src/styles/tokens.css`](src/styles/tokens.css)
- **Content collections** — events defined as markdown in `src/content/events`
- **Biome** — linting/formatting
- **Vitest** — unit tests
- **Playwright** — e2e tests (not run proactively; see below)

## Project structure

```
src/
  assets/          icons and images
  components/      Astro components + a few React islands (.tsx)
  content/
    events/        one markdown file per event (title, date, location, description, image)
  data/            schedule data
  layouts/         page layout(s)
  lib/             hooks and shared utilities
  pages/           routes: index, about, events, schedule, gallery, donate, faq, legal, 404
  scripts/         client-side scripts
  styles/          global.css + tokens.css (design tokens — colors, spacing, type, radii)
```

## Getting started

```bash
npm install
npm run dev
```

| Command             | Action                                      |
| ------------------- | -------------------------------------------- |
| `npm run dev`        | Start the local dev server                   |
| `npm run build`       | Build for production                        |
| `npm run preview`      | Preview the production build locally         |
| `npm run typecheck`   | Run `astro check`                            |
| `npm run lint`         | Run Biome checks                             |
| `npm run lint:fix`      | Run Biome checks and auto-fix                |
| `npm run format`       | Format with Biome                            |
| `npm test`             | Run Vitest unit tests                        |

## Content

New events are added as a markdown file in `src/content/events`, with frontmatter for title,
category, status, date label, location, description, primary link, and image.

## Deployment

Deployed on Vercel. `.vercel/project.json` links this directory to the
`afton-gauntletts-projects/magic-festival` project; `.env.local` holds the local
`VERCEL_OIDC_TOKEN` (gitignored, regenerated via `vercel env pull`).

## Conventions

See [`CLAUDE.md`](CLAUDE.md) for repo conventions (design tokens, accessibility, testing policy,
commit workflow, etc.).
