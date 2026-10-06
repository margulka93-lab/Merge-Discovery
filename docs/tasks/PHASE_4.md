# Phase 4 — Codex Task

Phase 0 + 1 + 2 + 3 are merged.

## Goal

Implement the first complete **Collection/Catalog + Sets + Element Detail** experience on top of the playable Laboratory.

Phase 4 turns discovered content into a useful illustrated field guide without leaking hidden or secret content.

Do not implement the full Anomaly Archive, Discovery Map, hint system or thematic Collections flow in this task.

## Required reading

Read before changing code:

- `AGENTS.md`
- `docs/CATALOG_AND_DISCOVERY_GRAPH.md`
- `docs/SCREEN_SPECS.md`
- `docs/UX_SCREEN_ARCHITECTURE.md`
- `docs/RESPONSIVE_AND_UI_STATES.md`
- `docs/VISUAL_BIBLE_REFERENCE.md`
- `docs/VISUAL_DIRECTION.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/ACCESSIBILITY.md`
- `docs/COPY_AND_LOCALIZATION.md`
- `docs/DATA_MODEL.md`
- `docs/SETS_AND_PROGRESSION.md`
- `docs/COLLECTIONS_AND_OBJECTIVES.md`
- `docs/HINTS_AND_FAILURE.md`
- `docs/PHASE_3_NOTES.md`

Inspect the merged Phase 3 UI before introducing new components.

## Scope

### 1. Introduce real application routing

Phase 4 is the point where deep content pages become real routes.

Use React Router as specified in `TECH_SPEC.md` unless a concrete repository constraint makes that impossible.

Required routes:

- `/` → Laboratory
- `/collection` → Collection home
- `/sets` → Sets index
- `/sets/:setId` → Set detail
- `/elements/:elementId` → Element detail
- `/settings` → existing minimal settings/save tools

Existing progressive navigation must map to actual routes where Phase 4 now provides a screen.

Future routes such as anomalies/map may remain explicit placeholders only if already visible from Phase 3 disclosure.

#### Deep-link safety

Opening a URL to an element the player has not discovered must NOT expose:

- name;
- description;
- Set;
- rarity;
- recipes;
- hidden existence metadata.

Redirect safely to Collection or show a generic `Non ancora scoperto` state with no metadata.

Opening a hidden/unrevealed Set URL must likewise not expose its identity.

### 2. Collection home

Implement the primary discovery/catalog home.

Its job is to answer:

- cosa ho appena scoperto?
- dove sto facendo progressi?
- quali elementi meritano di essere rivisti?

#### Header

Show:

- total discovered count only;
- number of currently visible/revealed Sets;
- completed visible Set count if useful.

Do NOT show a global `X / total game` denominator.

#### Sections

At minimum:

1. **Recenti**
   - most recently discovered owned elements, ordered by `firstDiscoveredAt`;
   - use a bounded list/grid such as latest 8–12;
   - this is a sort/view, not a new unread-state system.

2. **Nuove possibilità**
   - owned elements from current safe `newPossibilityElementIds` / equivalent derived logic;
   - absent when none;
   - never reveal why or what future result exists.

3. **Set attivi**
   - visible/revealed Set cards;
   - announced locked Sets only if current visibility policy already permits them;
   - hidden/secret Sets absent.

4. **Preferiti**
   - discovered favorite elements;
   - absent/empty state handled cleanly.

Thematic Collections may be previewed only if the existing visibility projection makes them already visible and doing so does not create the full Phase 5 Collections flow. Do not build Collection Detail in this task.

### 3. Catalog search and filters

Search across player-visible knowledge only.

Search may match:

- discovered element name;
- visible Set name.

Do not index hidden element names, hidden Set names or secret content.

Required filters for Phase 4:

- Set;
- rarity;
- favorite;
- new possibilities;
- currently exhausted.

Sorting:

- recent discovery;
- alphabetical;
- Set order;
- rarity.

Do not create persistent `unread/new` flags in the save.

Responsive behavior:

- desktop sticky search/filter controls;
- mobile filter sheet/panel;
- no tiny controls;
- filter state survives viewport changes during the session.

### 4. Set index

Implement `/sets`.

Show only Sets allowed by the current player-facing visibility projection.

#### Revealed Set card

Show:

- name;
- icon/placeholder art;
- visible required discovered count;
- visible required total;
- completion progress;
- complete state;
- safe `Nuove possibilità` indicator if at least one owned member has new possibilities.

#### Announced locked Set

Only when policy allows:

