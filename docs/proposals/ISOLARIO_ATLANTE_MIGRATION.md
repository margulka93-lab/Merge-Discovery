# ISOLARIO + ATLANTE VIVENTE — Concept migration (draft architecture)

Status: **New concept direction selected; no implementation or canon changes authorized by this document.**
Decision date: 2026-10-09.
This supersedes Tavolo libero as the intended primary product experience but does NOT discard the resolver, save, content or authoring architecture.

## North star

An interactive, painterly, cozy-modern-magical world grows from the player's discoveries.
An **Atlante Vivente** automatically records everything discovered, places/phenomena created, known recipes, observations and the history of the world.

The player should feel they are **growing a world**, not just clicking through an inventory of recipe pairs or idly watching a screensaver.

Visual: isometric / 2.5D small island diorama with elegant limited controls; optional celestial backgrounds, shifting nature, weather and inhabited habitats. Atlas: richly illustrated book/field guide, reflecting the actual world's development. Do not simply reuse the old Laboratory screenshot with an island as a backdrop.

## Core loop / agency

1. **Explore** the current fragment/island and notice what is missing or can react.
2. **Experiment** using already-owned essences/elements and the same deterministic A+B resolver, possibly by acting on an island object or selecting two essences in a small contextual tray.
3. **Discover** a real canonical element (or a recipe/anomaly) through the existing SaveApplication; never grant discoveries merely for placing artwork.
4. **Manifest / cultivate** what can exist in the world. Some discovered items unlock a relevant action; the player chooses a location/area or selects a suggested valid spot, triggering a world transformation.
5. **Observe** local visual consequences, new habitats/occupants/phenomena and possible contextual leads for the next experiments.
6. **Document** automatically in the Atlas: definitions and recipes already owned, first discovery information, observed world changes, illustrations and safe thematic collections.
7. Repeat. No timers, stamina or background-only progression required.

An empty world does not automatically grow into a full world simply because a long recipe list was discovered. The player has meaningful but lightweight agency in where/when eligible things appear.

### Example (demonstration only; no new canonical recipes)

- Discover `light` through the existing `void + energy` recipe → may illuminate the sky or unlock a daybreak effect when applied to the sky.
- Discover `water` through an existing canonical pair → may place a spring or water pool on a valid terrain spot.
- Discover `soil`, `sprout`, `tree` → unlock fertile ground, shoots, grove manifestations in compatible areas.
- Discover `rain` / `wind` → animated weather/environmental states, not necessarily placed objects.
- Discover `creature` → an ambient inhabitant can appear in an eligible habitat; not a battle unit.
- `time`, `gravity`, `space` remain meaningful world forces/sky effects; not literal identical tiles.
- A new element may be **Atlas-only** when it makes no sense to manifest physically.

A demonstration with pre-owned content must remain a test fixture, not pretend the player discovered the content legitimately.

## World vs taxonomy

DO NOT map each canonical Set one-to-one to an island. The Sets (Origini/Cosmo/Mondo/Vita/...) categorize knowledge; the world is spatial, with terrain/habitats/sky/phenomena. The same element can contribute to multiple contextual world outcomes when authored.

World representation categories to prototype:
- Terrain / structures / biomes
- Water / weather / atmospheric effects
- Flora / fauna / ambient life
- Celestial / temporal / environmental changes
- Atlas-only knowledge (not individually placeable)

A simple optional **world manifest mapping** can describe `elementId → worldAction`, target type, prerequisites, variant/art key, animation, and visible placeability. It must be separately validated, spoiler-safe, and not require changing every canonical ElementDefinition.
Unmapped elements remain fully valid discoveries and Atlas entries.

## Reuse audit based on current repo

### Preserve without gameplay rewrite
- `src/domain/resolver` canonical pair resolution (including A+A, alternatives, anomalies);
- 67 canonical seed elements, recipes, tags, Sets, Collections, rarity and visibility;
- player progression/XP/unlocks and anti-spoiler selectors;
- `SaveApplication`, migration/reconciliation, IndexedDB, exports;
- current safe Element Detail / Atlas-like catalog projection;
- hints/possibility logic and anomaly archive as support systems;
- PWA offline/update architecture, localization and accessibility infrastructure;
- content validator and fixed-point simulator.

### Adapt / reskin rather than discard
- Collection/Catalog → living illustrated Atlas/knowledge chapters;
- Set/Collection views → Atlas taxonomy + thematic milestones;
- ElementArt/assetKey → imagery in Atlas and a separate set of world scene props;
- Map → optional map of archipelago/known relations; do not overload world screen;
- Laboratory/Tavolo libero → secondary optional mode or compact experimental gesture, not the home screen.

### Pending PRs: recover code selectively, do not auto-merge
- #9–11: shell/design work; adapt relevant shared pieces.
- #13/#16: experimental interactions; may reuse drag/pointer ideas, but **do not force an old FreeTable into the new game**.
- #14–15: valuable runtime ZIP content importer/Content Studio, but still draft/unmerged and stacked on old UX; plan selective extraction or controlled rebase rather than merging abandoned UI.
- #12: 51 candidate Phase 8A additions are pending canon; not prerequisite for prototype. Do not silently activate.

