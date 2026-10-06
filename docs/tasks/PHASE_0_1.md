# Phase 0 + Phase 1 — Archived Codex Task

# Archived task — Phase 0 + Phase 1

Do not begin later phases in this task.

## Goal

Create the technical foundation and pure data-driven discovery engine for Merge Discovery.

No polished product UI is required yet.

## Required reading

- `AGENTS.md`
- `docs/DATA_MODEL.md`
- `docs/RESOLUTION_ENGINE.md`
- `docs/IMPLEMENTATION_SEED_CONTENT.md`
- `docs/VALIDATION_AND_TESTING.md`
- `docs/TECH_SPEC.md`
- `docs/DECISIONS.md`

## Scope

### Phase 0

Initialize:

- Vite
- React
- TypeScript
- test runner
- lint/typecheck
- project layers from TECH_SPEC
- CSS token foundation
- basic CI

### Phase 1

Implement:

- content/domain types;
- strict runtime schemas;
- canonical seed data for all 67 elements and documented recipes;
- Set/Collection/anomaly data;
- PairKey canonicalization;
- deterministic pure resolver;
- explicit recipe indexing;
- requirement evaluation foundation;
- anomaly outcome;
- basic Set reveal/completion logic required by seed;
- content validator;
- reachability simulator.

## Required automated checks

Tests must prove:

- A+B === B+A;
- A+A works for authored recipe;
- Water has two distinct recipe IDs producing same result;
- repeated recipe is recognized as known;
- Luna + Vita returns the documented anomaly;
- Funghi remains hidden before Mold;
- all 67 seed elements are reachable;
- duplicate ambiguous pair definitions fail validation;
- unknown IDs fail validation.

## Out of scope

Do not implement:

- final Lab UI;
- catalog screens;
- IndexedDB;
- PWA;
- Android;
- final art;
- motion/audio;
- Arcano content beyond the unresolved seed anomaly;
- new gameplay mechanics;
- monetization/backend.

A minimal diagnostic/demo page may render engine status if needed for development, but do not spend scope on product UI.

## Delivery

Open a PR.

PR description must include:

- architecture summary;
- files created;
- commands to run;
- validator output;
- reachability output;
- test output;
- any design conflict encountered.

Do not extend scope.


## Result

Completed in PR #2 and merged into `main`.

Merge commit:
`2587e689434542c8c5a9f569ad7b9018aa7e9b13`
