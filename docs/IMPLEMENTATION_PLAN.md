# Implementation Plan

Status: **Codex-ready phased roadmap v1**

Principle:

One bounded vertical concern per PR.

Do not ask Codex to “build the game” in one change.

## Phase 0 — Repository scaffold

Deliver:

- Vite + React + TypeScript app;
- test setup;
- lint/typecheck;
- folder/layer skeleton;
- CSS token foundation;
- CI workflow;
- no invented gameplay.

Definition of done:

- app boots;
- tests/typecheck/build pass;
- architecture folders exist;
- README commands documented.

## Phase 1 — Content schema + pure engine

Deliver:

- domain types;
- Zod schemas;
- 67-element seed as canonical data;
- indexes;
- deterministic resolver;
- unlock/completion basics;
- content validators;
- reachability simulator.

No polished UI.

Required tests:

- unordered pair;
- A+A;
- alternate recipe;
- hidden Set;
- anomaly;
- 67/67 reachability;
- ambiguous recipe rejection.

## Phase 2 — Save/application layer

Deliver:

- SaveRepository abstraction;
- memory adapter;
- IndexedDB/Dexie adapter;
- new save;
- atomic combine transaction;
- schema migration framework;
- content reconciliation;
- export/import;
- backup snapshot.

UI can remain utilitarian.

## Phase 3 — Playable Laboratory vertical slice

Deliver:

- responsive AppShell;
- Lab desktop/mobile;
- Slot A/B tap interaction;
- Combine;
- library/search;
- result states;
- tested-pair context;
- keyboard access;
- reduced-motion baseline.

Use placeholder element art.

Definition of done:

player can reach early seed discoveries entirely through UI.

## Phase 4 — Catalog / Sets / Element Detail

Deliver:

- Collection home;
- Sets;
- Set detail;
- Element detail;
- favorites;
- filters;
- visible completion;
- no hidden leakage;
- currently exhausted/new possibilities.

## Phase 5 — Progressive disclosure + Anomalies + Collections

Deliver:

- nav unlock behavior;
- first anomaly archive;
- hidden Funghi reveal;
- starter Collections;
- collection completion;
- event celebration hierarchy.

## Phase 6 — Discovery map + hints

Deliver:

- local graph;
- accessible relationship list;
- map unlock;
- Tier 1–3 hint infrastructure;
- information modes Mystery/Balanced/Collector.

Do not implement strong paid/time-gated hints.

## Phase 7 — Product polish / PWA

Deliver:

- real design token polish;
- motion tier implementation;
- audio event infrastructure with placeholder/approved assets;
- offline service worker;
- update flow;
- accessibility audit fixes;
- responsive matrix fixes;
- performance profiling.

## Phase 8 — Expanded content

Only after engine/UI validation.

Add:

- mature Life/Animals;
- Umanità/Cultura/Tecnologia;
- first full Arcano payoff.

Content PRs should mostly modify data/localization/assets, not engine.

## Phase 9 — Android packaging

After responsive web/PWA feature parity.

Deliver:

- Capacitor wrapper;
- Android build;
- safe-area/back behavior;
- persistence/export verification;
- device performance pass.

No forked game logic.

## PR rules

Each PR must include:

- scope summary;
- design docs consulted;
- changed files;
- tests added/updated;
- validation result;
- screenshots for meaningful UI changes;
- known follow-up items.

Do not extend scope merely because adjacent work is convenient.

## Review order

For every PR:

1. architecture/scope;
2. gameplay correctness;
3. hidden-content safety;
4. tests/validation;
5. accessibility;
6. responsive behavior;
7. visual polish.

## Stop conditions

Codex must stop and ask/flag rather than invent when:

- docs conflict on gameplay meaning;
- a recipe would need redesign;
- schema cannot represent an intended rule;
- an accessibility requirement conflicts with proposed interaction;
- content validation shows a canonical seed contradiction.

Cosmetic implementation details may be resolved within the design system.
