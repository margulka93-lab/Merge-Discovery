# CODEX_TASK.md — Phase 5

Phase 0 + 1 + 2 + 3 + 4 are merged.

## Goal

Implement the first complete **Progressive Disclosure + Anomaly Archive + Thematic Collections** layer on top of the playable Laboratory and field-guide catalog.

Phase 5 should make the world feel reactive:

- newly revealed features become truly available only when earned;
- observed anomalies become a real revisitable archive;
- starter Collections become visible goals;
- Collection completion is persisted and celebrated;
- hidden Set reveals, especially Funghi, receive the correct presentation weight.

Do not implement the Discovery Map or the full hint system in this task.

## Required reading

Read before changing code:

- `AGENTS.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/COLLECTIONS_AND_OBJECTIVES.md`
- `docs/CATALOG_AND_DISCOVERY_GRAPH.md`
- `docs/SCREEN_SPECS.md`
- `docs/UX_SCREEN_ARCHITECTURE.md`
- `docs/FIRST_SESSION_EXPERIENCE.md`
- `docs/VISUAL_BIBLE_REFERENCE.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/MOTION_AUDIO.md`
- `docs/ACCESSIBILITY.md`
- `docs/DATA_MODEL.md`
- `docs/RESOLUTION_ENGINE.md`
- `docs/SAVE_AND_VERSIONING.md`
- `docs/IMPLEMENTATION_SEED_CONTENT.md`
- `docs/PHASE_4_NOTES.md`

Inspect the merged Phase 3/4 routing and catalog projections before adding new state.

## Scope

### 1. Finish progressive disclosure with real route guards

The UI currently hides destinations progressively; Phase 5 must make direct routing obey the same feature boundary.

Required behavior:

- `/` Laboratory: always available.
- `/elements/:elementId`: available for discovered elements even before Collection unlock, because `Vedi scheda` may legitimately link there.
- `/collection`: only after the Collection feature has been disclosed by the existing first-session rule.
- `/sets` and `/sets/:setId`: only after the Sets feature is disclosed.
- `/collections` and `/collections/:collectionId`: only after Collection is disclosed and the specific thematic Collection is visible.
- `/explore/anomalies`: only after at least one anomaly has been observed.
- future Map route may remain a placeholder when its existing threshold is met.

Blocked feature routes should:

- redirect to Laboratory or a generic unavailable page;
- reveal no feature/content metadata beyond what the player already knows;
- never expose hidden Set/Collection/anomaly identities.

Element Detail must not link into a Set browser that is not yet disclosed; show the Set label as plain text until the route is legitimate.

### 2. Real Anomaly Archive route

Implement:

`/explore/anomalies`

Optional backward-compatible redirect:

`/anomalies` → `/explore/anomalies`

The archive is absent from navigation before the first observed anomaly.

### 3. Safe anomaly projection

Create an application/domain-safe projection for observed anomalies only.

Each archive entry may expose:

- known input A;
- known input B;
- first observed date/time in a compact local format;
- current safe status;
- resolved result only if already legitimately resolved/discovered.

Never expose:

- future result name;
- future recipe;
- hidden Set;
- internal resolution condition;
- category if it would function as a spoiler.

### 4. Anomaly states

Support the future-safe state model:

#### Instabile
Observed and the current resolver still yields the anomaly.

#### Inerte
Observed, unresolved, and current content no longer produces an active anomaly/revisitable result.

Use only when this state genuinely occurs; do not force it for the current seed.

#### Riesaminabile
Observed unresolved anomaly whose authored non-secret resolution is now currently eligible.

Display:

> Qualcosa è cambiato.

Do not show the result.

#### Risolta
`resolvedAt` exists.

Only then may the archive show the already-discovered result and link to its Element Detail.

Current seed remains unresolved.

### 5. “Riprova nel Laboratorio”

Archive entries may offer:

`Riprova nel Laboratorio`

Behavior:

1. explicit player action;
2. navigate to Laboratory;
3. replace current Slot A/B with the anomaly inputs;
4. do NOT auto-combine;
5. preserve the normal explicit Combine action.

This must reuse the same Lab state and resolver pipeline.

### 6. Thematic Collections routes

Implement:

- `/collections`
- `/collections/:collectionId`

No permanent top-level navigation item is required; surface Collections primarily from `/collection`.

### 7. Collection visibility

Use the existing authored `visibility.collectionReveals`.

Seed Collection reveal rules are canonical and unchanged:

- Ciclo dell’acqua
- Figli delle stelle
- Mondo roccioso
- Verde ovunque

Before reveal:

- no card;
- no search hit;
- no direct-route identity;
- no reserved blank slot.

