# Pre-Codex Design Audit

Date: 2026-10-06

Status: **passed for Phase 0/1**

## Purpose

This audit checks whether Codex would need to invent product/gameplay decisions in order to complete the first implementation task.

Conclusion:

**No known blocking design ambiguity remains for Phase 0/1.**

## Canonical precedence

When reading the repository:

1. `DECISIONS.md` records accepted product choices.
2. Implementation-ready specifications override historical drafts.
3. `IMPLEMENTATION_SEED_CONTENT.md` is the canonical seed dataset.
4. `FIRST_CONTENT_SLICE.md` is explicitly historical/superseded.
5. `OPEN_QUESTIONS.md` now contains only non-blocking future/tuning items.

## Conflicts resolved in this audit

### Materia Set

Old:
Materia appeared as an underfilled separate Set.

Resolved:
Plasma/Gas belong to Origini. No Materia Set in canonical architecture.

### Geology / waters / atmosphere

Old:
separate candidate Sets.

Resolved:
one player-facing Mondo Set; themes become Collections/Tags.

### Hint currency

Old:
Intuizione resource was provisional.

Resolved:
no hint currency in core product. Hints are free/contextual.

### Experiment modifiers

Old:
conditions/third input were possible future progression.

Resolved:
core launch remains two-input only. Future modes are expansion scope.

### Result persistence

Old:
question whether Slot A persists.

Resolved:
explicit post-result actions:
- Usa risultato
- Ripeti con A
- Nuovo esperimento

### Breakpoints

Old:
conceptual only.

Resolved:
exact implementation defaults in RESPONSIVE_AND_UI_STATES.md.

### Save strategy

Old:
undecided.

Resolved:
local-first, IndexedDB preferred, versioned SaveRepository.

### Technical stack

Old:
deferred.

Resolved:
TECH_SPEC.md baseline.

## Seed coverage audit

The 67-element seed covers:

- starters;
- ordered-independence;
- A+A;
- alternate recipe;
- normal Set reveal;
- discovery Set reveal;
- hidden Set;
- unresolved anomaly;
- Collections;
- multiple dependency depths.

Design-time fixed-point simulation:

- reachable: 67/67
- max dependency depth: 11
- required unreachable: 0

Implementation must reproduce this through automated validation.

## Architecture audit

Codex has explicit guidance for:

- domain purity;
- content schemas;
- persistence boundaries;
- UI/application separation;
- PWA;
- later Android;
- localization;
- accessibility;
- validation/CI.

## UX audit

Specified:

- desktop Lab;
- mobile Lab;
- catalog;
- Set detail;
- Element Detail;
- Anomalies;
- Map;
- settings;
- progressive disclosure;
- result states;
- empty/error/offline/update states;
- keyboard/touch behavior.

## Presentation audit

Specified enough for implementation:

- palette/tokens;
- typography roles;
- component anatomy;
- motion tiers;
- anomaly grammar;
- audio event IDs;
- reduced motion;
- placeholder asset policy.

Final production art/audio remain content production, not architecture blockers.

## Save audit

Specified:

- autosave;
- atomic combine transaction;
- schema migration;
- content reconciliation;
- export/import;
- backup;
- corruption recovery;
- offline behavior.

## Known non-blockers

See `OPEN_QUESTIONS.md`.

None should be decided silently by Codex.

## Final gate

Phase 0/1 may begin.

Later phases should still be reviewed incrementally because playtesting may tune content/balance without invalidating this architecture.
