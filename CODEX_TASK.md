# CODEX_TASK.md — Isolario + Atlante Vivente: architecture checkpoint

## New product direction

The user has selected **Isolario + Atlante Vivente**:

- grow a painterly, interactive island/world through discoveries;
- let the player visibly transform and inhabit the world;
- maintain a living illustrated Atlas that records discoveries and actual changes;
- reuse the existing Merge Discovery resolver/content/save/visibility/PWA systems instead of rewriting them.

Read **`docs/proposals/ISOLARIO_ATLANTE_MIGRATION.md`** for the detailed proposal.

## Immediate next Codex work (when explicitly launched)

**Architecture-only checkpoint, not a mass implementation or rewrite.**

1. Read `AGENTS.md`, the Isolario migration proposal, and current domain/save/world/importer/UI architecture.
2. Audit pending PRs #9–16 and identify which modules/commits to reuse selectively.
3. Recommend a clean base branch and safe stacking/rebase plan **without merging anything**.
4. Specify interfaces and data contracts for `WorldState`, `WorldRepository`, world manifestations, safe projections, Atlas view and renderer.
5. Outline a constrained 1-island, 15–20-discovery interactive proof-of-concept, with desktop/mobile test gates and realistic art-asset needs.
6. Write an ADR/architecture plan and a bounded Codex task for the prototype. **Do not implement the prototype before the user reviews the checkpoint.**

## Paused work

- Old `PLAYFEEL_V3.md` remains archived but is no longer the current goal.
- PRs #9–16 remain as-is, without automatic approval/merge.
- Do not expand Phase 8B/8C, rewrite 67 seed recipes, or start Android.
- Do not duplicate the existing resolver, save engine or Content Studio.
- Do not assume that a game with a small world background behind the old FreeTable fulfills this new direction.

## Approval gates

The user must approve the first world's *interaction concept and visual direction*, and the resulting prototype must pass a real human playtest on PC/phone.

A green CI run alone does not validate the concept.
