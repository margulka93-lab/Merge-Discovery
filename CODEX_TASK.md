# CODEX_TASK.md — Phase 7.5

Phase 0–7 are merged.

## Goal

Perform a deliberate **Visual & UX Alignment** pass before Phase 8 content expansion.

Unlike Phase 7, this task **IS allowed and expected to redesign screen composition**.

The current screens are functionally correct but are not considered visually final.

The target is the canonical Merge Discovery concept:

- modern magical observatory;
- dark illustrated field guide/catalog;
- midnight blue + warm gold;
- fine warm-gold framing and celestial detail;
- painterly/symbolic element presentation;
- compact editorial rather than dashboard hierarchy.

Gameplay/data semantics must remain unchanged.

## Required reading

Read before changing code:

- `AGENTS.md`
- `docs/VISUAL_UX_ALIGNMENT.md`
- `docs/VISUAL_BIBLE_REFERENCE.md`
- `docs/VISUAL_DIRECTION.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/SCREEN_SPECS.md`
- `docs/UX_SCREEN_ARCHITECTURE.md`
- `docs/RESPONSIVE_AND_UI_STATES.md`
- `docs/MOTION_AUDIO.md`
- `docs/ACCESSIBILITY.md`
- `docs/PHASE_7_NOTES.md`

Also inspect current Phase 7 production screenshots before changing the UI.

## Core instruction

**Do not preserve an existing layout merely because it is already implemented.**

If a current page reads like a generic dashboard and the visual brief calls for an illustrated field-guide/observatory composition, restructure it.

At the same time, do not alter gameplay truth or safe projections.

## Scope

### 1. Establish one coherent dark visual world

The original Design Bible is the primary visual target.

All in-game screens remain part of the same dark midnight/navy product.

#### Observatory emphasis

Used by:

- Laboratory;
- Discovery Map;
- Anomaly Archive;
- Explore context.

Characteristics:

- cosmic/orbital depth;
- stronger celestial linework;
- gold discovery focus;
- violet anomalies.

#### Catalog / illustrated field-guide emphasis

Used by:

- Collection Home;
- Sets;
- Set Detail;
- Thematic Collections;
- Element Detail.

Characteristics:

- still dark navy/blue, as in the original `Catalogo – Elemento` concept;
- thin warm-gold borders and dividers;
- larger illustrated specimens;
- compact chips/metadata;
- editorial hierarchy through composition and typography;
- restrained Set accents.

**Do not introduce ivory/cream page backgrounds as the default knowledge-screen treatment.**
The pale panels at the bottom of the Design Bible are documentation diagrams, not game UI examples.

Do not create two unrelated applications.

### 2. AppShell/navigation redesign

Refine desktop rail and mobile bottom navigation.

Desktop goals:

- quieter/less boxed;
- stronger brand identity;
- compact Discovery Level;
- active state clear without giant navigation cards;
- screen content gets the visual focus.

Mobile:

- preserve max five destinations;
- safe-area compatible;
- visually lighter;
- icon/text hierarchy where appropriate;
- no reduced accessibility labels.

Do not change disclosure logic.

### 3. Knowledge-family shell

Create a coherent shared visual shell for:

- `/collection`
- `/sets`
- `/collections`

Use secondary navigation such as:

- Panoramica
- Set
- Collezioni

Only show sections whose feature is currently disclosed.

Routes remain unchanged and deep links remain valid.

This is a visual/IA grouping, not a new gameplay feature.

### 4. Collection Home full redesign

This is a priority screen.

Rebuild it as the **field-guide landing page**, not a dashboard.

Required hierarchy:

1. recent discoveries as a visually strong editorial shelf/hero;
2. active/revealed Sets as the primary knowledge structure;
3. new possibilities as a contextual revisit shelf;
4. thematic Collections as curated goals;
5. favorites as a compact personal shelf.

Rules:

- no KPI dashboard grid;
- no repeated equal-weight white cards;
- no global hidden denominator;
- preserve all existing spoiler safety;
- preserve search/filter utility, but demote controls visually below content identity.

Desktop and mobile may use different composition while keeping the same information architecture.

### 5. Sets index redesign

Make Sets feel like illustrated chapters/domains.

Cards/plates should prioritize:

1. identity/art/motif;
2. name;
3. quiet progress/completion;
4. safe new-possibility state.

Announced locked Set remains restrained.

