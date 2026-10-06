# Phase 3 — Codex Task

Phase 0 + 1 + 2 are merged.

## Goal

Build the first genuinely playable responsive **Laboratory** using the existing pure engine and Phase 2 save/application layer.

Do not extend into Phase 4 Catalog implementation.

## Required reading

- `AGENTS.md`
- `docs/VISUAL_BIBLE_REFERENCE.md`
- `docs/VISUAL_DIRECTION.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/UX_SCREEN_ARCHITECTURE.md`
- `docs/SCREEN_SPECS.md`
- `docs/RESPONSIVE_AND_UI_STATES.md`
- `docs/ACCESSIBILITY.md`
- `docs/MOTION_AUDIO.md`
- `docs/FIRST_SESSION_EXPERIENCE.md`
- `docs/COPY_AND_LOCALIZATION.md`
- `docs/DATA_MODEL.md`
- `docs/SAVE_AND_VERSIONING.md`
- `docs/PHASE_2_NOTES.md`

The visual-bible reference controls mood/hierarchy only. Gameplay specifications remain source of truth.

## Scope

### 1. AppShell + Laboratory

Replace the diagnostic landing screen with the real responsive product shell.

Desktop:
- left navigation rail;
- center experiment stage;
- right element library.

Mobile:
- compact header;
- experiment stage;
- searchable library;
- bottom navigation.

### 2. Progressive navigation

Only show currently eligible destinations.

Do not show permanently disabled future destinations.

Phase 3 may use minimal route placeholders only when needed for navigation coherence.

### 3. Element library

Render only player-discovered usable elements.

Required:

- card/grid;
- localized name;
- placeholder art based on stable `artKey`;
- Set/state treatment;
- search;
- favorites quick access;
- selected state;
- allowed tested-pair context relative to Slot A.

Never highlight an undiscovered valid partner.

Never leak hidden/secret content.

### 4. Slot A / Slot B

- tap/click fills next available slot;
- selecting same element twice supports authored A+A;
- tapping a filled slot removes it;
- keyboard path works;
- drag is optional enhancement only.

### 5. Explicit Combine

`Combina` is enabled only with two valid inputs.

Do not auto-combine after Slot B is filled.

Use the real Phase 2 application transaction.

UI must not duplicate resolver/save rules.

### 6. Outcomes

Present:

- known recipe;
- new element;
- alternate recipe;
- no reaction;
- first anomaly;
- repeated anomaly.

### 7. New discovery reveal

Show:

- placeholder/art;
- element name;
- Set;
- rarity if applicable;
- short description;
- `Usa risultato`;
- `Nuovo esperimento`.

Omit `Vedi scheda` in Phase 3 rather than create a fake Phase 4 detail page.

### 8. Post-result actions

- `Usa risultato` → result becomes Slot A, Slot B clears;
- `Ripeti con A` → original Slot A stays, Slot B clears;
- `Nuovo esperimento` → both clear.

No automatic replacement.

### 9. No reaction

Neutral feedback:

> Nessuna reazione.

Immediate continuation.

### 10. Anomaly

Canonical seed pair:

`Luna + Vita`

Show:

- violet/indigo state;
- incomplete orbit/sigil/refractive motif;
- `Reazione instabile`;
- no future result spoiler.

No strobe/heavy glitch.

### 11. Search and favorites

Search only currently visible/discovered elements.

Favorites use durable Phase 2 save state and persist after reload.

### 12. Responsive

Verify at:

- 320×568
- 390×844
- 768×1024
- 1024×768
- 1440×900
- 1920×1080

Desktop:
three-zone layout and independently usable library.

Mobile:
portrait-first, large targets, 3-column cards when practical, 2 at narrow/large-text layouts.

Viewport changes must not unnecessarily reset current experiment/search state.

### 13. Accessibility

Required:

- keyboard-completable combination;
- visible focus;
- semantic buttons;
- 44×44 touch targets;
- no color-only state;
- ARIA live result announcement;
- `prefers-reduced-motion`;
- full usability without drag.

### 14. Motion

Lightweight only:

- selection microinteraction;
- combine transition;
- known result;
- new discovery emphasis;
- no-reaction settle;
- anomaly treatment;
- reduced-motion equivalents.

No heavy WebGL.

### 15. Visual direction

Follow `VISUAL_BIBLE_REFERENCE.md`.

Minimum:

- dark midnight observatory shell;
- warm gold action/discovery accent;
- illustrated/symbolic cards;
- subtle celestial/orbit motifs;
- violet anomaly language;
- no generic dashboard look.

Final production art is not required.

Codex may create local CSS/SVG/simple asset placeholders keyed from `artKey` without changing content semantics.

### 16. Save/load integration

Use the Phase 2 save/application runtime.

After reload:

- discoveries persist;
- favorites persist;
- tested pairs persist;
- XP/progression persists.

No parallel UI-only durable state.

### 17. Save failure

If persistence fails during combine:

- do not confirm an uncommitted discovery;
- show accessible recoverable feedback;
- preserve last valid state;
- never silently reset.

## Required reusable components

At minimum:

- AppShell
- NavigationRail
- BottomNavigation
- DiscoveryLevelBadge
- ElementCard
- ElementSlot
- CombineButton
- ReactionStage
- DiscoveryReveal
- SearchBar
- InlineNotice

Do not prematurely implement the future screen component inventory.

## Required tests

### Interaction

- selection fills A then B;
- same element twice supports A+A;
- clearing slot;
- Combine disabled before two inputs;
- Combine calls real application transaction.

### Outcomes

- known;
- new discovery;
- alternate;
- no reaction;
- anomaly.

### Post-result

- Usa risultato;
- Ripeti con A;
- Nuovo esperimento.

### Search/favorites

- search only visible discoveries;
- hidden content absent;
- favorite persists.

### Accessibility

- keyboard complete combination;
- accessible names;
- live result announcement;
- reduced-motion flow remains usable.

### Regression

All Phase 0–2 tests, validators and build remain green.

Seed remains:

- 67/67 reachable;
- depth 11.

## Out of scope

Do NOT implement:

- complete Catalog;
- Set detail;
- Element detail;
- full Collections UI;
- full Anomaly Archive;
- Discovery Map;
- strong hint UI;
- PWA/service worker;
- Android/Capacitor;
- final production art/audio;
- new recipes/elements;
- Arcano;
- backend/cloud;
- monetization;
- analytics.

## Delivery

Work on a dedicated branch and open a PR.

PR description must include:

- UI architecture summary;
- screenshots at 1440×900, 390×844 and 320×568;
- component inventory;
- accessibility behavior;
- responsive behavior;
- implemented outcome states;
- save/application integration;
- commands run;
- tests;
- validator/reachability results;
- explicit confirmation Phase 4 was not started.

Do not extend scope.
