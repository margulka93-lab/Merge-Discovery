# Phase 0 + Phase 1 implementation notes

## Specification inputs

Required reading: `AGENTS.md`, `CODEX_TASK.md`, `DATA_MODEL.md`, `RESOLUTION_ENGINE.md`, `IMPLEMENTATION_SEED_CONTENT.md`, `VALIDATION_AND_TESTING.md`, `TECH_SPEC.md`, `DECISIONS.md`.

Additional relevant reading: `GAME_VISION.md`, `DESIGN_SYSTEM.md`, `XP_AND_LEVELS.md`, `SETS_AND_PROGRESSION.md`, `COLLECTIONS_AND_OBJECTIVES.md`, `PROGRESSION_SYSTEM.md`, `IMPLEMENTATION_PLAN.md`, `OPEN_QUESTIONS.md`.

## Scope

Only Phase 0 + Phase 1. No playable/final Lab, catalog, save schema/transactions/IndexedDB, import/export, PWA, Android, graph UI, hints, final art, motion/audio, backend or monetization. No Arcano result is invented for Luna + Vita. No canonical recipe, rarity, Set ownership, gameplay or unlock trigger is changed.

Routing/state libraries and browser E2E gameplay/save flows will be added when the relevant phases require them. This diagnostic screen has no interactions to route or orchestrate. The component smoke test covers boot and content failure; domain/content tests cover this tranche's engine behavior.

## Representing authored rules

The TypeScript blocks in DATA_MODEL are illustrative. Two supplemental data structures represent rules already authored elsewhere:

- `visibility.json`: initial revealed Sets, progressive announcements (Mondo after Cosmo, Piante after Vita), Collection reveal paths. Each path ANDs requirements; multiple paths implement the documented OR alternatives. Collections do not gate progression.
- Recipe `gateFallback`: optional explicit dormant/anomaly fallback for future `unlock_trigger` recipes, required by RESOLUTION_ENGINE. The seed has no gated recipe and uses neither this extension nor tag rules.

`registries.json` declares valid tags/features/Eras so requirement references can be validated; it does not introduce eligibility gates. The seed's Era IDs are organizational metadata, not inferred level restrictions. The working Era level bands are not applied as undisclosed gates to the locked seed.

XP values/early thresholds are copied from XP_AND_LEVELS, including the data-driven Set completion formula. No extrapolation beyond level 15, feature gate or Collection reward is authored. Placeholder descriptions, empty semantic tags and stable placeholder art keys leave unauthored creative material open. Nonstarter element visibility is conservatively hidden until discovery; no unauthored silhouettes or exact hints are supplied. Fungi's Set identity and denominator remain absent until Mold; the Set becomes revealed through its exact documented trigger.

Engine state is a minimal plain-object input, not a shipped save. The pure event projection supports unit tests and simulation; timestamps, durable transactions and repositories remain Phase 2. Failed pairs carry their tested content version; the future persistence layer will add timestamps and reconcile history.

## Audit semantics

Simulation starts from four authored starters, freezes available input elements per round, resolves canonical pairs through the real engine, projects events, and applies unlock/completion checks to a fixed point. It records intermediate element/reveal/XP checkpoints. It never starts with gates/levels/features assumed unlocked.

The reported dependency depth is the number of recipe layers from starters in the ungated canonical seed. XP is one deterministic exhaustive traversal, not a player cadence/balance prediction. Blocked unlock diagnostics include unmet requirements to expose self-gates/cycles; they are not a general symbolic explanation of every possible future gate graph.

The validator also runs a traversal excluding secret recipes/elements, so required content cannot depend on a secret path. Strict runtime shape checks, all modeled references, localization, unique identities/sort positions and ambiguity are checked before indexing. All v1 requirements are positive monotone predicates: they cannot prove mutually exclusive states, so equal-priority overlapping variants are rejected conservatively. Future richer predicates will need additional proof logic.

Player-facing visibility functions filter hidden Sets and undiscovered elements and suppress unrevealed Set denominators. Future search/graph/hint implementations must use this boundary; those features are not implemented here.

## Design issues

No unresolved gameplay contradiction was found. The schema representation gaps above are documented explicitly and preserve the authored triggers. Seed names/rarities/starters/ownership, all 64 recipe definitions and Collection memberships are cross-checked automatically against IMPLEMENTATION_SEED_CONTENT.md.

## Verification

Commands: `npm run check`, `npm run validate:content`, `npm run simulate:content`.

The reachability acceptance gate requires exactly 67/67 reachable, four starters and maximum depth 11. It also checks zero unreachable required elements, zero unrevealed Sets and zero blocked unlock targets. The content gate checks required reachability without secret dependencies.

Final local check: `npm run check` passed (typecheck, lint, 43 tests across 3 files, both validators and production build). Reachability: 67/67, depth 11, no unreachable required elements/unrevealed Sets/blocked unlocks, anomaly observed. `npm audit` reported zero vulnerabilities after choosing the patched test runner.

The scaffold also booted in the browser with no warning/error console entries. [Diagnostic screenshot](evidence/phase-0-1-diagnostic.jpg). The production build succeeds with upstream Zod comment-annotation warnings from Rollup; these do not affect validation or output.

Final command output and test totals are also recorded in the PR description.
