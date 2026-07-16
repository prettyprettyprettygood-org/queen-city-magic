# PRD 12 — Production Readiness: Invisible Quality Pass

## Summary

Prepare the current static site for production without changing its visible design, content,
layout, motion character, or interaction model. This is an engineering-hardening pass: remove
dead code, prevent client-navigation leaks, consolidate reusable primitives, preserve the CSS
token system, improve WCAG conformance, and add small high-value tests.

The current implementation is in good shape: `npm run typecheck`, `npm run lint`, and
`npm run build` all pass; Astro is producing a static build for 10 routes; images are going
through Astro's image pipeline; and reduced-motion handling already exists in the major canvas
and hero animation paths. Work in this PRD should preserve that state and should not introduce a
visual redesign.

## Goals

- Keep the existing UI visually and behaviorally unchanged for users who do not need the fix.
- Make all client-side behavior safe across Astro client-side navigations.
- Ensure motion is paused or replaced with a static equivalent under `prefers-reduced-motion`.
- Reduce unnecessary main-thread, canvas, paint, and event-listener work.
- Use shared components and semantic CSS tokens instead of repeated one-off values.
- Establish a small automated regression suite for pure logic and critical interaction contracts.
- Make keyboard, focus, dialog, navigation, and screen-reader behavior production-ready.

## Non-goals / constraints

- Do not redesign the site, change copy, alter the current visual language, or remove existing
  decorative effects solely because they are decorative.
- Do not replace the Astro/React architecture or add a large testing framework for broad coverage.
- Do not add analytics, consent tooling, payment handling, or new third-party scripts.
- Do not optimize by removing content, image subjects, or currently supported themes.
- Any change that could be perceived as a UI change requires an explicit review note and visual
  comparison before merge.

## Findings from the code review

### P0 — fix before production

1. **Animation instances are not consistently destroyed on client navigation.**
   `ParticleField.astro` constructs `ParticleField` instances but does not retain and call
   `destroy()`. Each instance registers `resize`, `mousemove`, `mouseleave`, and theme observer
   work and can keep an animation loop alive after its canvas is removed. The same lifecycle
   review should cover the rAF/timeout work in `HandwritingReveal.astro` and `EventCountdown.astro`.
   The site is static, but `ClientRouter` makes this a real same-session leak risk.

2. **Gallery initialization is not page-load safe.**
   `Gallery.astro` queries and wires the gallery once at script evaluation time, while other
   components explicitly re-initialize on `astro:page-load`. Navigating to `/gallery` through the
   client router after another page can leave the gallery buttons unwired. Make initialization
   idempotent and run it on `astro:page-load`; clean up or use delegated listeners as appropriate.

3. **The long-running animation budget needs an explicit policy.**
   The page can combine the fixed `Starfield` loop, `FeaturedCardGlow`, one or more scoped
   `ParticleField` loops, CSS sparkle motes, hero reveal rAF work, and audio fade rAF work. These
   effects are individually reasonable, but their combined cost is not currently measured or
   centrally bounded. At minimum, pause nonessential loops when their element is offscreen or
   the document is hidden, and avoid multiple concurrent loops for the same field.

### P1 — high-value hardening

4. **Dead or unreferenced hook.**
   `src/lib/hooks/useHoverCapable.ts` has no current consumer. Confirm it is not planned for an
   imminent interaction; if not, remove it. Do not remove `useReducedMotion`, which is actively
   used by the canvas components.

5. **Repeated shadow token gap.**
   The panel shadow `0 8px 24px rgba(0, 0, 0, 0.35)` is duplicated in `Card.astro`,
   `ThemeSelect.astro`, and `Navbar.astro`. Add a semantic token such as `--shadow-panel` in
   `tokens.css` and reference it in all three. Preserve the resulting appearance exactly.
   Review `FeaturedCardGlow.tsx` and `particleField.ts` fallback colors as implementation
   fallbacks; prefer a token-backed fallback or a documented reason when a CSS token cannot be
   read yet.

6. **Large components should be split by responsibility, not arbitrarily.**
   `Navbar.astro` (~476 lines), `Gallery.astro` (~459), `Footer.astro` (~330), and `Card.astro`
   (~341) exceed the repository's stated component-size guideline. Recommended splits:

   - Navbar: desktop/mobile link list, theme/audio controls, and scroll/menu behavior.
   - Gallery: photo data/grid, lightbox markup, and lightbox controller.
   - Footer: footer navigation/identity block and back-to-top behavior.
   - Card: structural slots, sparkle mote presentation, and featured glow mounting.

   Keep the public component APIs and rendered markup stable where possible. A split is not a
   goal by itself; stop when each extracted unit has one clear responsibility.

7. **Reusable component audit.**
   Preserve and extend the existing `Button`, `Card`, `Section`, `Divider`, `PageHeader`, and
   `SectionHeader` primitives. Before adding any markup, search for page-local equivalents.
   Move only genuinely shared styles/behavior into components; do not create abstraction layers
   for one-off content.

### P1 — WCAG and keyboard behavior

8. **Run a complete keyboard and screen-reader pass.**
   Cover Home, Events, Schedule, About, FAQ, Gallery, Donate, Legal, Attributions, and 404.
   Verify skip-link behavior, visible focus, logical tab order, mobile menu disclosure,
   theme selector radio behavior, sound toggle state, FAQ/details controls, gallery dialog focus
   return, Escape dismissal, previous/next controls, and back-to-top behavior.

9. **Strengthen the gallery dialog contract.**
   The native `dialog` is a good base and focus is returned to the opener, but tests should verify
   Escape/close behavior and focus restoration after client navigation. Add an explicit accessible
   name/state where native browser behavior is not consistent, without changing the visual UI.

