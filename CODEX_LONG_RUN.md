# CODEX_LONG_RUN.md — Merge Discovery extended execution queue

Status: **prepared**. This is a multi-stage Codex execution contract, not permission to merge PRs without review.

## Objective

Continue the already-implemented 7.5A redesign, then work for an extended session on 7.5B, 7.5C, Phase 8 (three bounded content slices), and Phase 9 Android wrapper.

Follow **one stage per branch/PR**. Work through the sequence as far as your execution/session allows. Do not substitute a single enormous combined PR.

## Current repository truth

- `main` contains completed Phases 0–7.
- PR #9, branch `codex/phase-7-5a`, contains Phase 7.5A and is **open, unmerged, awaiting visual approval**.
- Do not claim Phase 7.5A is approved, and do not merge PR #9.
- `CODEX_TASK.md` may reflect the old combined Phase 7.5 brief; this queue governs the next multi-stage execution.
- The image `Merge Discovery Design Bible` attached to the invoking Codex prompt is the **primary visual reference**. Store a project-owned copy at `docs/references/merge-discovery-design-bible-original.png` (or the original format), committed on the first stage branch if the image is actually accessible. If attachment is inaccessible, record this blocker prominently and do **not** improvise a light/ivory UI.

## Execution queue

| Stage | Branch | Dependency | Task |
|---|---|---|---|
| 7.5B | `codex/phase-7-5b` | PR #9 / 7.5A branch | `docs/tasks/PHASE_7_5_B.md` |
| 7.5C | `codex/phase-7-5c` | 7.5B | `docs/tasks/PHASE_7_5_C.md` |
| 8A | `codex/phase-8a` | 7.5C | `docs/tasks/PHASE_8_A.md` |
| 8B | `codex/phase-8b` | 8A | `docs/tasks/PHASE_8_B.md` |
| 8C | `codex/phase-8c` | 8B | `docs/tasks/PHASE_8_C.md` |
| 9 | `codex/phase-9-android` | stable code from 8C | `docs/tasks/PHASE_9.md` |

First action: fetch current `main` and PR #9; inspect branch contents and tests. Begin 7.5B on a branch based on PR #9's latest head, not from older `main`. Bring the queue/spec files from `main` into the working branch in a way that preserves source history. Do not overwrite 7.5A changes.

## Stacked PR protocol

If earlier PRs remain unmerged:

- each branch starts from the immediate predecessor branch;
- open a **draft stacked PR** to the predecessor branch (7.5B targets `codex/phase-7-5a`, 7.5C targets `codex/phase-7-5b`, etc.);
- PR titles must identify stage and the current review dependency;
- no automatic merging, no force push to `main`;
- base/head relationships and blockers must be described in each PR;
- never claim a stacked PR is ready to merge into `main` while its parent is unapproved.

If a predecessor becomes approved and merged during the session, rebase/re-target the next PR cleanly to the updated base; do not duplicate commits.

If the running Codex environment cannot open stacked PRs, use separate branches/commits with clear handoff, and document the blocker.

## Human review gates

1. **Visual approval**: PR #9 / 7.5A and 7.5B–C are not considered approved from green CI alone. Do not merge before user screenshot review.
2. **Canon approval**: Phase 8's newly-authored elements/recipes/Set choices are proposed content on PR branches until reviewed. Existing 67 elements/recipes remain canonical and unchanged.
3. **Android distribution**: no keystore creation from user secrets, no store publication, and do not claim device validation if no emulator/device or SDK was available.

These gates block merging/final publication, not the ability to work ahead on draft stacked branches when clearly labeled provisional.

## Work policy

- Read `AGENTS.md` and each stage task's required docs.
- Preserve pure domain, visibility, save, PWA/update contracts.
- Never generate hidden-content leaks in UI, search, graph or hints.
- Do not invent content as if it were already locked canon; mark new candidates as proposed, select only internally consistent options, and report alternatives for human review.
- Do not manufacture test results, visual approval, physical Android verification or manual screen-reader checks.
- Always run the applicable unit/component/E2E/production validators before a PR.
- Include real screenshots at specified sizes for visual tasks.
- Keep stage-specific notes and explicit unresolved decisions in PR descriptions.
- Prefer implementation from existing schemas/data and avoid large framework rewrites.
- When an essential design or Android SDK/signing limitation stops a stage, leave that stage in a clearly labeled draft and continue only with independent safe work.

## Stop conditions

Stop the current stage and report, rather than guessing, when:

- the original image is unavailable for a visual decision whose outcome depends on it;
- two canon sources fundamentally disagree;
- content additions require a nontrivial engine/visibility redesign;
- a candidate recipe collides with an existing pair;
- validator/reachability fails and cannot be corrected without changing canonical gameplay;
- Android SDK/build environment is unavailable for a required native validation step;
- a stage would require user-provided credentials or store permissions.

You may continue to other independent analysis/test tasks while blocked.

## End-of-run report

Produce one succinct handoff with:

- stage-by-stage PR URLs and branch bases;
- CI/test/reachability status per stage;
- visual screenshot links per UI stage;
- proposed canon decisions/counts for Phase 8;
- Android build verification level (source only, emulator, or device);
- exact blockers and human approvals needed;
- tasks not executed due to run limits.

## Do not silently skip

If the run cannot reach Phase 8 or 9, state precisely where it stopped. An instruction to continue does not guarantee autonomous execution beyond the current Codex session.
