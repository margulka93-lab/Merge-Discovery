# Phase 7.5C — Observatory exploration + cross-screen polish

Status: **implementation on stacked draft branch; screenshot approval required**

## Required reading
`AGENTS.md`, `CODEX_LONG_RUN.md`, original poster attached to Codex, Phase 7.5A/B notes, `docs/VISUAL_UX_ALIGNMENT.md`, `docs/SCREEN_SPECS.md`, `docs/ACCESSIBILITY.md`, `docs/MOTION_AUDIO.md`, `docs/RESPONSIVE_AND_UI_STATES.md`.

## Goal
Finish the shared dark navy/gold visual system and remove discontinuities across the product before content expansion.

## Scope
- /explore/map: richer constellation canvas, strong central selected specimen, visible authored recipe junctions and observed anomaly motif; preserve safe local graph and accessible relationship list.
- /explore/anomalies: illustrated paired-input phenomenon panels, restrained violet sigil/status and retry; no future result or resolution spoiler.
- /settings: visually coherent grouping of information, accessibility, sound, update and advanced local-data controls. No new settings semantics.
- All screens: unified visual token use, typography, orbital decorations, focus and chips, progress hierarchy, icon consistency, attention/empty/loading/error states.
- Cross-screen screenshots and visual comparison with original poster, including mobile and 320px; do not sacrifice density/readability.
- Preserve Phase 7 update-safe reveal acknowledgement and motion-tier hierarchy including reduced motion; preserve offline caching and lazy routes.
- Revalidate route-disclosure, search, hint safe candidate DTOs and visual accessibility after shared component refactors.

## Hard boundaries
No new features, recipes, hints Tier 4/5, source-of-truth rewrites, PWA semantics changes, backend or Capacitor. No ivory catalog default.

## Evidence
Production screenshots 1440 Map, Anomaly Archive, Settings; 390 Map, Anomaly, Settings; 320 selected Explore screen; representative dark Lab and Catalog side-by-side. Regression unit/E2E/production/PWA, axe/keyboard/forced-colors/reduced-motion.

## Done
Visual cohesion is demonstrable in screenshots and reviewed by user. Draft stacked PR to 7.5B; do not merge.
