# CODEX_TASK.md — Isolario + Atlante vertical slice

## State

**Architecture checkpoint APPROVED on 2026-10-09**, under the conditions in `docs/ISOLARIO_CHECKPOINT_APPROVED.md`.

Read the approved checkpoint document first. `docs/tasks/ISOLARIO_ATLANTE_PROTOTYPE.md` is now executable within these limits even though its original heading records the prior pre-approval state.

## Required reading

- `AGENTS.md`
- **`docs/ISOLARIO_CHECKPOINT_APPROVED.md`**
- **`docs/tasks/ISOLARIO_ATLANTE_PROTOTYPE.md`**
- `docs/adr/ISOLARIO_ATLANTE_ARCHITECTURE.md`
- `docs/proposals/ISOLARIO_ATLANTE_MIGRATION.md`
- All required documents enumerated in the prototype task, especially resolver, save/versioning, visibility, visual direction, responsive and accessibility.

## Implementation workflow

- Base fresh foundation branch on **latest `main`**, recording SHA at kickoff. Do not reset to the historical audit SHA.
- Preserve PRs #9–16, without merging or force-pushing them. Extract selected small helpers only with provenance.
- Draft stacked PRs: **foundation → island → atlas**, with independent tests and readable reviews.
- Foundation may begin immediately: world types/index/validator, WorldRepository, generation-safe IndexedDB lifecycle and projections.
- **Before producing final scene asset batches**, supply a sample visual composition (island barren/developed at 1440, 390 and 320) for human approval. Continue safe foundation/tests while visual design is pending.
- Island gameplay: 4 starters + 20 existing canonical discoveries; 11 authored mappings including generic Creature; 3 distinct environmental effects; anchors chosen by player; no new recipe/Set/XP semantics.
- Atlas: full gate after 3 discoveries, safe known content and separate actual world observations.
- Keep historic Laboratory accessible on its original route during prototype review; expose Isolario on `/island`, don't redirect `/` automatically.
- Build and test with real seed from fresh save, including a complete 20-discovery route and first creature habitat, save/reload, mobile/keyboard and offline.
- No merge before visual and human PC/mobile playtest approval.
- Note world-only diagnostic backup is **not** full portable backup and is a pre-release limitation.

## Do not do

- Do not change locked 67-element seed, resolver semantics, PlayerSave schema, or PWA update safety.
- Do not activate 51 proposed 8A candidates.
- Do not import full old UI or FreeTable as Isolario.
- Do not build a procedural archipelago, full world editor, Content Studio migration, Android, or new eras.
- Do not claim approved final art or tested physical devices without evidence.

## Delivery

First provide foundation PR draft and scene sample for review. Once sample is approved, finish island and atlas PR drafts with required E2E, validator, save migration and offline evidence.
