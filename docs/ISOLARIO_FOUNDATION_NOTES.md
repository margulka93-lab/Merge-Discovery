# Isolario Foundation — implementation and visual checkpoint

Date: 2026-10-09. Base: `main` **8ce18be6ed1081b45f3e51255ebf690ae38cafe3**. Branch: `codex/isolario-foundation`.
Scope: Foundation plus **sample composition only**. Island gameplay UI, production scene assets and Atlas UI remain behind the visual gate. No merge or visual approval is implied.

## Architecture implemented

- `domain/world`: serializable WorldState v1, authored placement/replacement rules, current-ownership habitat derivation, deterministic receipts and observations. No React, persistence, clock-dependent progression, resolver modifier or XP.
- `content/world`: eleven approved mappings, two target choices each, provisional geometry registry, strict schemas and semantic validator. Invalid references, coordinates, cycles, replacements and impossible actions fail the build. A bounded state search demonstrates reachability; the application simulation separately proves the approved canonical journey.
- `application/island`: WorldActionApplication, safe scene projection, neutral resolver bridge and injectable optional Web Locks lease. Commands check content/definition version and save/world/generation expectations. Only committed mutations can publish observations. No-op/retry never extends the journal. Discovery is separate and never auto-spawns.
- `application/atlas`: Foundation DTO joins the existing safe catalog with committed observations/locations. Full gate uses the existing three-discovery disclosure; no book screen implemented.
- `WorldRepository`: logical interface with coherent cross-store context, commit and diagnostic raw export. Memory and IndexedDB adapters share transaction guards. No second SaveApplication or knowledge model.

The small experiment helper adapts **PR #13 `attempt.ts`, 2267a444c9a41741040642fdf89c2530eda2941c** into a UI-neutral result. Only current resolver-confirmed known success bypasses a write; alternate/anomaly/stale/no-reaction paths use SaveApplication. The lease type/pattern is selectively adapted from **PR #14 SaveApplication.ts and platform/content/lease.ts, 85d7a2146b3fc2e893ba0d47934780a1122d7305**. No old layout, pack implementation, Studio, FreeTable, whole commit or branch was imported. PRs #9–16 are unchanged; current metadata is in the evidence snapshot (#9 is still non-draft, the others draft, all unmerged).

## Container migration and lifecycle

Dexie logical database version **1 → 2** (native IndexedDB **10 → 20**). Additive `world_snapshots` and `profile_meta`; `snapshots` schema is unchanged. Upgrade has **no transformation callback**, so canonical current/backup remain byte-identical. Metadata is allocated once in a transaction, outside PlayerSave. Save schema and canonical export remain **v1**.

Create/import/clear rotate generation atomically with canonical slot writes. Ordinary discovery/preferences/reconciliation/backup recovery retain generation. World commits read canonical revision, generation and world revision in the same read-write transaction. CAS remains authoritative even without Web Locks. Experiments invoke SaveApplication without an enclosing world lease; no nested non-reentrant lock.

One world row retains current and successful previous snapshot, plus at most one retired generation and its bounded slots. Until a new-generation world commit, the former row remains raw diagnostic data; it cannot be projected into the new generation. Corrupt/missing-current worlds are never implicitly reset. Explicit backup recovery validates definition/generation/history and avoids promoting corruption. Current ownership filters recovered orphan facts and habitats without deleting raw data.

`SaveDatabase.upgradeBlocked` / `reloadRequired` expose container lifecycle to callers. Versionchange closes the connection; no automatic reload/reset/delete. Old v1 code uses Dexie's existing versionchange closure; blocked upgrades wait for the retaining connection to close. Foundation tests cover blocked/native-version upgrade. A dedicated Island recovery/update UI is intentionally deferred, including binding these statuses to its notices and coordinating world commit/reveal with the existing PWA safe-point controller.

**Export limitation:** the current JSON carries canonical discoveries/preferences only. A separate raw world diagnostic export is not a portable full-game backup. Diagnostics UI and PR state this explicitly. Import creates a new empty generation after existing confirmation. Full profile/world portable import/export must be designed and tested before public release, outside this tranche.