Hidden Set absent.

### 6. Set Detail full redesign

Create a strong chapter-opening header.

Required:

- thematic Set motif/art placeholder;
- Set name;
- concise thematic description;
- completion integrated into header;
- dark illustrated element grid below.

Filters/search remain useful but visually secondary.

Do not expose hidden elements.

### 7. Element Detail full redesign

Priority screen.

Desktop:

- editorial two-column layout;
- large hero art;
- name/Set/rarity/favorite integrated;
- readable prose/relationship sections.

Reduce equal-weight panel stacking.

Use visual hierarchy for:

- first discovery;
- known recipes;
- possibilities;
- relationships;
- experiments/history.

Mobile:

- one natural reading flow;
- large hero first;
- no cramped cards-within-cards.

### 8. Recipe/relationship visual language

Introduce/reuse a visual recipe component:

`A + B → Result`

Use ElementToken/mini art when suitable.

It must support:

- A+A;
- alternate recipe;
- known production;
- anomaly relationship where safe.

No tables.

No undiscovered recipe spoilers.

### 9. Laboratory visual alignment

Do not alter interaction behavior.

Refine the current Lab to match the concept more strongly.

Priorities:

- central experiment visually dominant;
- right library visually subordinate;
- slots look like elements placed into an observatory instrument;
- reaction surface feels integrated with orbit/sigil language;
- card metadata reduced;
- stronger art-to-text ratio;
- less panel-on-panel chrome.

Preserve:

- explicit Combine;
- all result actions;
- hints;
- save semantics;
- accessibility.

### 10. Element cards

Redesign ElementCard variants as one coherent collectible system.

Default priority:

1. art;
2. name;
3. one state cue only when needed.

Required variants remain safely distinguishable:

- default;
- selected;
- favorite;
- new;
- tested no-reaction;
- known success;
- anomaly;
- new possibilities;
- exhausted.

Do not solve state overload by stacking many badges.

No color-only state.

### 11. Thematic Collections redesign

Collections must not look like copied Set screens.

Index/detail should feel curated:

- title/description;
- progress;
- member specimens;
- anonymous missing positions only when already permitted;
- lighter/objective-oriented visual language.

Preserve completion persistence and route guards.

### 12. Anomaly Archive visual redesign

Retain all Phase 5 semantics.

Make each anomaly feel like a recorded unstable phenomenon:

- input pair as primary visual;
- incomplete orbit/sigil;
- status;
- observation metadata;
- Retry action.

Avoid settings/history-row aesthetics.

No future result leakage.

### 13. Discovery Map visual polish

Do not rewrite graph logic.

Improve:

- canvas atmosphere;
- focus hierarchy;
- recipe junction readability;
- anomaly edge grammar;
- node art framing;
- controls;
- relationship inspector integration.

The accessible relationship list remains first-class.

### 14. Settings visual cleanup

Do not redesign behavior.

Separate:

- gameplay/information preferences;
- accessibility;
- audio;
- install/update;
- advanced local save/import/recovery.

Normal settings should not look like diagnostics.

Advanced save tools may remain more technical.

### 15. Page headers and section hierarchy

Create a shared editorial language for:

- eyebrow/context;
- page title;
- short explanatory line;
- optional action;
- section heading;
- supporting count/progress.

Avoid every page inventing its own header style.

### 16. Progress components

Reduce progress-bar repetition.

Use the best component per context:

- Set card: quiet fraction/ring/bar;
- Set header: integrated completion;
- Collection objective: compact progress;
- Discovery Level: distinct but consistent.

No fake precision or hidden totals.

### 17. Placeholder art system polish

Keep `artKey` stable.

Improve the generic SVG/art renderer so current seed elements feel more illustrative and concept-consistent.

Allowed:

- Set-based backplates;
- elemental silhouettes;
- orbit/ring motifs;
- subtle texture/pattern;
- variation by semantic artKey category.

Do not manually create final 67 production illustrations.

No external copyrighted assets.

### 18. Typography

Introduce a local/system editorial display stack for:

- brand;
- page titles;
- discovery names;
- Set chapter headings.

Keep body/control text in the readable sans-serif stack.

No remote font/CDN dependency.

### 19. Responsive redesign

Verify and intentionally compose at:

- 320×568
- 390×844
- 768×1024
- 1024×768
- 1440×900
- 1920×1080

Do not merely let desktop CSS wrap.

