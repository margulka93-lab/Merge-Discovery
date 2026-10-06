# Phase 2 — local save/application layer

## Boundaries

This implements only CODEX_TASK Phase 2. No playable Laboratory, catalog/navigation/graph/hints, PWA, Android, art/audio, cloud/backend/analytics or new canonical content. No Phase 1 engine correction was necessary: resolver, requirements, progression and visibility functions are reused unchanged. The diagnostic page demonstrates persistence and import/export only.

Read: AGENTS, SAVE_AND_VERSIONING, DATA_MODEL, RESOLUTION_ENGINE, TECH_SPEC, VALIDATION_AND_TESTING, IMPLEMENTATION_PLAN, DECISIONS, IMPLEMENTATION_SEED_CONTENT, PHASE_0_1_NOTES. Relevant diagnostic UI guidance: ACCESSIBILITY, RESPONSIVE_AND_UI_STATES, SCREEN_SPECS; existing DESIGN_SYSTEM tokens remain the visual foundation.

## Durable model and validation

`domain/model/save.ts` implements PlayerSave v1 and settings from DATA_MODEL: independent schema/content versions, creation/update timestamps, XP, first discovery/recipe metadata, recipe history, tested outcome/content version/time, observed/resolved anomalies, earned Set reveals/completions, completed Collection chapter IDs, favorites and settings.

`saveSchema.ts` strictly parses every nested structure with Zod, validates durable ID syntax, canonical pairs, timestamps/enums, distinct ID lists, integer XP and unknown fields. The envelope identifies `merge_discovery` and repeats schema/content versions; a mismatch is rejected. Validated shape precedes migration/reference/domain use. Error codes are typed; player-facing messages never print raw IDs/schema diagnostics.

No level, visible count, exhausted flag, feature/Era eligibility or new-possibility marker is stored as a second durable truth. Features and Eras are recomputed with the current authored rules; UI projections use the existing visibility policy.

Settings start balanced, proactive hints off, reduced motion on, default text, sound/music/drag off, normal contrast. These are conservative technical defaults for the diagnostic tranche; no settings screen or new gameplay rule is added.

## Repository and atomicity

`persistence/SaveRepository.ts` defines load/createNew/persist/export/import/clear. Migration, export envelope and import confirmation belong to Application; repository import accepts already validated/confirmed snapshots. The memory adapter and Dexie IndexedDB adapter obey the same contract.

IndexedDB stores one row for a single player containing revision, current snapshot and one previous structurally valid backup. Current/backup/revision update together in a read-write transaction. Each write checks the expected revision inside the transaction: stale writers fail with conflict instead of losing another tab's progress. Application serializes actions per instance and reloads the current repository snapshot before combining. It returns the result/state only after commit.

The memory adapter clones at input/output boundaries and commits by one replacement; it is used for tests, not a silent browser persistence fallback. A failed write never publishes a partial application result. Clear deletes both logical snapshots only after confirmation, retaining a revision tombstone so a stale pre-clear writer cannot restore them.

Adapters validate backup shape. Application supplies the validated predecessor, migrated into the supported schema while retaining its original content version/history. This also preserves a valid legacy snapshot when migrating and reconciling at once. Application explicitly suppresses backup rotation when confirmed recovery/import replaces a semantically unreadable current snapshot. Corrupt current data never overwrites the existing backup. `start()` creates only when both snapshots are absent; corruption is not a new game. Recovery requires an explicit application confirmation and restores a migrated, reconciled, valid backup. Raw current/backup can be exported for recovery without passing their contents to the engine.

## Combine projection

`SaveApplication.combine` reads → migrates/reconciles → projects engine state → calls the existing resolver → projects events with an injected timestamp → validates shape/references → persists once → returns the committed resolution/snapshot. Reconciliation and the reaction share the combine write; there is no intermediate persisted reaction state.

First-discovery/first-anomaly metadata is retained; tested timestamps update on repeat. XP/reveal/completion semantics come entirely from the Phase 1 events. Clock values are history metadata and never alter rewards. The application snapshot is cloned, so a consumer cannot mutate durable repository state through it.

