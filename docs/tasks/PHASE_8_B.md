# Phase 8B — Humanity, Culture and Technology

Status: **proposed canonical expansion on draft branch — approval before merge**

## Required reading
`AGENTS.md`, `CODEX_LONG_RUN.md`, `docs/HUMANITY_CULTURE_TECHNOLOGY.md`, `docs/HUMANITY_ELEMENT_SELECTION.md`, `docs/ARCANE_TRANSITION.md`, `docs/CONTENT_ROADMAP.md`, `docs/SETS_AND_PROGRESSION.md`, `docs/DATA_MODEL.md`, `docs/RESOLUTION_ENGINE.md`, `docs/DECISIONS.md`, `docs/VALIDATION_AND_TESTING.md`.

## Goal
Expand the playable natural world into a compelling Era IV bridge: **Umanità, Cultura, Tecnologia**. Target an accumulated coherent pack around **180–240 reachable elements** if quality and current authored content permit; the target is not a reason to create noise.

## Accepted design direction
- Entry bridge preference: `Mammifero + Evoluzione → Umano`, after Animal archetype exists.
- `Umano + Umano → Comunità`, then structured society, navigation, settlement, trade.
- Use authored materials `Legno`, `Metallo`, tools and processing when their recipes are valid and not conflicting.
- Cultura: `Linguaggio`, `Memoria`, `Immaginazione`, `Scrittura`, `Carta`, `Libro`, `Storia` with strong reuse.
- Tecnologia: `Strumento`, progressive transport/building/science basics, not an exhaustive tech tree.
- Prepare preferred `Storia + Immaginazione → Leggenda`, `Leggenda + Tempo → Mito` bridge without prematurely revealing a hidden Arcano Set.
- Food, professions, art genres and technical minutiae remain selective or Collection/tag-only; no combat tech dependency.

## Implementation constraints
- Preserve earlier completed content and old recipes.
- Use Tier A/B/C/D selection, justify any new real element by downstream reuse and/or collectible strength.
- Candidates marked unresolved in design docs require a labeled proposal (and ideally an alternative), not a silent claim of prior acceptance.
- If same-pair collisions arise, resolve on the draft branch using clear authored choices and report them; do not rewrite seed pairs.
- Story progression is player-discovered and gated by existing rules, not arbitrary level-only rewards.
- Increment contentVersion; add localized names/descriptions/tags/artKeys; validate known graph unlock and offline old-save reconciliation.
- Avoid introducing a new game engine, third input, technology resource system or crafting consumption.

## Verification
- Full current-content fixed-point reachability, no required blocked unlocks, all current-era Sets legitimately completable where authored.
- Backward save compatibility and no hidden data leaks.
- Graph Map local rendering under expanded content and safe hint candidate logic.
- End-to-end route from starter elements through Umano, Libro/Mito prerequisites.
- Benchmarks and PWA regression.
- Content review manifest listing every new ID/PairKey, Set, rarity/visibility, downstream reuse and unresolved decisions.

## Deliverable
Draft stacked PR to 8A. User reviews the new content graph and lore logic before merging.