## Verification and evidence

See `docs/evidence/isolario-foundation/verification.json` and logs for final counts. Commands:

```sh
npm ci
npm run dev
npm run check
npm run validate:world
npm run simulate:world -- docs/evidence/isolario-foundation/journey.json
npm run test:e2e
npm run test:production
npm run validate:pwa
npm run measure:bundle -- docs/evidence/isolario-foundation/bundle-after.json
npm run profile:catalog
npm run profile:map
```

Production suite requires `dist` from `check`/build. `test:e2e` serves on 5178; production uses isolated port 5179. Open the static sample while Vite is running:

`/docs/evidence/isolario-foundation/sample/index.html?state=initial`

or `?state=developed`. It has **no gameplay controls or save binding** and is excluded from the production app/PWA. It is a visual review artifact, not `/island` or a playable prototype.

The simulation runs the real SaveApplication from four starters through all twenty existing recipes: **24 owned, 2430 XP**, followed by eleven intentional manifestations and a real derived creature habitat. Canonical save remains unchanged by world actions; known recipe replay writes zero snapshots. Canonical content/recipe IDs remain intact: **67/67**, maximum depth **11**.

Tests cover pure guards, strict state/history reconstruction, same-zone habitat, target/max/slot, idempotence/conflicting payload, stale save/world/generation, import/reset/invalid import, persistence failure between discovery and manifestation, raw corruption/missing-current and backup recovery, hidden/unowned/foreign projections, Atlas gate, alternate/A+A/anomaly/no reaction. Seven shipped v1 save fixtures retain both raw slots byte-for-byte across migration. Browser harness additionally tests real Chromium IndexedDB upgrade and competing tabs; it is not an Island interaction playtest.

Production verifies previous Laboratory/Catalog/Set/Detail/Collections/Archive/Map/Settings, offline reload/combine/export/preferences, installability, waiting worker/reveal acknowledgement and explicit safe update. The separate world offline test uses a **clearly seeded application-simulation fixture**, checks durable world data through canonical combine/reload/export, and does not claim offline Island UI or world gesture safe-point coverage.

Foundation code is currently library-only except the shared database lifecycle and export disclosure. Existing lazy screens, React/storage/validation chunks and PWA policy remain. The sample raster assets are documentation, not runtime precache. Entry **116740 → 117311 B** (+571); total JS **604707 → 605651 B** (+944), total gzip **186304 → 186595 B** (+291), **10 JS chunks / 18 precached assets**. Renderer splitting and scene profiling will be measured in Island, after visual approval.

## Documents and boundaries

Read AGENTS, current task, approved checkpoint, complete prototype task/ADR/migration, GAME_VISION, DECISIONS, DATA_MODEL, RESOLUTION_ENGINE, TECH_SPEC, seed, validation, save/versioning, SCREEN_SPECS, VISUAL_DIRECTION/VISUAL_BIBLE_REFERENCE, DESIGN_SYSTEM, ACCESSIBILITY, RESPONSIVE_AND_UI_STATES, MOTION_AUDIO, HINTS_AND_FAILURE and relevant UX_1/PLAYFEEL_V2/CONTENT_1 proposals. New checkpoint supersedes historic pre-approval headings and Lab-home layout; the 67 seed rules remain binding.

The audit evidence cited by the ADR was copied from the still-existing audit worktree, with hashes and historical status preserved in `audit-provenance.json`. Its `PENDING` fields describe the earlier audit, not the approved checkpoint. Fresh Foundation simulation re-verifies that route on current main before using it as acceptance data.

No unresolved canonical contradiction found. The target-relative requirement predicates (`sameZone`, `sameAnchor`) encode the approved choice between two anchors; no fixed west-only requirement or new recipe semantics. Journal/receipts are bounded at **11** approved mutations, correcting the historical ADR's old ten-mapping wording under the approved eleven-mapping checkpoint.

Physical phone, screen reader, human playtest, world renderer profiling and scene approval: **NOT RUN / PENDING**. Automated viewport/AA review of the static sample does not certify the playable UI. No full assets, Island/Atlas screens, expansion, Studio migration, Android or merge performed.