After reveal:

- name/description/progress are visible;
- only safe member knowledge is shown.

### 8. Collection projection and completion

Create a pure completion helper.

For a Collection without authored chapters:

- treat the Collection itself as its base completion unit;
- durable completion ID = `collection.id`.

For a Collection with chapters:

- durable completion IDs = authored chapter IDs.

Do not invent synthetic random IDs.

Completion counts only currently active/eligible non-secret members according to the existing visibility rules.

Persist completion in:

`completedCollectionChapterIds`

Do not add a new save schema field.

### 9. Collection completion event

Add a proper domain/application event:

`collection_completed`

It must:

- be deterministic;
- fire once per completion unit;
- project into PlayerState;
- persist through `projectResolution`;
- never farm on repeat combinations.

No XP, currency, cosmetic or gameplay reward is added in Phase 5 unless already authored in canonical data.

Do not extend progression reward schema merely to invent a Collection reward.

### 10. Backfill old saves safely

Existing saves may already satisfy a Collection before Phase 5.

During load/reconciliation:

- detect already-complete visible Collection units;
- add missing durable completion IDs;
- preserve all prior progress;
- do not award XP;
- do not replay a fake “just completed” celebration on load;
- do not reveal hidden Collections merely because their members happen to exist if the authored reveal path has not been met.

Add explicit tests for this compatibility behavior.

### 11. Collections index

`/collections` should show only visible thematic Collections.

Recommended ordering:

1. incomplete, closest to completion;
2. other active;
3. completed.

Collection card:

- name;
- description excerpt;
- discovered / visible total;
- progress;
- completed/earned state;
- optional “new possibilities” wording only if safely derivable without revealing a solution.

No global hidden total.

### 12. Collection detail

Show:

- Collection name;
- description;
- visible progress;
- discovered members as normal cards/links;
- missing active members only as generic undiscovered slots/counts, without names, artKeys, Sets or metadata;
- completed/earned state.

Do not turn Collection Detail into a hint screen.

Do not show exact missing identities.

### 13. Collection section on Collection Home

Add a clearly separate **Collezioni tematiche** section to `/collection`.

Keep Sets and Collections conceptually distinct.

Show a small useful subset such as:

- near completion;
- recently revealed;
- completed.

Provide a link to all visible thematic Collections.

### 14. Collection completion presentation

Collection completion is lighter than Set reveal.

When a combination completes a Collection:

- show a compact persistent banner/card inside the result experience;
- do not interrupt with a full-screen modal;
- do not override a stronger Set reveal.

Suggested copy:

> Collezione completata: Ciclo dell’acqua

If multiple Collection completions occur together, compose them into one presentation block.

### 15. Collection reveal presentation

When a discovery makes a thematic Collection newly visible:

- use a small “nuovo obiettivo/nuova collezione” callout;
- lighter than new element and Set reveal;
- no forced navigation.

Derived reveal presentation should compare previous vs next safe visibility in the application layer rather than persisting another duplicate truth.

### 16. Event celebration hierarchy

Implement the locked relative hierarchy:

1. known result
2. alternate recipe
3. new element
4. Collection reveal/completion
5. normal Set reveal
6. hidden Set reveal
7. Era-defining discovery
8. supernatural/anomaly culmination

For Phase 5, the implemented levels are:

- known/alternate/new element;
- Collection reveal/completion;
- normal Set reveal;
- hidden Set reveal;
- anomaly.

If several happen in one combine:

- compose one coherent result state;
- strongest event controls visual emphasis;
- weaker events remain readable inside the same result surface;
- never stack modal after modal.

### 17. Hidden Funghi reveal

The canonical seed reveal remains:

`Vita + Umidità → Muffa`

which reveals hidden Set `Funghi`.

Do not change the recipe or unlock.

Presentation requirement:

- treat Funghi as a **hidden Set reveal**, stronger than a normal Set reveal;
- temporarily shift the Laboratory reveal environment toward its Set accent/motif;
- show a concise thematic line;
- return to the normal Laboratory shell after the reveal state ends.

Do not permanently recolor the Lab.

Reduced-motion mode must preserve hierarchy without animation.

### 18. Set reveal distinction

Application presentation data should distinguish:

- normal Set reveal;
- hidden Set reveal;
- secret Set reveal future-safe.

Do not infer hierarchy from localized names.

Use canonical Set visibility/reveal metadata.

### 19. Anomaly navigation integration

Desktop:

- Anomalie becomes a real destination after first observation.

Mobile:

- maintain max five destinations;
- when both Map and Anomalies are available, `Esplora` groups them;
- Esplora page lists real Anomalie plus Map placeholder until Phase 6.