10. **Confirm all interactive icon-only controls remain labelled.**
    Keep decorative icons `aria-hidden`; ensure labels describe the action rather than the icon.
    Verify dynamic labels such as the mobile menu's open/closed state and countdown's live label.
    Avoid adding redundant ARIA where native HTML already provides the behavior.

11. **Validate contrast and non-color affordances.**
    Use axe or an equivalent automated scan plus manual checks for all four themes, hover/focus
    states, muted text, links, borders, and the countdown. Preserve existing underlines and
    visible focus treatments; token changes must be contrast-tested across themes.

### P1 — motion and performance

12. **Make reduced motion reactive and complete.**
    Existing React hooks react to media-query changes, but several Astro scripts snapshot
    `matchMedia(...).matches` once. Consolidate or document a small shared media-query utility so
    a visitor switching the OS setting during a session stops/starts animation consistently.
    Under reduced motion, no continuous rAF loop, cursor tracking listener, CSS infinite sparkle,
    or hero bounce should remain active.

13. **Use visibility/intersection gating for ambient effects.**
    Keep the fixed starfield behavior if it is part of the visual identity, but pause it when the
    document is hidden. Gate below-the-fold featured glow and scoped particle canvases with
    `IntersectionObserver` where this does not change their first visible frame. Continue using
    transform/opacity/filter-only animation properties.

14. **Protect LCP and below-the-fold loading.**
    Confirm the hero castle image is the only intended above-the-fold priority image, with stable
    dimensions and no unnecessary lazy loading. Add `loading="lazy"` to the below-the-fold Vimeo
    iframe. Verify gallery images remain lazy and retain width/height or aspect-ratio to avoid CLS.
    Do not preload more fonts than the first viewport needs; measure before changing the current
    font preload choices.

15. **Measure, then tune.**
    Capture a production-like Lighthouse/Performance trace for mobile and desktop and record LCP,
    CLS, INP/TBT, transfer size, long tasks, animation frame cost, and number of active rAF loops.
    The target is no regression in the current visual experience and no persistent offscreen
    animation work. Prefer evidence-backed changes over arbitrary particle-count reductions.

### P2 — tests and delivery hygiene

16. **Add a minimal test runner.**
    There is currently no test script or test file. Add Vitest only if it can run cleanly with the
    existing TypeScript setup, then test pure logic rather than snapshotting the entire UI:

    - event date bucketing and timezone/DST/midnight boundaries;
    - countdown date math and completion behavior;
    - nav link/current-path mapping;
    - reduced-motion utility behavior where practical.

    Add a small browser-level smoke suite only for high-risk contracts if needed: keyboard gallery
    open/close/focus return, mobile menu keyboard use, and reduced-motion animation suppression.
    Keep it separate from the unit suite and avoid broad visual snapshots.

17. **Add production checks to CI.**
    Run `npm run typecheck`, `npm run lint`, `npm run build`, the unit tests, and dependency audit
    in CI. Keep the lockfile committed. Add an accessibility scan and a performance budget check
    when the hosting/CI environment supports them reliably.

## Implementation order

1. Add lifecycle-safe, idempotent initialization for Gallery, ParticleField, HandwritingReveal,
   and EventCountdown; verify Astro client navigation.
2. Add/normalize `--shadow-panel` and remove the unused `useHoverCapable` hook if confirmed dead.
3. Add reactive reduced-motion handling and visibility gating without changing the default visual
   motion.
4. Apply the small iframe/LCP/CLS prerequisites and measure the result.
5. Split long files only where the extracted responsibility is clear; preserve component APIs.
6. Add unit tests, then focused keyboard/accessibility smoke tests.
7. Run the full checks across all routes and all themes; review a visual diff before merge.

## Acceptance criteria

- Existing pages, copy, themes, layout, and default animation appearance are unchanged.
- No removed DOM element or interaction is required to complete the current user journeys.
- Client-side navigation does not accumulate event listeners, observers, timeouts, or rAF loops.
- Gallery works when reached by direct load and Astro client navigation; focus returns correctly.
- `prefers-reduced-motion: reduce` disables continuous decorative motion and cursor tracking, both
  on first load and after a live media-query change.
- All visible controls are keyboard reachable with a visible focus state and a logical order.
- Automated accessibility checks have no newly introduced serious/critical issues.
- Repeated panel shadows resolve through a CSS token; new shared styles do not introduce raw
  colors where a semantic token exists.
- `npm run typecheck`, `npm run lint`, `npm run build`, and the new tests pass.
- A production-like performance trace records no unexplained long-task or LCP regression.

## Open decisions

- Confirm the production canonical domain before changing the currently configured site URL.
- Confirm whether CI can support browser accessibility/performance checks without making deploys
  flaky.
- Confirm whether `useHoverCapable` is intentionally reserved for a near-term feature; default is
  to delete it because it has no current consumer.

## Verification checklist

- [ ] Direct-load every route.
- [ ] Navigate between every route using the client router.
- [ ] Test keyboard-only flows at mobile and desktop breakpoints.
- [ ] Test reduced motion enabled, disabled, and toggled during a session.
- [ ] Test all available theme choices and high-contrast browser settings.
- [ ] Test hidden tab/background behavior and return to the tab.
- [ ] Test slow mobile network and a cold cache for hero LCP.
- [ ] Run typecheck, lint, build, unit tests, accessibility scan, and performance trace.
- [ ] Review visual diff and confirm no intentional UI change slipped in.
