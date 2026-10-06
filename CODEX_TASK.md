# CODEX_TASK.md — Phase 2

Do not begin Phase 3 or later work in this task.

## Goal

Implement the local-first application/save layer on top of the already-merged pure domain engine.

Phase 2 must make player progress durable, migratable and import/export capable without introducing the final playable Laboratory UI.

The domain engine must remain pure and platform-independent.

## Required reading

Read before changing code:

- `AGENTS.md`
- `docs/SAVE_AND_VERSIONING.md`
- `docs/DATA_MODEL.md`
- `docs/RESOLUTION_ENGINE.md`
- `docs/TECH_SPEC.md`
- `docs/VALIDATION_AND_TESTING.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/DECISIONS.md`
- `docs/IMPLEMENTATION_SEED_CONTENT.md`
- `docs/PHASE_0_1_NOTES.md`

Inspect the merged Phase 0 + 1 implementation before adding abstractions.

## Scope

### 1. Durable PlayerSave schema

Implement the durable save model specified in `DATA_MODEL.md`.

It must include, at minimum:

- `saveSchemaVersion`
- `contentVersionSeen`
- `createdAt`
- `updatedAt`
- XP
- discovered elements with first-discovery metadata
- discovered recipe IDs
- tested pairs with outcome/content version/timestamp
- observed/resolved anomalies with timestamps
- revealed/completed Sets
- completed Collection chapter IDs
- favorite element IDs
- player settings

Keep derived state out of the durable source of truth where the design says it should be recomputed.

### 2. Save schema validation

Add strict runtime validation for imported/persisted saves.

Invalid save structures must fail with typed/recoverable errors.

Do not allow malformed imported JSON to reach domain/application logic unchecked.

### 3. SaveRepository abstraction

Implement the persistence interface described in `SAVE_AND_VERSIONING.md`.

Required operations conceptually:

- load
- createNew
- persist
- export
- import
- clear

The exact TypeScript names may differ if the intent stays identical.

Provide:

- in-memory adapter for tests
- IndexedDB adapter for browser runtime

Preferred IndexedDB helper:
Dexie, as specified in `TECH_SPEC.md`.

Domain modules must not import Dexie/browser storage.

### 4. New-game creation

Creating a new save must:

- use the current save schema version
- record current content version
- populate starter discoveries consistently with the current seed
- initialize settings safely
- produce a valid PlayerSave

Do not duplicate canonical starter knowledge manually if it can be derived from validated content.

### 5. Application combine transaction

Implement an application-layer combine use case that:

1. receives two known element IDs;
2. projects durable save facts into the engine state required by the pure resolver;
3. calls the existing resolver;
4. converts domain events into the next durable PlayerSave;
5. validates the next save;
6. persists atomically;
7. returns the resolution plus updated application state.

Rules:

- animation/UI timing is irrelevant here;
- no partial durable writes;
- repeated recipe/failure/anomaly semantics remain exactly as Phase 1;
- timestamps belong to application/save projection, not domain engine.

### 6. Atomic persistence and backup

Implement the persistence strategy from `SAVE_AND_VERSIONING.md`.

Required behavior:

- current save snapshot
- one previous successful backup snapshot
- a failed write must not leave a half-updated save
- recovery path can load the previous valid backup

Do not implement unbounded save history.

### 7. Save schema migration framework

Implement sequential save-schema migrations.

Even if only schema v1 exists today, the framework must support sequential migration without UI code owning it.

Add at least one test-only/fixture migration case proving the pipeline works.

### 8. Content-version reconciliation

On load, compare `contentVersionSeen` against the current content package.

Required behavior:

- added elements need no destructive migration;
- added recipes can make old tested failures relevant again;
- stale no-reaction metadata must not incorrectly mark an element/pair as permanently exhausted;
- hidden/secret content still must not leak;
- derived state is recalculated from current content.

Implement a reconciliation result that can report safe application-level notices such as:

