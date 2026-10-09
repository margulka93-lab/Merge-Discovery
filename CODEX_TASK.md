# CODEX_TASK.md — Discovery-first consolidation after Isolario Foundation

## Current state

- **PR #17 Isolario Foundation is merged into `main`**.
- PR #18 Isolario Concept Proof is now a **draft based on `main`**, not yet approved or merged.
- The user has clarified a critical product rule: **discovering combinations/elements remains the main gameplay; the Island/Mondo is a secondary screen showing world consequences, and the Atlas records knowledge plus manifested changes.**

**Primary product direction:** `docs/DISCOVERY_FIRST_WORLD_ATLAS.md`.

## Immediate next task: harden PR #18, no blanket merge

Read `AGENTS.md`, `docs/DISCOVERY_FIRST_WORLD_ATLAS.md`, `docs/ISOLARIO_FEASIBILITY_REVIEW.md`, `docs/ISOLARIO_CHECKPOINT_APPROVED.md`, and relevant renderer/PWA, save, responsive and accessibility docs.

Work **in existing branch/PR #18**, base `main`, preserving the technical contracts from #17. Do not create a massive integration of historic PRs.

1. Keep route `/` as discovery/combinations home. The Island remains a separate `/island` route and never mandatory for discovering new elements.
2. Add a small, accessible, responsive **Mondo** entry point in the existing navigation, gated only by an appropriate obvious product rule (no hidden-spoiler metadata), and a clear one-step return to **Scopri**. Do not redesign the entire main Laboratory here.
3. Reframe the Island's in-scene A+B tray as optional/contextual. No duplicate resolver; Island visits should primarily let the player see and manifest consequences of discoveries made in Scopri.
4. If an owned element now enables a valid world action, expose a restrained `Nuova possibilità nel Mondo` cue through the safe world projector, not raw manifest lists. Do not require an island visit for progression.
5. Optimize the five runtime island raster images from ~9.25MiB toward **≤5 MiB combined**, measuring actual bytes, alpha quality, visual comparison and production PWA precache. Use appropriately downsampled WebP/AVIF if browser support and quality allow. Do not simply increase a budget threshold or add unsafe runtime image caching.
6. Keep Atlas as prototype first page, recording only actual safe knowledge and committed changes; don't present it as the complete editorial book yet.
7. Preserve old/save world compatibility, no content changes, no new XP/Set unlocks, update-safe rules and offline boot. Run old+new E2E, production PWA, 320/390/1440 screenshots, visual before/after raster comparisons.
8. Document manual playtest still pending and portability limitation: canonical save export is NOT a combined world+save backup.
9. End with PR still **draft** and no merge. Require approval after screenshots and the player's desktop/mobile playtest.

## Don't merge historic drafts indiscriminately

- #9–11 visual system: selective future integration, not all commits.
- #13/#16 old free table: not approved as definitive primary interaction; extract helper logic only.
- #14/#15 runtime content importer/Studio: preserve and later extract to independent PRs not dependent on abandoned UI.
- #12 Phase 8A: candidates remain unapproved canon.

Keep the canonical 67 elements unchanged. Do not start Android, full archipelago, content expansion or mass art asset production.

## Result expected

PR #18 updated as a lightweight, discover-first **optional World screen** with optimised assets and no core game regressions. After review, separately plan a dedicated Scopri experience and full Atlante integration.
