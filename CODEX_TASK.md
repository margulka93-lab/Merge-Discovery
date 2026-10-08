# CODEX_TASK.md — PLAYFEEL-V2 (priority change)

## Current priority

**Prototype real gameplay feel before content growth.**

The user has chosen **Tavolo libero as the primary Merge Discovery gameplay mode**, keeping the two-slot Laboratory as a secondary accessible option.

Start by reading:

1. `AGENTS.md`
2. **`docs/tasks/PLAYFEEL_V2.md`** — current detailed task and acceptance criteria.
3. `docs/proposals/UX_1_TWO_MODES.md`
4. `docs/VISUAL_BIBLE_REFERENCE.md`
5. `docs/VISUAL_UX_ALIGNMENT.md`
6. Relevant domain, save, search, hint-safety, PWA, responsiveness and accessibility specs.

## Branch/pr relationship

Existing PRs #9–15 remain **draft/unmerged**.

- PR #13 `codex/ux-1` is the existing implementation baseline.
- Create a **separate stacked draft PR** `codex/playfeel-v2` against `codex/ux-1`, without changing #14 and #15.
- Do not treat #13 as visually/gameplay approved.
- If prototype is later approved, reconcile/rebase the CONTENT-1A/B branches #14/#15 onto the approved UI baseline as a separate integration task.

## What not to work on yet

Pause `CODEX_LONG_RUN.md` execution beyond the already-created drafts.

Do not add Phase 8B/8C content, change proposed Phase 8A canon, start Android or expand Content Studio here.

Do not merge any PR automatically.

## Acceptance

A **genuinely fluid 30-combination human playtest** on PC and smartphone is required before approval, in addition to all automated checks and recorded interactions. Animated drag-overlap and result reuse are central, not optional polish.

Follow `docs/tasks/PLAYFEEL_V2.md` strictly and deliver only the prototype as a separate draft PR.