## New system boundaries

1. **World rules and projection:** deterministic selectors for valid world actions derived from `ContentIndex + player discovery snapshot + WorldState`; no logic in React.
2. **WorldState / WorldRepository:** separately versioned durable data for island unlock, placements, position, habitat/environment flags, reactions observed and presentation settings. PlayerSave remains canonical for discoveries/XP/known recipes. Avoid a sprawling mandatory migration to PlayerSave for the first prototype.
3. **WorldActionApplication:** validates placeability and prerequisites, commits a world mutation; do not award canonical discoveries independent of resolver. If a world gesture tests A+B, call the existing SaveApplication combine transaction.
4. **WorldRenderer:** separate visual scene layer (2.5D isometric or illustrated canvas) consuming safe world projection. Mobile/desktop share world logic; rendering can use canvas/SVG/DOM for the prototype. No required WebGL/3D engine.
5. **Atlas projection:** joins **already safe** discovered content + world observations + world placements. Hidden/secret data never leaks from world art, silhouettes, map pins, labels, counts or accessible names.
6. **Asset pipeline:** scene tiles/props/creatures/weather layers need consistent scale, pivots, depth ordering, hit areas and variants. Importer may be extended with world-asset bundles in a later bounded task. Existing element-art PNG/SVG alone does not provide complete isometric scene assets.

Idempotence: reloading/reconciling the existing save must never double-award XP or duplicate world effects. A world action must fail safely without corrupting PlayerSave. World changes and discoveries are separately committed unless a cross-store transaction is deliberately designed and tested.

## Prototype: one small island, one coherent 10-minute journey

**Do not make a full procedural game first.**

- One painterly/isometric island/diorama with a few meaningful zones (shore, dry basin, hill/forest patch, sky).
- 4 starter concepts and a **curated ~15–20-step existing canonical discovery path** to relevant terrain/weather/plants. Actual gameplay from fresh save must be possible; a progressed save fixture may separately showcase later manifestations.
- ~8–12 world actions/visual transformations, not 20 identical inventory icons spawned onto tiles. Some are weather/ambient states rather than objects.
- A visible island state changing from quiet/barren to inhabitable; at least one small creature/environmental response if unlocked via legitimate saved discovery.
- Atlas records meaningful discoveries and world observations in a small set of pages.
- A player can discover, manifest, observe and consult Atlas without leaving the world to open multiple dashboards.
- Clear optional contextual intent, not a forced tutorial or scripted autoclick sequence.
- Desktop mouse/keyboard and smartphone touch; landscape/portrait; 320px/390px; 200% zoom; reduced motion.
- Offline reload restores both discovered content and placed world; no hidden spoilers, no fake economy/timers.

### Acceptance / demo gates

- Human 10–15 minute playtest: easy to understand what to try and why the world reacts; visible satisfying consequences; no repetitive A+B click loop as sole activity.
- Verify at least 3 genuinely distinct action types (e.g. transform terrain, set weather, introduce living object).
- World remains navigable with reasonable device performance; no janky camera/pan, no touch vs scroll confusion.
- World features persist after reload, while canonical XP/discovery facts remain correct; test idempotence.
- Atlas records an action only when world state changed and knowledge was legitimately earned.
- Visual review of the actual scene (not a generic dashboard/placeholder tiles). Screenshots desktop/mobile + brief capture.
- All existing core tests remain green; 67/67 seed reachability unchanged.

## Suggested Codex sequence (separate branches/PRs)

0. **Architecture spike**: assess rendering library, data model and repo branch integration; produce ADR and interface sketches, no rewrite.
1. **World vertical slice**: scene, WorldState repository and projector, a handful of curated actions, SaveApplication bridge.
2. **Atlante vertical slice**: illustrated pages reflecting canonical knowledge AND observed world.
3. **Interaction & mobile playfeel**: element/action selection, scene feedback, accessibility and 10–15-minute playtest.
4. **Content/asset authoring integration**: adapt the existing #14/#15 importer to carry validated WorldAction mappings + scene assets while preserving old pack support.
5. **Content expansion and Android** only after prototype passes user playtest and content review.

### Branch protocol

Do not merge the existing UI redesign, FreeTable or 8A drafts merely because they are available. Preserve them for selective reuse and avoid branch-wide cherry-picks that drag obsolete UI.
Select a clean base at kickoff, documenting precisely which work from pending PRs will be reused and how. Require draft PRs and human visual/play approval before merge.

## Open questions for prototype checkpoint

- First scene visual perspective: 2.5D isometric painterly vs gentle angled top-down; test smartphone readability before locking.
- Agency model: player places eligible manifestations freely in compatible spots vs world reacts on context tap, with assist for mobile.
- First Atlas format: accessible full-page illustrated book vs compact overlay tied to the world.
- Rules for when a discovery becomes a world action and how many instances are allowed.
- How much autonomous ambience (creatures moving, weather transitions) without introducing mandatory idle gameplay.

No need to settle the entire late game to build and test the first island.
