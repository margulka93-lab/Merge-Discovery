# CONTENT-1A — Runtime content packs

Scope: ZIP importer, deterministic composition, validation/reachability preview, local atomic install, safe restart, images, export, rollback/deactivation. Stacked on UX-1 / PR #13. No Studio visual editor in this tranche; no 8B/8C/Android. No merge or canonical approval.

Read: AGENTS, CONTENT_1_IMPORTER, UX_1_TWO_MODES, CODEX_LONG_RUN, TECH_SPEC, DATA_MODEL, RESOLUTION_ENGINE, SAVE_AND_VERSIONING, VALIDATION_AND_TESTING, DECISIONS, VISUAL_UX_ALIGNMENT, VISUAL_BIBLE_REFERENCE, ACCESSIBILITY and pertinent screen/responsive/motion docs. The user authorizes the PR #12 dossier as a **sandbox test**, superseding the older proposal's test-after-canon-review sentence. That permission does not approve recipes or change shipped data.

## Architecture

- `content/packs`: strict manifest/modules, ZIP bounds/path/duplicate/CRC checks, SHA-256 raster digests, typed merge policy, dependency ordering, canonical validator and index.
- `application/packs`: genuine previews tied to content/save revisions, existing resolver fixed-point simulator (including no-secret required paths), staged old-save reconciliation, warnings, install/export/rollback commands. UI consumes these use cases rather than content files.
- `persistence`: independent repository interface; Dexie atomically commits definitions, asset bytes, revision, and previous composition as one row in `merge_discovery_content`. Existing `merge_discovery` save schema stays at v1.
- `platform/content`: actual image decoder, simulation worker and Web Locks command lease. Every complete SaveApplication command and content activation share the same browser-wide lease; old tabs reject an obsolete content epoch before resolving/writing.
- `app`: compose at boot, then instantiate the same SaveApplication with the active index. Installation writes no PlayerSave. Boot uses the existing reconciliation path without discovery or XP rewards.
- `ui`: opt-in local author panel under Settings; preview/report before install; imported raster artwork with revoked Blob URLs and the existing SVG fallback. Author metadata never enters gameplay projections.

The simulator can skip settled explicit pairs only when there are no tag rules and **all authored recipes for that pair** are known. Gated alternatives and anomaly payoffs remain revisitable. A parity test compares complete outputs against full revisiting on the Phase 8A dossier. This is a simulation performance change, not a resolver/gameplay change.

## Format and policies

`manifest.json`, optional `data/{elements,recipes,sets,collections,anomalies,unlocks,rules,registries,progression,visibility,migrations}.json`, optional `locales/it.json`, declared `art/*.png` / `*.webp`. Empty ZIP directory entries are permitted. No scripts, arbitrary SVG, HTML or remote resources.

Manifest: `schemaVersion:1`, `packId`, unique `namespace`, numeric SemVer core `version` and `contentVersion`, `minimumSaveSchemaVersion:1`, title, proposed/author status, exact-version dependencies, artKey map (path, MIME, SHA-256, width/height). Prerelease/range semantics are not supported in v1. Namespace is ownership metadata; legacy authored IDs such as the Phase 8A dossier remain valid, with global collision rejection. Namespace does not silently prefix/change IDs.

Additive modules use canonical schemas. Same-pack updates replace their previous definitions with a higher version, retain every previous ID, and pass save reconciliation. Seed IDs, seed PairKeys (even a higher-priority replacement), seed visibility/unlocks/art and shipped migration aliases are locked. New alternatives on unused pairs may target an owned result. Registries may reuse known symbols; locales may reuse identical text but may not overwrite another owner's value. XP reward values and previous threshold prefixes are preserved; authored curve extension is validated.

Limits: ZIP 16 MiB, expanded archive 32 MiB, JSON entry 4 MiB, raster 2 MiB / 2048×2048, 256 entries; composed 2500 elements / 10000 recipes / 32 tag rules / 64 MiB artwork. Browser simulations run in a worker with a 90-second deadline. Failure is explicit and preserves the active composition/save; large authoring simulations can also run via CLI.

Pack storage is local to the current browser/origin; exports move it between devices. No account/server/rebuild is needed, and local installation publishes nothing for other players. Web Locks are required for browser activation and boot with installed packs. A separate persistence adapter can supply equivalent coordination on a future platform.

Deactivation/rollback rejects dependencies or any reconciliation that would quarantine current progress/history/completion. Author export remains available. Current and previous content composition are retained; save backup continues through the existing adapter. No hot index mutation during combine/reveal/update.

## Commands

```sh
npm ci
npm run dev
npm run check
npm run test:e2e
npm run test:production
npm run validate:pwa
npm run profile:catalog
npm run profile:map
npm run profile:packs
npm run sample:pack -- example.zip
npm run validate:pack -- example.zip
npm run simulate:pack -- example.zip
npm run report:pack -- example.zip
npx tsx scripts/phase-8a-test-pack.ts
npm run validate:pack -- tests/fixtures/phase-8a-proposed.zip
```

Optional dependency ZIPs follow the candidate path on validator/simulator/report commands. Those commands use the same pipeline and all validate + simulate; their labels select reporting intent rather than skipping mandatory checks. Actual raster decode is additionally enforced by the browser before installation.

## Phase 8A evidence and review boundary

The source JSON is a verbatim fixture from PR #12 (`origin/codex/phase-8a`, 0225bdd), outside the runtime seed. The adapter changes only packaging: module placement, empty omitted feature registry, manifest ownership/version/status. All 51 elements and 51 recipes remain proposed.

Seed: **67/67**, depth 11. Dossier sandbox: **118/118**, depth 12. Sample: **68/68**, depth 11. Synthetic performance composition: **1000/1000**. Reachability does not approve names, recipes, difficulty, art, or visual composition.

The dossier includes a new Animals Set but contains no new Collection or raster files. Its authored artKeys therefore use the explicit existing symbolic fallback. A separate synthetic sample demonstrates new Collection + Set + raster + locale without inventing canonical dossier entries. Its image reuses the existing app emblem and is visibly a placeholder, not final element art.

The importer blocks inconsistent required content, required paths dependent on secrets, unrevealed required Sets, incompletable required Collection units and blocked unlocks. The report lists actual checkpoints/XP, depth, unlock paths, ingredient usage, terminal elements, alternatives, Set connections and bonus/secret coverage. Difficulty warnings require human review. Known dossier exclusions (Rock+Time and Flower+Insect candidate collisions) remain excluded, and Moon+Life retains the canonical unresolved anomaly.

Screenshots and production evidence: `docs/screenshots/content-1a/`, `docs/evidence/content-1a/`. Native Android/WebView, physical devices and manual screen-reader review remain outside this cycle. Browser screenshots/audits and green tests are not visual/canonical approvals.
