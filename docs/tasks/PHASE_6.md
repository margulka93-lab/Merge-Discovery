# Phase 6 — Codex Task

Phase 0 + 1 + 2 + 3 + 4 + 5 are merged.

## Goal

Implement the first real **Discovery Map + Tier 1–3 Hint system + information-mode behavior**.

Phase 6 should help the player understand the graph they have already discovered and reduce blind brute force without turning the game into a solver.

The Map and hints must obey the same hidden-content boundary as the Catalog, Anomaly Archive and resolver.

Do not implement Tier 4/5 hints, Resonance, PWA or final polish in this task.

## Required reading

Read before changing code:

- `AGENTS.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/HINTS_AND_FAILURE.md`
- `docs/CATALOG_AND_DISCOVERY_GRAPH.md`
- `docs/SCREEN_SPECS.md`
- `docs/UX_SCREEN_ARCHITECTURE.md`
- `docs/RESPONSIVE_AND_UI_STATES.md`
- `docs/VISUAL_BIBLE_REFERENCE.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/MOTION_AUDIO.md`
- `docs/ACCESSIBILITY.md`
- `docs/DATA_MODEL.md`
- `docs/RESOLUTION_ENGINE.md`
- `docs/PHASE_5_NOTES.md`

Inspect the existing safe Catalog/World projectors and shared disclosure helpers before adding graph/hint projection.

## Scope

### 1. Replace Map placeholder with a real route

Implement:

`/explore/map`

Optional compatibility redirect:

`/map` → `/explore/map`

The existing disclosure threshold remains canonical:

- Map available when the save owns at least 15 elements.

Before disclosure:

- route remains blocked;
- no graph metadata is exposed.

When both Anomalies and Map are available, mobile continues to use `Esplora`.

### 2. Safe graph projection

Create a pure/indexed application projection for the Map.

The visual graph may receive only safe player knowledge.

Allowed real element nodes:

- discovered elements;
- intentionally visible/glimpsed elements only if current canonical projection explicitly allows them.

Current seed should normally use discovered nodes only.

Allowed special nodes:

- observed anomaly markers;
- generic anonymous possibility markers as defined below.

Never create a node, edge, label, tooltip, accessible name or count from:

- hidden unrevealed element identities;
- secret elements;
- secret recipes;
- dormant future reactions;
- unrevealed hidden/secret Sets;
- unobserved anomalies.

Do not render hidden content and hide it with CSS.

### 3. Known recipe graph model

Represent only recipes the player has actually discovered.

A recipe is a two-input relationship.

Do not visually imply that one ingredient alone creates the result.

The graph DTO should preserve:

- recipe ID;
- input A;
- input B;
- result;
- alternate/normal known route;
- Set membership of real nodes.

The renderer may use a small reaction junction/glyph or another clear grouped-edge treatment.

A+A recipes must remain understandable.

### 4. Observed anomaly graph model

Observed anomalies may appear as unstable relationship markers between their known inputs.

Before resolution:

- no result node;
- no future result edge;
- no resolution condition.

After legitimate resolution:

- ordinary known recipe relationship may appear;
- anomaly history may remain visually distinguishable if useful.

### 5. Map modes

Implement three modes.

#### A. Ancestry — `Come ci sono arrivata?`

Selected discovered element is the focus.

Show known producing recipes recursively.

Defaults:

- mobile: depth 1;
- desktop/compact: depth 2.

Desktop may let the player choose depth 1–3.

Never traverse undiscovered recipe paths.

#### B. Possibilities — `Dove posso andare da qui?`

Selected discovered element is the focus.

Show:

- known discovered outgoing relationships;
- observed anomaly relation markers;
- safe generic undiscovered-direction markers according to information mode.

Never point an unknown marker to a real hidden node.

#### C. Set Map — `Come è costruito questo dominio?`

Select only from currently revealed Sets.

Show:

- discovered members of that Set;
- known recipe relationships among them;
- known cross-Set neighbors only when already discovered and directly connected by a known recipe.

Do not create empty slots for missing/secret members.

### 6. Map selection and URL state

Support safe deep-linkable query state, for example:

`/explore/map?element=water&mode=ancestry`

Exact query names may differ, but:

- selected element should survive reload;
- map mode should survive reload;
- Set filter/mode may survive reload;
- no durable save field is required.

If the query references an element the save does not own:

- ignore it or show generic unavailable selection;
- reveal no metadata;
- fall back safely.

### 7. Graph rendering

Visual direction:

- midnight cosmic canvas;
- restrained constellation/orbit lines;
- illustrated/symbolic element nodes;
- warm known-recipe connections;
- violet anomaly connection;
- anonymous possibility marker is visually generic.

Required interactions:

- click/tap node to focus;
- pan;
- zoom;
- zoom in/out controls;
- center/reset control;
- keyboard-accessible node selection path.

Mobile:

- one-hop/local neighborhood by default;
- pinch zoom/pan when technically practical;
- never load/render the whole mature graph at once.

Desktop:

- local progressive expansion;
- depth control for Ancestry;
- Set filter for Set Map.

A lightweight graph/pan library may be added only if justified and isolated.

Do not introduce heavy WebGL.

### 8. Accessible relationship representation

The visual graph cannot be the only Map UI.

Alongside/below it provide an accessible structured relationship view for the current selection.

At minimum:

- `Creato da`;
- `Produce`;
- `Ricette alternative conosciute`;
- `Anomalie osservate`;
- generic undiscovered-direction information allowed by current information mode.

Keyboard/screen-reader users must be able to navigate relationships without pan/zoom.

### 9. Link Map into existing screens

When Map is disclosed:

Element Detail:
- add `Apri nella Mappa`.

Set Detail:
- add `Apri mappa del Set`.

Anomaly Archive:
- for observed known inputs, optional `Vedi relazione nella Mappa` if it can navigate without implying a result.

Before Map disclosure:

- do not show dead Map links.

### 10. Safe hint candidate projection

Implement a pure/indexed hint projector.

Hint candidates for a selected owned element may consider only a currently eligible pair where:

- both inputs are already discovered;
- resolver currently returns a new safe recipe or new observed-capable anomaly direction;
- reaction is not secret;
- result is not secret;
- dormant/future mode content is excluded;
- an unrevealed hidden/secret Set is not exposed;
- partner Set identity used by Tier 3 is already player-visible/revealed.

The projector must not return exact partner ID or result ID to Tier 1–3 presentation DTOs.

Do not let React inspect raw recipe data to construct hints.

### 11. Define “currently available hint direction”

For one selected element, a direction is a unique canonical PairKey that would currently produce:

- a recipe not yet discovered; or
- an anomaly not yet observed; or
- a previously stale no-reaction that is now safely reactive.

Do not count:

- already discovered recipe on the same pair;
- repeated anomaly;
- secret/dormant/future path;
- a reaction whose existence would reveal an unrevealed hidden domain.

Alternate recipes count only if that exact recipe path remains undiscovered and is safe.

Counts refer to unique currently actionable pair directions, not total authored recipes.

### 12. Hint Tier 1

Tier 1 exposes only availability.

Examples:

> Ha ancora reazioni da scoprire con elementi che conosci.

or:

> Per ora non vedo altre piste con ciò che possiedi.

No partner, Set, result or exact count in Mystery/Balanced.

Available once Map/hint-scale threshold is met (15 owned elements), and from Element Detail when disclosed.

### 13. Hint Tier 2

Tier 2 is explicit-request only.

It gives one deterministic structural direction for a safe candidate.

Allowed clue:

- `Una delle piste resta dentro il Set di questo elemento.`
- or `Una delle piste porta verso un elemento di un altro Set che conosci.`

It must not name the partner Set yet.

Pick the candidate deterministically so the same save/context does not randomly change the clue.

No randomness.

### 14. Hint Tier 3

Tier 3 gives the partner family/Set, not the partner.

Example:

> Una delle reazioni mancanti coinvolge un elemento del Set Mondo.

Requirements:

- the named Set is already revealed/player-visible;
- exact partner name/ID remains absent;
- result remains absent.

If no safe Tier 3 clue exists, keep the strongest lower-tier clue rather than revealing more.

### 15. No Tier 4 or Tier 5

Do NOT implement:

- conceptual near-answer clue;
- exact partner reveal;
- `Acqua + Calore → ?`;
- recipe answer;
- result silhouette derived from hidden content.

Those remain future work.

### 16. Hint UI in Laboratory

Add a secondary hint control near the reaction stage.

Default:

- subtle;
- never competes with `Combina`;
- only useful when Slot A is selected.

If no Slot A:
- explain briefly that an element must be selected first.

If selected element is currently exhausted:
- say so using the existing safe language;
- do not fabricate a hint.

Suggested flow:

1. `Indizio` opens a compact sheet/panel.
2. Tier 1 appears.
3. `Dammi una direzione` requests Tier 2.
4. Tier 3 appears only when currently allowed by the stall/manual-strength rules below.