- name;
- lock state;
- broad non-spoiler clue if authored.

Do not reserve empty positions for hidden/secret Sets.

### 5. Set detail

Implement `/sets/:setId`.

Header:

- Set art/icon placeholder;
- name;
- short description;
- visible completion;
- completion state.

Grid may contain only player-legitimate states:

- discovered element;
- intentionally visible/glimpsed element if current content actually authors that state;
- no placeholder at all for hidden/secret elements.

For the current seed, do not invent silhouettes/unknown slots merely to make the page look fuller.

Controls:

- search within Set;
- rarity filter;
- favorite;
- new possibilities;
- currently exhausted;
- sort.

Footer/secondary information may mention visible completion reward/status if already represented by current data.

Do not implement graph shortcut if it would lead to a fake Phase 6 screen.

### 6. Element detail

Implement `/elements/:elementId` for discovered elements.

#### Hero

Show:

- existing placeholder art via `artKey`;
- localized name;
- Set;
- rarity;
- favorite toggle;
- concise description.

Use the lighter **field-guide** surface inside the existing dark observatory shell.

#### First discovery

Show the player's actual first discovery recipe when available:

> Scoperto con  
> Pianeta + Cometa

Use `firstRecipeId` from durable save facts.

Starters should have an appropriate non-recipe state such as:

> Concetto iniziale

Do not fabricate a recipe.

#### Known recipes

Show only recipes the player has actually discovered.

For an element with multiple known recipe paths, list them all.

Unknown recipes:

- do not show exact partners/results;
- do not show secret recipe placeholders;
- Balanced mode may show only a vague possibilities message.

### 7. Possibilities / currently exhausted

Implement the safe per-element state defined by catalog/hint specs.

Possible messages:

- `Ha ancora reazioni da scoprire.`
- `Hai esplorato tutte le reazioni attualmente note con ciò che possiedi.`
- `Una vecchia reazione potrebbe essere cambiata.`

The computation must consider only:

- known player elements;
- current unlocked rules/domains;
- currently eligible non-secret reactions/anomalies.

Ignore:

- unrevealed secrets;
- dormant future content;
- inaccessible future modes.

This must be a deterministic derived calculation, not a persisted fact.

Prefer a pure domain/application helper with tests rather than UI scanning recipe data ad hoc.

Do not turn this into the Phase 6 hint system.

### 8. Element relationships

Element Detail should show known safe relationships.

At minimum:

- **Creato da** / known recipes producing this element;
- **Usato per** results already discovered through known recipes involving this element;
- observed anomaly involvement, but only the known pair/status and never a hidden result.

Do not build the visual Discovery Map yet.

A compact textual/card relationship section is sufficient.

### 9. Experiment history

Element Detail gets an `Esperimenti` section.

Group tested partners into:

- Successi;
- Anomalie;
- Nessuna reazione.

Rules:

- show only partner elements the player currently knows;
- stale `no_reaction` records must respect content-version authority/reconciliation;
- never render a global A×B matrix;
- untested partners are not listed as missing.

This section is memory, not a solver.

### 10. Favorites integration

Favorite toggling must work consistently from:

- Laboratory cards;
- Collection home;
- Set detail;
- Element detail.

Use the existing durable Phase 3/SaveApplication preference path.

No duplicate favorite state.

### 11. `Vedi scheda` from Laboratory

Now that Element Detail exists, add the previously deferred action for successful result states:

`Vedi scheda`

It opens the discovered result's element route.

Do not force navigation there automatically.

Returning to Laboratory should preserve sensible current experiment state where possible.

### 12. Visual direction

Collection/Set/Element surfaces use the field-guide side of the Visual Bible:

- warm ivory/paper content surfaces;
- dark observatory shell retained;
- painterly/symbolic art placeholders;
- ink-like dark text inside light reading surfaces;
- Set accent used sparingly;
- no generic admin-dashboard tables.

The switch from dark Lab to lighter catalog surface should feel intentional, not like a second unrelated app.

### 13. Responsive behavior

Verify at minimum:

- 320×568
- 390×844
- 768×1024
- 1024×768
- 1440×900
- 1920×1080

#### Collection home

Desktop:
- search/filter header;
- multi-column Set/element sections;
- optional element preview only if it does not complicate route semantics.

Mobile:
- one primary page scroll;
- stacked sections;
- 2–3 cards/row depending text scale.

#### Set detail

Desktop:
4–6 cards/row depending container.

Mobile:
2–3.

#### Element detail

Mobile:
full route/page.

