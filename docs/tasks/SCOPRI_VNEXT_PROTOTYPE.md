# SCOPRI VNext — Codex bounded vertical slice

Status: **task ready for a dedicated new draft PR**. Independent of the current PR #18 Island proof.

## Starting state / branching

- Latest `main` includes Phases 0–7 and merged Isolario Foundation #17.
- PR #18 (Island proof) is **open/draft** and may be worked on independently. Do **not** base this Scopri work on #18, or modify its branch/PR.
- PR #13/#16 FreeTable are **unapproved experiments**. Reuse *small verified source helpers* if useful (replay classification, alias search, pointer handling) with provenance; do not cherry-pick whole feature/layout/branch.
- PR #14/#15 importer/Studio and #12 proposals stay untouched.
- New branch `codex/scopri-vnext` from refreshed `main`. Separate **draft PR**, base `main`, title `Scopri VNext: free discovery playground`.
- If `main` advances while working, bring changes forward safely and re-run regressions. No force push or auto merge.

## Required reading

1. `AGENTS.md`.
2. `docs/DISCOVERY_FIRST_WORLD_ATLAS.md`.
3. **`docs/SCOPRI_DISCOVERY_CORE_VNEXT.md`**.
4. **`docs/SCOPRI_ELEMENT_ART_PIPELINE.md`**.
5. `docs/tasks/PLAYFEEL_V3.md` for recorded rejected behavior (not automatic authorization to use its UI).
6. `docs/VISUAL_BIBLE_REFERENCE.md`, `docs/VISUAL_UX_ALIGNMENT.md`, `docs/DESIGN_SYSTEM.md`.
7. `docs/RESOLUTION_ENGINE.md`, `docs/UX_SCREEN_ARCHITECTURE.md`, `docs/SAVE_AND_VERSIONING.md`, `docs/HINTS_AND_FAILURE.md`, `docs/ACCESSIBILITY.md`, `docs/RESPONSIVE_AND_UI_STATES.md`, `docs/MOTION_AUDIO.md`.
8. Inspect main app shell/lab and relevant prior PR #13/#16 implementation before choosing what to extract.

## Purpose

Rebuild **`/` as Scopri**, a fluid illustrated-element free canvas, not a form and not an island.

A human player should enjoy repeated experiments for at least 10 minutes without the interface getting in the way.

The **single canonical resolver/SaveApplication** remains the source of truth. Do not change the 67 canonical elements/recipes, PlayerSave schema, XP, visibility, gates or new WorldState/WorldRepository.

### Phase A — experience + interaction (this PR)

1. Main route `/` labelled **Scopri**; old two-slot Laboratory retained behind a clearly secondary `Laboratorio classico` switch/route for accessibility and regression. No automatic switch from Scopri to the Island.
2. Desktop full-size free canvas with minimal chrome; 75–85% of usable content width dedicated to canvas, supporting library 220–260px adaptive, vertical dense art+name rows. Search sticky, recent/favorite access, contextual options compact.
3. Mobile visible canvas first, fixed/overlay library drawer or bottom sheet that does **not shrink/reposition** canvas and permits adding/dragging repeatedly; keep query/search state. Compact recent shelf.
4. Real drag library→empty create copy; library→figure attempt in one gesture; canvas figure→empty move and remain; canvas figure→figure attempt. Failed result leaves both figures close to drop, separated enough to continue dragging, never origin snap-back.
5. Success replaces only two visual copies in situ, result available immediately. Known replay creates visual result without XP/write. New alternative creates valid SaveApplication event/reward. No-reaction/anomaly/stale retry remain safe. A+A via duplicate.
6. Double click duplicates. Mobile provides visible accessible `Duplica` alternative. Keyboard can select pair, combine, move and remove without drag.
7. Collision/success/failure/anomaly/hidden-set motion tiers nonblocking, sound opt-in and reduced motion safe.
8. Canvas copies + coordinates are presentation state. Preserve during navigation to `Mondo`/`Atlante` and back **within current browser session** when these links exist; never award XP for position. Avoid save-schema change. Use a bounded table presentation store if route remounts.
9. Search accent/case insensitive on owned-only DTO and visible aliases, Set, favorites/recent. `Con piste` and `Esauriti per ora` use existing safe selector; no future data leaks. Virtualize/compact list for 1000+ definitions; no global pair matrix.
10. Distinct feedback `Nuovo elemento` / `Nuova ricetta` / known replay / anomaly / failed. New element should join library immediately without reset or frustrating scroll. Result appears near merge, never big mandatory popup.
11. Maintain coherent dark navy/gold visuals. Use current ElementArt fallback initially and verify the art contract; do not claim it is final painterly art. UI must accommodate transparent illustrated sprites from Phase B later.
12. No speculative feature/XP additions, no new "Fire" canonical element, no Canva/Figma/backend or special Android code.

### Phase B — visual pilot, **separate later PR / design approval**

The asset pilot is defined by `docs/SCOPRI_ELEMENT_ART_PIPELINE.md`: 12 confirmed artKeys including `void`, `energy`, `matter`, `time`, `light`, `heat`, `water`, `lava`, `rock`, `steam`, `tree`, `creature`.

**Do not make up 12 final production artworks in Phase A.** Phase A should only expose a reusable `artKey → rendition` adapter with fallback, layout/styling and a low-effort representative preview showing exact render bounds. Keep a separate planned art PR `codex/scopri-art-pilot` after visual/master approval.

If asset-generation tooling/approved master is not accessible in Codex, state it as a production blocker and do not substitute 12 random SVG glyphs while calling them approved art.

## Automated acceptance

- Unit/application: all old resolver/save tests green; recipe alternatives, same result/multiple recipes, known replay no XP and no save write, stale failure reopening, revisitable anomaly, A+A.
- Real browser drag E2E desktop mouse and emulated touch, including library→occupied, canvas→occupied, empty movement, failure stays near drop, pointercancel not confused with failure, edge placement without 16–84% clamp.
- Search/filter/scroll retains state and no hidden-data leakage; mobile dock never reflows canvas rect or objects; 200% text, large keyboard/search and reduced-motion accessible.
- 30 consecutive attempts with at least one fresh save progression path and an advanced save fixture; don't claim automated test proves fun.
- Demonstrate `Mondo` route still separate and old Lab remains usable; no extra XP/unlocks from visiting Mondo.
- Offline PWA registration/cache/update-safe, IndexDB reload and backup regression.
- 1000-definition synthetic library perf; visible row count 10–14 at 1440×900 when progressed.
- 320×568, 390×844, 768×1024, 1024×768, 1440×900, 1920×1080, landscape and 200% zoom.
- Report seed **67/67** and max dependency depth **11** unchanged.
- Screenshots 1440×900 with advanced library, 390×844 with canvas+collapsed dock, 390×844 drawer overlay, 320×568; one failed reaction and one new discovery frame; video of 8+ actual chained interactions.

## Human acceptance

Require **10–15 min real desktop and smartphone game-feel playtest**. Report number of interactions, friction points, search burden and whether user wants to continue playing.

The PR remains draft regardless of green CI until user approves the interaction.

## Delivery

Deliver a single bounded draft PR for Phase A, with:
- architecture and selective provenance;
- changed components and route behavior;
- pointer/drop semantic explanation;
- elements drawn vs fallback vs pilot-art status;
- test evidence and concrete screenshots/video;
- bundle/performance effect;
- explicit no-change to world/atlas canonical truth;
- art pilot follow-up proposal.

Do not merge or create Phase B art PR without a master/style approval checkpoint.
