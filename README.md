# Merge Discovery

Discovery-driven combination game, designed web-first/mobile-first with a later Android target.

## Status

**Phase 0 + Phase 1 + Phase 2 implemented:** technical scaffold, validated canonical seed, pure discovery engine and local application/save layer.

The browser page remains a diagnostic screen, now with IndexedDB save status and JSON import/export checks. Phase 3 is ready to replace it with the first playable Laboratory.

The current bounded implementation task is Phase 3 in `CODEX_TASK.md`.

## Run and verify

Use Node.js 22.12+ (22, 24 or 26+) and npm. CI uses Node 22.

```sh
npm ci
npm run dev
npm run typecheck
npm run lint
npm test
npm run validate:content
npm run simulate:content
npm run build
npm run preview
```

`npm run check` runs typecheck, lint, all domain/content/component tests and the validated production build. Build runs both validators before bundling. `npm run test:watch` is available during development.

## Phase 0 + 1 architecture

- `src/domain/`: plain TypeScript models, unordered PairKey, indexed deterministic resolver, requirement evaluation, event projection, XP/reveal/completion foundations, visibility projections and fixed-point reachability. No browser, React, storage, clock or randomness.
- `src/content/data/`: reviewable canonical JSON, including all 67 elements, 64 recipes, 6 Sets, 4 Collections, reveal paths and the unresolved lunar anomaly. `src/content/localization/it.json` holds Italian labels and placeholder descriptions.
- `src/content/schemas/`, `validate.ts`, `indexes/`: strict Zod parsing, semantic/reference/localization/ambiguity validation and startup indexes. Domain receives an index; it never imports bundled content.
- `src/application/diagnostics.ts`: minimal composition root for boot validation; no save or combine transaction implementation.
- `src/app/`, `src/ui/`, `src/styles/`: React diagnostic screen and CSS token foundation. Recipe knowledge stays out of components; the screen exposes no hidden-content totals.
- `src/persistence/`, `src/platform/`: reserved in Phase 0 + 1; Phase 2 persistence is described below, platform integrations remain deferred.
- `scripts/`: executable content validation and deterministic simulation with intermediate checkpoints, blocked unlock diagnostics and non-secret required-path audit.
- `tests/`: resolver, visibility, completion, invalid authoring, locked Markdown-to-JSON transcription and diagnostic boot/failure tests.
- `.github/workflows/ci.yml`: clean install and complete check on pushes/PRs.

Explicit recipes win over tag rules. Gated recipes use authored behavior/fallback; standalone anomalies need no current result. Positive requirements are ANDed and may overlap, so validation conservatively requires unique priorities for overlapping explicit variants. Tag-rule ambiguity is checked against every concrete unordered pair, including A+A. Indexes are built once at startup, never authored separately from source content.

See [Phase 0 + 1 implementation notes](docs/PHASE_0_1_NOTES.md) for schema details, scope and verification evidence.

## Phase 2 persistence

`src/application/save/SaveApplication.ts` coordinates load/new game, combine, migrations, reconciliation, import preview/confirmation, export and explicit recovery. `src/domain/model/save.ts` and `saveSchema.ts` define/strictly validate durable v1 facts independently of content version. `src/persistence/` provides memory and Dexie/IndexedDB adapters with one atomic current/backup row and revision conflict checks.

The diagnostic JSON field shows an export of owned progress only. “Verifica import” previews without writing; “Conferma sostituzione del progresso” commits explicitly. The export/round-trip check also does not overwrite. Corruption offers original-data export and previous-backup recovery, never an automatic reset. No combine UI is implemented.

Tests include the actual Dexie adapter under fake-indexeddb, atomic rollback, compatibility fixtures and confirmed import. Existing commands and the CI gate also run these Phase 2 tests.

See [Phase 2 implementation notes](docs/PHASE_2_NOTES.md) for migration, quarantine, backup and concurrency contracts.

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
