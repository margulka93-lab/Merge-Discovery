# Phase 7.5B — Dark knowledge screens

Status: draft stacked implementation; **human visual approval pending**. Parent is unmerged, visually unapproved PR #9 (`codex/phase-7-5a`). This branch merges current `main` specifications without replacing the parent's source changes. It must not be merged into `main` before its parent and this design are reviewed.

## Original reference inspected

The original poster became available on `main` in commit `4fd1dc9`, as `Bibbia di Design Merge Discovery.png`. It was opened and visually inspected, then copied byte-for-byte to [the project reference](references/merge-discovery-design-bible-original.png).

The actual **Catalogo — Elemento** panel is midnight navy: framed specimen, warm name, small rarity/Set chips, restrained thin rules, known recipe rows and an `Usato per` area. The light model/architecture diagrams at the bottom are documentation, not gameplay. The illustrated era plates inform the Set chapter treatment. Poster numbers, unknown placeholders, future fantasy examples and hint levels do not override canonical gameplay/spoiler rules.

Required reading: AGENTS, CODEX_TASK, CODEX_LONG_RUN, VISUAL_UX_ALIGNMENT, VISUAL_BIBLE_REFERENCE, SCREEN_SPECS, CATALOG_AND_DISCOVERY_GRAPH, RESPONSIVE_AND_UI_STATES, ACCESSIBILITY and parent PHASE_7_5A_NOTES. Architecture and validation guidance were also read.

## Implementation

- Collection Home is reordered as recent-specimen shelf, prominent illustrated Set plates, safe new possibilities, thematic Collections, compact favorites and searchable owned discoveries. No new global denominator.
- Set index/detail use distinct local SVG domain studies, quiet completion and an atmospheric chapter opening. Hidden Sets have no reserved positions.
- Element Detail uses a large framed illustration, editorial display name/chips and a separate reading column for description, first discovery, known recipes, relationships and experiments. Known recipe rows carry decorative art with the complete A+B→result text/links.
- Thematic Collections use only owned member imagery and bookmark-like green accents; anonymous missing positions remain sourced from the unchanged safe projection.
- `KnowledgeNavigation` receives existing disclosure booleans. Panoramica / Set / Collezioni links do not invent route availability. Routes and lazy feature boundaries remain unchanged.
- `knowledge.css` scopes a coherent navy/brass treatment to the existing shell, with higher specificity than late-loaded legacy styles. Local/system fonts, static decoration, responsive shelves, 320px flow, forced colors and high contrast remain supported. No remote assets or final illustration batch.

Canonical content, domain, resolver, application projections, save schema, visibility, XP, unlock/hint semantics and PWA/update behavior have no changes. Laboratory, Map, Anomalies and Settings are not redesigned in this stage.

## Evidence and commands

Five desktop BEFORE captures are under `screenshots/phase-7-5b/before`, taken from the parent production build. Historic Phase 4/5 screenshots supply the other baseline references. AFTER evidence is generated from the completed production build under `screenshots/phase-7-5b/after`: 1440 Collection Home, Set index/detail, Element Detail, thematic Collection and Collections index; 390 Home/Element/Set Detail; 320 Home.

The new production test uses the existing fully progressed save through the normal strict import flow. It checks all six knowledge routes at 320/390/768/1024/1440/1920, axe WCAG 2.2 AA and horizontal overflow. Full previous production coverage additionally checks offline, update safety, touch targets, extra-large text, forced colors, OS/saved reduced motion and equivalent 200% zoom reflow. Manual screen-reader/device testing remains NOT RUN.

```sh
npm ci
npm run dev
npm run check
npm run validate:pwa
npm run profile:catalog
npm run profile:map
npm run test:e2e
npm run test:production
```

The baseline keyboard route test exposed a timing race: the Set link already existed on Collection Home while the new route was committing. It now waits for the new heading and normal focus handoff before pressing Enter. A 200% text overflow in thematic member miniatures was corrected; dark style precedence was made independent of lazy-load order. Neither fix changes gameplay.

Final results and screenshot inventory are recorded in `evidence/phase-7-5b/verification.json` after all gates complete. Passing those gates is **not** visual approval.