Desktop:
comfortable two-column editorial layout where useful.

At 200% text zoom, content remains reachable without horizontal page overflow.

### 14. Accessibility

Required:

- semantic landmarks/headings;
- keyboard-operable filters/cards/routes;
- visible focus;
- accessible progress labels;
- favorite buttons labeled;
- no color-only completion/exhaustion/new-possibility state;
- 44×44 touch targets;
- filter sheet/panel has correct focus behavior;
- high-contrast/reduced-motion/text-size preferences from Phase 3 remain honored.

### 15. Performance

The architecture must remain viable for 1,000+ future definitions.

Phase 4 must not:

- scan every recipe repeatedly during every render;
- build a full pair matrix;
- render hidden content then CSS-hide it.

Derived catalog indexes/selectors should be memoizable/index-based.

Virtualization is not mandatory for 67 elements if profiling does not justify it, but component/data architecture must allow it later.

## Required reusable components

Implement/reuse at minimum:

- CollectionHome
- SetCard
- SetIndex
- SetDetail
- ElementDetail
- CatalogSearch
- FilterPanel / FilterSheet
- CompletionBar or ProgressRing
- PossibilityStatus
- ExperimentHistory
- RelationshipList

Reuse Phase 3:

- AppShell
- navigation
- ElementCard/ElementArt
- favorite action
- accessibility tokens/preferences.

Do not create AnomalyCard/GraphCanvas/HintCard yet unless a tiny internal primitive is strictly required.

## Required tests

### Visibility / spoilers

- hidden Set never appears in Collection home, Set index, search or direct route;
- secret element absent from search/filter/denominators;
- undiscovered element deep link exposes no metadata;
- visible completion denominator excludes unrevealed secret content.

### Collection home

- recent items ordered by first discovery;
- new possibilities only show safe known elements;
- favorites reflect durable state;
- no global hidden total.

### Set

- visible/revealed Set completion correct;
- completed Set remains complete under current content rules;
- hidden members do not create empty slots;
- new-possibility badge derives from known members only.

### Element detail

- starter shows `Concetto iniziale`;
- discovered first recipe shown correctly;
- alternate discovered recipe shown only after discovery;
- unknown recipes not exposed;
- favorite toggle persists;
- deep-link reload works for owned element.

### Possibilities / exhaustion

Test at least:

- element with eligible undiscovered known reaction → not exhausted;
- element with no current eligible non-secret reactions → currently exhausted;
- secret/dormant future recipe does not make visible status misleading;
- stale no-reaction after content update is not treated as permanently exhausted;
- observed/revisitable anomaly state is represented without result spoiler.

### Experiment history

- success/anomaly/no-reaction grouped correctly;
- unknown partners excluded;
- stale failure handling correct;
- no global matrix generated.

### Routing / accessibility

- keyboard navigation into Collection, Set and Element Detail;
- undiscovered direct route safely handled;
- mobile filter panel focus behavior;
- axe scan on Collection home + Element Detail;
- 200% text zoom no horizontal overflow for core pages.

### Regression

All Phase 0–3 tests and browser tests remain green.

Seed remains:

- 67/67 reachable;
- max depth 11;
- no blocked required unlocks.

## Screenshot evidence required

Include direct viewport screenshots from the implemented product:

1. `1440×900` — Collection home with Set cards and recent discoveries;
2. `1440×900` — Element Detail for an element with at least two discovered recipes, preferably Acqua;
3. `390×844` — Set detail;
4. `390×844` — Element Detail;
5. `320×568` — Collection or Set page proving minimum-width usability.

Use a legitimate save fixture/import path; do not expose content the save does not own/reveal.

## Out of scope

Do NOT implement:

- full thematic Collections browser/detail;
- Collection objectives/pinning;
- full Anomaly Archive;
- anomaly revisit flow UI;
- Discovery Map/graph canvas;
- hints/resonance;
- PWA/service worker;
- Android/Capacitor;
- final production art;
- production audio;
- new canonical elements/recipes;
- Arcano content;
- backend/cloud;
- monetization;
- analytics.

## Delivery

Work on a dedicated branch and open a PR.

PR description must include:

- routing architecture;
- catalog/application selector architecture;
- visibility/spoiler safeguards;
- completion/exhaustion computation;
- component inventory;
- accessibility behavior;
- responsive behavior;
- screenshots listed above;
- commands run;
- unit/component/E2E results;
- validator/reachability results;
- explicit confirmation that Phase 5 was not started.

Do not extend scope.
