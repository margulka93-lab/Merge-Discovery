# Phase 7.5B — Dark knowledge screens

Status: **implementation on stacked draft branch; screenshot approval required**

## Required reading
`AGENTS.md`, `CODEX_LONG_RUN.md`, `docs/VISUAL_UX_ALIGNMENT.md`, `docs/VISUAL_BIBLE_REFERENCE.md`, `docs/SCREEN_SPECS.md`, `docs/CATALOG_AND_DISCOVERY_GRAPH.md`, `docs/RESPONSIVE_AND_UI_STATES.md`, `docs/ACCESSIBILITY.md`, `docs/PHASE_7_5A_NOTES.md` from parent branch.

Use the original Design Bible image supplied with the Codex invocation, particularly its **dark Catalogo — Elemento** panel. Do NOT interpret the light technical documentation panels as in-game UI.

## Goal
Redesign the knowledge-family UI to match 7.5A and the original dark navy/gold concept, while preserving every existing gameplay/visibility projection.

## Scope
- /collection editorial atlas landing page: strong recent discoveries, Sets as prominent illustrated domain plates, safe new-possibilities shelf, thematic Collections, compact favorites.
- /sets Set index: illustrated chapter/domain plates with quiet completion, no hidden slots.
- /sets/:setId: dark illustrated chapter header, Set motif, readable grid, useful demoted filters.
- /elements/:elementId: dark illustrated detail, hero art/name/Set/rarity, actual discovery recipe, known recipes as A+B→result, safe possibilities/relationships/experiment history. Desktop editorial two-column and mobile natural reading flow.
- /collections and /collections/:collectionId: curated thematic presentation distinct from Sets, legitimate anonymous unknown-member slots only.
- Knowledge-family subnavigation Panoramica / Set / Collezioni with disclosure-aware routing.
- Reuse established 7.5A cards, art, dark tokens and navigation. Add shared dark field-guide visual primitives rather than duplicating cards.
- Correct responsive hierarchy, 320/390/768/1024/1440/1920 and 200% zoom, keyboard, axe.
- Stronger visually meaningful placeholders, but no final bespoke 67-art batch.

## Hard boundaries
No light ivory/cream page default. No unrelated redesign of Lab/Map/Anomalies/Settings. No modification to elements, recipes, XP, resolver, save, route guards, spoiler boundary, hint semantics, service-worker lifecycle.

## Evidence
Before/after and production AFTER screenshots: 1440 Collection Home, Set index, Set Detail, Element Detail, thematic Collection; 390 Collection Home/Element Detail/Set Detail; 320 Collection Home. Tests: full prior suites plus safe route/deep-link/contrast/overflow/keyboard, PWA offline.

## Done
The product reads as one elegant dark illustrated game, NOT a metrics dashboard. CI green is not visual approval. Open one stacked **draft** PR to 7.5A, do not merge.
