# Phase 8A — Life/Animals and first expanded playable pack

Status: **proposed canonical expansion on draft branch — approval before merge**

## Required reading
`AGENTS.md`, `CODEX_LONG_RUN.md`, `docs/CONTENT_ROADMAP.md`, `docs/LIFE_PLANTS_FUNGI_ANIMALS.md`, `docs/IMPLEMENTATION_SEED_CONTENT.md`, `docs/SETS_AND_PROGRESSION.md`, `docs/DATA_MODEL.md`, `docs/DECISIONS.md`, `docs/RESOLUTION_ENGINE.md`, `docs/VALIDATION_AND_TESTING.md`, `docs/SAVE_AND_VERSIONING.md`.

## Goal
Extend the 67-element seed into the first substantial pack, **target 120–160 reachable elements**, primarily deepening Life/Plants/Fungi/Animals and seeding early Humanity only when the route is already well specified.

## Rules
- The 67-element seed is immutable. Do not silently change any existing recipe or pair outcome.
- Use the accepted/preferred designs when unambiguous. Content-design drafts are not automatically canon: mark each newly authored recipe as `accepted-in-spec`, `preferred-proposal`, or `new-proposal` in a review manifest.
- No ambiguous pair collisions, no same-pair different success without authored distinct conditions, no forced arbitrary species recipe.
- Introduce Animals as one Set; families as tags/Collections where appropriate, few archetypes as meaningful elements.
- First animal route should build from existing `Creature`/Vita graph; prefer `Creatura + Oceano → Pesce` if validated.
- Balance aquatic, bird, small-creature, mammal branches; use recognizable species with downstream reuse.
- Ensure roots/reveals/level eligibility are attainable under real resolver simulation, not hand-waving.
- Maintain hidden Funghi reveal, existing anomaly and old visible completion behavior.
- All new content is data + localization + authored metadata, ideally no domain modifications.
- Increment contentVersion without altering saveSchemaVersion; test a fully progressed old save imported into new content and stale tested pairs.
- Add/update Collections only with reviewed reveal/visibility, no hidden denominators.

## Verification
- 67 old definitions/recipes unchanged, old seed regression green.
- New full pack reachability from 4 starters = 100%, no blocked Set unlock, max depth reported (not hard-coded to 11 after expansion).
- No spoiler leaks (search/graph/hints/completion/deep links), especially around newly announced Animal Set.
- Explicit deterministic pair ambiguity and A+A tests.
- No increase to hand-authored derived logic in React.
- Documentation: full element/recipe diff table, Set sizes, contentVersion, newly proposed canon and why, reachability chains, screenshot of Animal Set/selected discoveries.
- Execute full unit, component, E2E, production PWA and profiling gates.

## Deliverable
Draft stacked PR to Phase 7.5C. No new unapproved recipe is silently declared canon; mark all candidate choices for human content review before merging.