Specific checks:

- Collection Home editorial hierarchy survives mobile;
- Set header does not consume the whole phone;
- Element hero remains useful;
- Lab Combine remains immediately reachable;
- catalog/archive surfaces do not cause horizontal overflow;
- 200% zoom still works.

### 20. Motion integration

Use existing Phase 7 semantic tiers.

The redesigned visuals may reinterpret the animation style but must preserve:

- tier hierarchy;
- update/reveal safe-point semantics;
- reduced-motion behavior;
- no persistence dependency on animation.

### 21. PWA/offline compatibility

All new UI CSS/assets must be compatible with current precache strategy.

Production offline tests remain green.

Do not modify service-worker/update behavior unless required by new static asset paths.

### 22. Accessibility

No visual improvement may regress Phase 7 accessibility.

Required:

- 44×44 touch targets;
- keyboard routes;
- visible focus;
- semantic headings/landmarks;
- no color-only state;
- forced colors;
- high contrast;
- reduced motion;
- extra-large text;
- 200% zoom;
- accessible progress labels.

The manual NVDA/JAWS/VoiceOver release checklist remains explicitly pending unless a human executes it.

### 23. Visual regression evidence

Tests are necessary but screenshots are the primary acceptance evidence for this phase.

Provide BEFORE and AFTER comparison references where practical.

Required AFTER screenshots:

1. `1440×900` — Laboratory;
2. `1440×900` — Collection Home;
3. `1440×900` — Set index;
4. `1440×900` — Set Detail;
5. `1440×900` — Element Detail;
6. `1440×900` — Anomaly Archive or Discovery Map;
7. `390×844` — Laboratory;
8. `390×844` — Collection Home;
9. `390×844` — Element Detail;
10. `320×568` — one Catalog/Set/Element screen.

Use legitimate save fixtures and existing safe projection paths.

### 24. Visual acceptance criteria

The PR is not complete merely because screenshots render.

Reject the result if:

- Collection still looks primarily like a dashboard;
- all knowledge screens remain stacks of similar bordered cards;
- Lab experiment does not dominate;
- catalog and observatory emphases are not visibly distinct but related;
- mobile is just compressed desktop;
- placeholder art is visually incidental compared with metadata;
- navigation remains visually heavier than content.

### 25. Architecture constraints

Allowed:

- significant React composition/CSS refactor;
- shared visual shells;
- new presentational components;
- splitting existing giant visual modules when helpful.

Not allowed:

- moving gameplay logic into UI;
- changing safe projection semantics;
- persisting derived visual state;
- changing save schema;
- changing resolver/content.

## Required tests

### Functional regression

All Phase 0–7 unit/component/E2E/production PWA tests remain green.

### Navigation/IA

- knowledge-family tabs honor disclosure;
- deep links unchanged;
- mobile navigation max five destinations;
- route guards unchanged.

### Visual component behavior

- ElementCard states preserve accessible labels;
- recipe visual handles A+A/alternate;
- progress labels expose correct values;
- responsive shells do not drop actions.

### Accessibility

- axe on redesigned Lab, Collection, Set Detail, Element Detail, Anomalies/Map;
- keyboard interaction;
- forced colors;
- reduced motion;
- 200% zoom;
- 320 px no horizontal overflow.

### PWA

- production build;
- manifest/SW validation;
- offline reload;
- lazy redesigned routes load offline.

### Canonical regression

Seed remains:

- 67/67 reachable;
- depth 11;
- no blocked unlocks;
- 4 Collections;
- 1 unresolved anomaly.

## Explicitly out of scope

Do NOT:

- add Phase 8 content;
- add new elements/recipes/Sets/Collections;
- add Tier 4/5 hints;
- add Resonance;
- change XP/progression;
- add achievements;
- add final 67-element production art;
- compose final production music;
- start Android/Capacitor;
- add backend/cloud/analytics/monetization.

## Delivery

Work on a dedicated branch and open a PR.

PR description must include:

- visual/UX architecture changes;
- screen structure changes;
- component system changes;
- what was deliberately replaced rather than preserved;
- accessibility preservation;
- responsive matrix;
- production PWA/offline regression status;
- all required screenshots;
- commands/tests;
- validator/reachability;
- explicit confirmation Phase 8 was not started.

**Do not extend scope.**

**Do not treat tests alone as visual approval. The PR will be visually reviewed before merge.**