No modal stack.

### 17. Hint UI in Element Detail

When Map/hints are disclosed, Element Detail may expose:

- Tier 1 status;
- explicit `Chiedi un indizio` action;
- Tier 2/3 in a compact hint section/sheet.

Do not duplicate hint logic.

### 18. Session-only stall detection

Implement light session-only stall tracking.

Do not persist it in PlayerSave.

Progress resets stall counters when the player gets a meaningful new state such as:

- new element;
- new recipe;
- newly observed anomaly;
- Set reveal;
- Collection reveal/completion.

Known repeated recipe does not count as progress.

Track at minimum:

- consecutive no-reactions;
- experiments since meaningful progress.

Recommended thresholds:

#### proactiveHints = off

Never proactively offer.

Manual Tier 1/2 remains available.

Tier 3 may still be reached by explicit request after the player has already requested Tier 2 for that context.

#### proactiveHints = light

Offer `Vuoi un indizio?` after either:

- 5 consecutive no-reactions; or
- 10 experiments without meaningful progress.

#### proactiveHints = normal

Offer after either:

- 3 consecutive no-reactions; or
- 6 experiments without meaningful progress.

Thresholds are UI/application tuning constants, not canonical content.

After the player declines:

- suppress another proactive offer until at least 3 additional experiments or meaningful progress.

No timers.

### 19. Tier 3 availability

Tier 3 may become available when at least one condition is true:

- proactive hint stall threshold has been reached;
- player has explicitly requested a clearer hint after seeing Tier 2 in the same selected-element context.

This is free.

No currency, ad, cooldown or reward penalty.

### 20. Information modes become functional

Expose existing save setting:

`informationMode: mystery | balanced | collector`

in Settings.

Also expose existing:

`proactiveHints: off | light | normal`

No save schema change.

#### Mystery

- no exact missing direction counts;
- Possibilities Map shows no anonymous unknown-direction nodes by default;
- hints are manual unless proactiveHints itself is enabled;
- Catalog keeps conservative wording.

#### Balanced

Default.

- no exact count;
- Possibilities Map may show one aggregate anonymous `Possibilità non esplorate` marker when safe directions exist;
- Tier 1 safe status available.

#### Collector

- may show exact count of currently safe actionable PairKey directions;
- Possibilities Map may render one anonymous marker per currently safe direction, or a clearly counted aggregate if rendering is cleaner;
- still no partner identity before Tier 3;
- secrets/dormant/hidden domains excluded from count.

Information mode is not a difficulty flag and changes no rewards/outcomes.

### 21. Possibility count/source of truth

Map, Catalog status and hints should use one shared safe current-direction selector wherever practical.

Do not create three subtly different definitions of “has possibilities”.

If Phase 4 `CatalogElement.possibilities/exhausted` needs a minimal refactor to consume the new helper, that is allowed and preferred.

Document any such refactor in the PR.

### 22. Proactive hint offer

When threshold is reached and a safe hint candidate exists, show:

> Vuoi un indizio?

Actions:

- `Non ora`
- `Leggero`

After Tier 2 is visible and Tier 3 is allowed:

- `Più chiaro`

Do not interrupt with a blocking modal.

The player can keep combining without answering.

### 23. No hint telemetry/save marking

Do not persist:

- hint requested;
- hint tier used;
- “assisted” status;
- stall counters.

Do not reduce XP/rewards.

No achievement consequence.

### 24. Responsive Map behavior

Verify at minimum:

- 320×568
- 390×844
- 768×1024
- 1024×768
- 1440×900
- 1920×1080

Mobile:
- graph first/local;
- mode selector compact;
- relationship list below;
- hint sheet/full-width panel;
- no horizontal page overflow.

Desktop:
- graph canvas dominant;
- controls around canvas;
- relationship inspector/list side or below.

State survives breakpoint/orientation changes.

### 25. Accessibility

Required:

- visual graph has an accessible name/description;
- graph nodes are keyboard-focusable or have an equivalent keyboard list that changes the same selection;
- accessible relationship view contains all gameplay-relevant known graph information;
- zoom/pan is never required to access information;
- controls have text/accessible names;
- hint levels announced without leaking future content;
- proactive offer is non-blocking and screen-reader accessible;
- reduced motion removes large graph/reveal transitions;
- forced colors/high contrast preserve node/edge/state distinctions;
- 200% zoom remains usable;
- touch controls aim for 44×44.

