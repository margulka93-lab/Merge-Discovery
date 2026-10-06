# Merge Discovery

Discovery-driven combination game, designed web-first/mobile-first with a later Android target.

## Status

**Pre-production complete enough for Codex Phase 0 + Phase 1.**

No gameplay implementation has started yet.

The first bounded implementation task is in `CODEX_TASK.md`.

## Core fantasy

Begin with:

- Vuoto
- Energia
- Materia
- Tempo

Combine reusable concepts to discover an expanding universe:

Cosmo → Mondo → Vita → Umanità → Arcano → Invisibile → Impossibile.

The reward is discovering **relationships**, not upgrading identical items.

## Pillars

1. Discovery
2. Collection
3. Progression
4. Mystery
5. Scalable curated expansion

## Key rules

- two-input core experiment;
- A+B equals B+A;
- authored A+A recipes supported;
- elements are infinitely reusable;
- no stamina;
- no repeat-recipe XP farming;
- hidden content does not leak through denominators/search/graph;
- failed pairs are remembered;
- anomalies can pay off much later;
- canonical recipes are curated data;
- local-first/offline-capable;
- responsive web UI, later Android without gameplay fork.

## Canonical implementation docs

### Product/game design

- `docs/GAME_VISION.md`
- `docs/DECISIONS.md`
- `docs/TAXONOMY.md`
- `docs/SETS_AND_PROGRESSION.md`
- `docs/PROGRESSION_SYSTEM.md`
- `docs/HINTS_AND_FAILURE.md`
- `docs/CATALOG_AND_DISCOVERY_GRAPH.md`
- `docs/COLLECTIONS_AND_OBJECTIVES.md`
- `docs/META_ENDGAME.md`

### Content

- `docs/IMPLEMENTATION_SEED_CONTENT.md`
- `docs/LIFE_PLANTS_FUNGI_ANIMALS.md`
- `docs/HUMANITY_CULTURE_TECHNOLOGY.md`
- `docs/HUMANITY_ELEMENT_SELECTION.md`
- `docs/ARCANE_TRANSITION.md`
- `docs/CONTENT_ROADMAP.md`

### UX / art

- `docs/FIRST_SESSION_EXPERIENCE.md`
- `docs/UX_SCREEN_ARCHITECTURE.md`
- `docs/SCREEN_SPECS.md`
- `docs/RESPONSIVE_AND_UI_STATES.md`
- `docs/VISUAL_DIRECTION.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/MOTION_AUDIO.md`
- `docs/ACCESSIBILITY.md`
- `docs/COPY_AND_LOCALIZATION.md`

### Technical / quality

- `docs/DATA_MODEL.md`
- `docs/RESOLUTION_ENGINE.md`
- `docs/SAVE_AND_VERSIONING.md`
- `docs/VALIDATION_AND_TESTING.md`
- `docs/TECH_SPEC.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/PRE_CODEX_AUDIT.md`
- `docs/DESIGN_STATUS.md`
- `docs/OPEN_QUESTIONS.md`

### Codex

- `AGENTS.md`
- `CODEX_TASK.md`

## Canonical seed

The first implementation uses a locked **67-element** dataset.

Design-time reachability audit:

- 67/67 reachable;
- max dependency depth 11;
- includes A+A, alternate recipe, hidden Set and unresolved anomaly.

Codex must reproduce this result using the automated validator.

## Rule for implementation

Codex implements the specifications.

If implementation discovers a genuine design contradiction, it should surface the conflict rather than invent new gameplay.