## Schema migrations and content updates

The shipped schema is v1 and has no invented production legacy migration. The framework requires one registered strict parser/migration per older version and advances exactly one version per step, validates the final target and never mutates the raw source. Tests include strict v0 → v1 plus a test-only v0 → v1 → v2 chain. Missing/newer schemas and migration failures are typed, non-destructive errors.

Content reconciliation retains discoveries/XP/settings/earned badges, applies authored element aliases, preserves tested content versions, refreshes derived state and updates contentVersionSeen. Added content is not auto-discovered. Old failure metadata is historical: it is never rewritten as a current failure without performing the experiment again. The authoritative-failure helper also reevaluates same-version eligibility changes through the resolver.

Eligible new normal reactions produce a generic notice and markers for already discovered inputs only. Unknown secret recipe/element targets and unrevealed hidden/secret Sets are excluded from those notices/markers. No result IDs, recipe counts, hidden Set names or canonical totals enter import/reconciliation diagnostics. The real anomaly outcome remains supported without inventing its future result.

## Optional references and corruption

An optional, strictly shaped `quarantine` section extends the save to preserve historical references removed from current content. Unknown discoveries/recipes/tested pairs/anomalies/Sets/chapters/favorites remain exportable there, outside active engine/UI facts. Authored aliases normalize element references and pairs. Recognized history and XP are retained; unknown first-recipe metadata is archived while its recognized discovery remains usable. Repeated loads retain that metadata, and reintroduced recognized references can be restored from historical quarantine.

Structurally invalid saves and inconsistent recognized first-recipe/result facts fail recovery rather than being guessed/repaired. There is no telemetry or automatic reset. Existing earned Set completions are not revoked just because later content changes denominators.

## Import/export

Export returns Unicode JSON text suitable for UTF-8 encoding with product/schema/content envelope and durable payload. Preview performs parse → strict envelope/legacy shape validation → sequential migration → current-content reference reconciliation, returning only basic owned-progress stats and safe notice codes. It does not write.

Confirmation requires the exact application-issued preview plus an explicit true confirmation. The prepared save is held privately; mutating/forging preview stats cannot alter it. Expected repository revision prevents a preview from overwriting progress changed after preview. A successful preview token is consumed. Cancel or invalid import leaves the current/backup unchanged. A confirmed replacement retains the previous valid current snapshot as backup.

The UI exposes a labeled JSON field, export/round-trip validation, preview, a clearly named overwrite confirmation, cancellation and explicit raw-export/backup recovery actions. It contains no combination controls or final Settings/Lab screen.

## Tests and commands

```sh
npm ci
npm run dev
npm run check
npm run validate:content
npm run simulate:content
npm run build
npm run preview
```

Tests use `fake-indexeddb` with the actual Dexie adapter, including reopen, two connections and forced transaction abort after put. Memory and IndexedDB run the same repository contract. Application tests cover durable discovery/alternate/repeat/failure/anomaly/reveal/completion behavior, write failure, backups, migration failure, reconciliation, optional IDs, envelope/JSON corruption, confirmation and stale preview. Component tests cover diagnostic boot, no hidden leakage, explicit import and corruption recovery.

Checked-in v1 compatibility fixtures cover fresh, early, completed Sets, anomaly observed and pre-content-update failure states. They must remain loadable by later schemas.

The real browser booted the IndexedDB adapter, exported/validated JSON, previewed and explicitly confirmed an import, then reloaded. Creation timestamp and starter metadata survived reload; browser warning/error console entries were absent. Screenshots: [import preview](evidence/phase-2-import-preview.jpg), [saved round-trip](evidence/phase-2-saved-roundtrip.jpg).

Final command outputs and CI result are recorded in the PR. Canonical content remains unchanged and its audit still requires 67/67 reachable, depth 11, no blocked required unlocks. The pre-existing upstream Zod/Rollup annotation warnings remain nonfatal.

Final local gate: `npm run check` passed with 86 tests across 4 files, typecheck/lint, both content validators and production build. `npm audit` reported zero vulnerabilities.