### 26. Performance

Map architecture must remain viable at 1,000+ definitions.

Do not render the global mature graph.

Projection should build:

- current local neighborhood;
- currently selected ancestry depth;
- selected Set subgraph.

Use content/save indexes and memoization.

Add a synthetic profiling/smoke test if useful.

## Required reusable pieces

At minimum:

- DiscoveryMap
- MapControls
- MapNode
- accessible RelationshipExplorer/List
- map projector/selectors
- safe current-direction selector
- hint projector
- HintPanel/HintSheet
- ProactiveHintOffer
- InformationMode controls in Settings

Reuse existing ElementArt, AppShell, visibility and save preferences.

## Required tests

### Map disclosure/routes

- Map blocked before threshold;
- Map available at threshold;
- invalid/undiscovered `element` query leaks no metadata;
- mobile Esplora links to real Map.

### Graph knowledge boundary

- only discovered/legitimately visible nodes;
- hidden/secret nodes absent from DTO, DOM, accessible labels and counts;
- only discovered recipes create known recipe relationships;
- unobserved anomaly absent;
- observed anomaly present without result;
- A+A relationship represented correctly;
- alternate known recipe represented as a separate known route.

### Map modes

- Ancestry depth 1/2 behavior;
- Possibilities known outputs;
- Set Map only revealed Sets;
- known cross-Set neighbor safe;
- mobile local neighborhood does not render global graph.

### Information modes

- Mystery no unknown direction count/marker;
- Balanced aggregate safe marker only;
- Collector exact safe actionable-direction count;
- all three exclude secret/dormant/unrevealed-hidden paths.

### Hints

- Tier 1 exposes no partner/result;
- Tier 2 only same/different-Set structural direction;
- Tier 3 only revealed Set name;
- no DTO field contains partner/result identity for Tier 1–3;
- deterministic clue selection;
- exhausted element produces no fake hint;
- hidden Set candidate is excluded;
- stale failure that became safely reactive may become a hint direction.

### Stall/proactive offer

- off never proactively offers;
- light threshold;
- normal threshold;
- meaningful progress resets;
- decline suppresses next 3 experiments;
- no timer/save persistence;
- manual hint remains available.

### Existing screens

- Element Detail Map link only after disclosure;
- Set Detail Map link only after disclosure;
- existing Catalog exhaustion uses the shared safe-direction logic or remains exactly equivalent;
- settings persist informationMode/proactiveHints.

### Accessibility/E2E

- keyboard selects a Map element through accessible relation view;
- relationship list mirrors known graph facts;
- hint sheet focus/close behavior;
- 320 px no overflow;
- 200% zoom;
- reduced motion;
- axe scan on Map and hint UI.

### Regression

All Phase 0–5 unit/component/E2E tests remain green.

Canonical seed remains:

- 67/67 reachable;
- max depth 11;
- no blocked required unlocks;
- 4 Collections;
- 1 unresolved anomaly.

## Screenshot evidence required

Use legitimate save states.

Include:

1. `1440×900` — Map Ancestry focused on a mid/late discovered element with multiple known ancestors;
2. `1440×900` — Possibilities mode in Balanced or Collector, showing safe anonymous direction treatment;
3. `1440×900` — Laboratory hint panel with Tier 2 or safe Tier 3 clue;
4. `390×844` — mobile Map local neighborhood;
5. `390×844` — accessible relationship view / Map inspector;
6. `320×568` — Map or hint UI proving minimum-width usability.

No screenshot may inject hidden identities into the UI.

## Explicitly out of scope

Do NOT implement:

- Tier 4 hint;
- Tier 5 exact partner hint;
- Resonance;
- pinned Collection objectives;
- achievements;
- global full-graph rendering;
- PWA/service worker/update flow;
- Android/Capacitor;
- final art;
- production audio;
- new canonical recipes/elements;
- Arcano content;
- backend/cloud;
- monetization;
- analytics.

## Delivery

Work on a dedicated branch and open a PR.

PR description must include:

- graph projection architecture;
- recipe/anomaly representation semantics;
- hidden-content safeguards;
- Map modes and local-neighborhood strategy;
- hint candidate safety rules;
- information-mode behavior;
- stall/proactive-hint behavior;
- any minimal Phase 4 selector refactor;
- responsive/accessibility behavior;
- screenshots listed above;
- commands run;
- unit/component/E2E results;
- validator/reachability results;
- explicit confirmation Phase 7 was not started.

Do not extend scope.