Do not expose Anomalies early merely because the route exists.

### 20. Collection/Anomaly visual direction

Collections:

- field-guide paper surfaces;
- illustrated/symbolic member cards;
- restrained progress treatment;
- optional warm accent.

Anomalies:

- dark glass / midnight background;
- restrained violet/indigo refraction;
- incomplete orbital geometry;
- same global shell;
- no heavy glitch/strobe.

### 21. Accessibility

Required:

- route guards do not create keyboard traps;
- archive and Collection cards have semantic links/buttons;
- progress has accessible labels;
- generic missing Collection slots do not expose hidden names through accessible text;
- `Riprova nel Laboratorio` has clear accessible purpose;
- completion/reveal callouts are announced once through an appropriate live region;
- no color-only anomaly/completion state;
- 44×44 touch targets;
- reduced-motion/high-contrast/text-size preferences remain honored.

### 22. Performance / architecture

Do not:

- scan the full content package repeatedly inside React render;
- create a full pair matrix;
- persist derived visibility;
- duplicate resolver logic in UI.

Prefer indexed application projections similar to Phase 4.

## Explicitly out of scope

Do NOT implement:

- Discovery Map / graph canvas;
- graph neighborhood exploration;
- Tier 1–5 hint UI;
- Resonance;
- player information-mode behavior beyond already-existing safe defaults;
- pinned Collection objective in the Laboratory;
- new save field solely for objective pinning;
- achievements;
- PWA/service worker;
- Android/Capacitor;
- final production art;
- production audio;
- new canonical elements/recipes/Collections;
- Arcano resolution content;
- backend/cloud;
- monetization;
- analytics.

The designed “pin one Collection objective to Lab” feature remains deferred because no durable canonical field exists yet and it is not required by Phase 5.

## Required tests

### Progressive disclosure

- Collection route blocked before disclosure;
- Set browser/detail blocked before disclosure;
- discovered Element Detail still works before Collection unlock;
- hidden feature direct routes leak no metadata;
- anomaly route unavailable before observation;
- navigation and route guards agree.

### Collections visibility

- each seed Collection appears only after its authored reveal path;
- unrevealed Collection absent from search/index/direct route;
- hidden/secret member metadata not leaked through missing slots or counts.

### Collection completion

- incomplete progress correct;
- first completion emits/persists exactly one `collection_completed`;
- repeat recipes do not re-complete/reward;
- base Collection completion ID uses `collection.id`;
- current completion may later expand without revoking durable earned state;
- older complete save is backfilled on load without XP or celebration.

### Collection UI

- near-complete ordering;
- completed state;
- discovered members link safely;
- missing members remain anonymous;
- Collection Home section uses only visible Collections.

### Anomalies

- seed anomaly appears only after observation;
- Instabile state for current seed;
- synthetic eligible resolution fixture becomes Riesaminabile without result spoiler;
- synthetic inactive fixture can become Inerte;
- resolved fixture shows result only when legitimately resolved/discovered;
- direct anomaly route before observation reveals nothing;
- Riprova pre-fills slots but does not combine.

### Celebrations

- Collection completion lighter than Set reveal;
- normal Set reveal presentation;
- hidden Funghi reveal uses hidden-Set emphasis;
- multiple events compose one result surface;
- reduced motion preserves all textual information.

### Regression

All Phase 0–4 unit/component/E2E tests remain green.

Canonical seed remains:

- 67/67 reachable;
- max depth 11;
- no blocked required unlocks;
- 4 seed Collections;
- 1 unresolved anomaly.

## Screenshot evidence required

Include direct product screenshots from legitimate save states:

1. `1440×900` — Collection Home with thematic Collections section;
2. `1440×900` — Anomaly Archive with `Luna + Vita`;
3. `1440×900` — hidden Funghi Set reveal result state;
4. `390×844` — thematic Collection detail;
5. `390×844` — Anomaly Archive;
6. `320×568` — Collection/Anomaly page proving minimum-width usability.

If a screenshot requires a fixture, use import preview + confirmation or another legitimate application path; do not inject hidden UI knowledge.

## Delivery

Work on a dedicated branch and open a PR.

PR description must include:

- progressive disclosure/route-guard architecture;
- Collection completion model and persistence convention;
- old-save backfill behavior;
- anomaly projection/status logic;
- celebration hierarchy;
- hidden Funghi reveal behavior;
- responsive/accessibility behavior;
- screenshots listed above;
- commands run;
- unit/component/E2E results;
- validator/reachability results;
- explicit confirmation that Phase 6 was not started.

Do not extend scope.