- new possibilities available
- content version updated

Do not auto-discover any new element.

### 9. Export / import

Implement save export/import according to `SAVE_AND_VERSIONING.md`.

Export:

- UTF-8 JSON
- product identifier
- schema version
- content version seen
- durable save payload

Import:

1. parse
2. validate
3. migrate
4. reconcile with current content
5. return preview/basic stats
6. require an explicit application confirmation step before overwrite
7. persist only after confirmation

The current UI may expose this through diagnostic/dev controls only if needed for testing.

Do not build final Settings UI.

### 10. Corruption / unknown optional ID handling

Implement the documented recovery behavior.

Where safe:

- preserve recognized progress
- quarantine/ignore unknown optional references
- do not reset the whole save automatically

If the entire save is invalid, surface a typed recovery failure rather than silently starting over.

### 11. Diagnostic integration

Replace/extend the existing diagnostic screen only enough to demonstrate:

- save created/loaded
- current schema/content version
- persistence adapter status
- export/import round-trip status or dev action
- no hidden content leakage

Do not turn this into the Phase 3 Laboratory.

## Required automated tests

Add tests proving at least:

### Save basics

- new save validates
- starter state is correct
- save/load round trip preserves durable state
- in-memory adapter obeys repository contract
- IndexedDB adapter works under the chosen test strategy

### Combine transaction

- successful discovery persists all related durable facts
- alternate recipe persists recipe discovery and correct XP
- repeated recipe does not farm XP
- no-reaction tested pair is persisted with current content version
- first anomaly observation persists once
- repeating the anomaly gives no extra XP
- Set reveal/completion events persist consistently

### Atomicity / backup

- failed persistence does not expose a partially committed save
- previous valid snapshot can be recovered

### Migration

- fixture from an older test schema version migrates sequentially to current
- migration failure is typed and non-destructive

### Content reconciliation

Create a test fixture representing an older content version where a pair was stored as `no_reaction`, then load against a content package where that pair now has an eligible recipe.

Prove:

- old progress remains
- the result is NOT auto-discovered
- stale failure is no longer treated as authoritative
- reconciliation reports new possibility safely
- hidden/secret content remains protected

### Export / import

- exported JSON round-trips
- malformed JSON rejected
- structurally invalid save rejected
- import preview does not overwrite current save
- explicit confirmation performs overwrite
- unknown optional IDs are handled according to documented recovery policy

### Existing guarantees

All Phase 0 + 1 tests and validators must remain green.

The canonical seed must still report:

- 67/67 reachable
- max dependency depth 11
- no blocked required unlocks

## Out of scope

Do NOT implement:

- playable/final Laboratory UI
- Catalog/Set/Element Detail screens
- final navigation shell
- Discovery Map
- hint UI
- final art
- motion/audio production
- service worker/PWA install/update flow
- Capacitor/Android
- cloud sync/accounts
- backend
- analytics
- monetization
- new canonical recipes/elements
- Arcano content beyond the existing unresolved anomaly

Do not redesign the Phase 1 domain engine unless a concrete Phase 2 integration defect proves a minimal correction is necessary.

If such a defect appears, document it explicitly in the PR instead of opportunistically refactoring.

## Architectural constraints

- Domain stays pure.
- Persistence is behind an interface.
- Application layer coordinates resolver → save projection → validation → persistence.
- UI does not own save migrations or gameplay rules.
- Content remains canonical data.
- No hidden-content information may leak through reconciliation/import diagnostics.

## Delivery

Work on a dedicated branch and open a PR.

PR description must include:

- Phase 2 architecture summary
- durable save schema summary
- repository/adapters implemented
- migration strategy
- content reconciliation behavior
- atomicity/backup behavior
- import/export behavior
- commands run
- test results
- validator/reachability results
- any Phase 1 defect that required a minimal correction
- explicit confirmation that Phase 3 scope was not started

Do not extend scope.
