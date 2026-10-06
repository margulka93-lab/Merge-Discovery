# FIGMA_TASK.md — Phase 3 UI Gate

Status: **required before Codex Phase 3**

## Goal

Design and approve the playable Laboratory UI before Codex implements the first real product interface.

This is not a marketing mockup task.

The output must be implementation-oriented, responsive, component-based, and consistent with the existing design system.

## Required source documents

Use:

- `docs/UX_SCREEN_ARCHITECTURE.md`
- `docs/SCREEN_SPECS.md`
- `docs/RESPONSIVE_AND_UI_STATES.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/VISUAL_DIRECTION.md`
- `docs/ACCESSIBILITY.md`
- `docs/MOTION_AUDIO.md`
- `docs/FIRST_SESSION_EXPERIENCE.md`
- `docs/COPY_AND_LOCALIZATION.md`
- `docs/IMPLEMENTATION_SEED_CONTENT.md`

## Visual direction

Modern magical observatory + illustrated field guide.

Avoid:

- medieval alchemy room;
- glossy generic mobile-game UI;
- excessive neon;
- fake currencies;
- combat-stat cards;
- childish cartoon framing.

Core palette:

- #0B1220
- #151F2E
- #1C293A
- #F7F3EA
- #D9B66F
- #A891E8

Field-guide surfaces:

- #F3EBDD
- #FFF9EE
- #26313A

## Required frames

### A. Laboratory — desktop

Primary reference width:
1440 px.

Show:

- left navigation rail;
- Discovery Level;
- discovery count;
- center experiment stage;
- Slot A;
- Slot B;
- explicit `Combina` button;
- reaction/result area;
- right searchable element library;
- favorites/filter affordances;
- illustrated element cards.

Use real seed examples.

Preferred selected inputs:
`Acqua + Terra`.

### B. Laboratory — mobile

Primary reference:
390×844.

Also verify:
320×568.

Show:

- compact header;
- slots;
- Combine;
- result area;
- favorites/search;
- three-column library at ordinary text size;
- bottom navigation;
- safe-area behavior.

The same product identity must survive mobile.

### C. Laboratory interaction states

Separate component/state frames for:

1. empty slots;
2. Slot A selected;
3. both slots selected;
4. known successful recipe;
5. no reaction;
6. new element discovery;
7. alternate recipe;
8. anomaly;
9. hidden Set reveal;
10. save warning/error.

### D. Element Card component set

Variants:

- default;
- hover/focus;
- selected;
- favorite;
- new;
- tested no-reaction relative to Slot A;
- known success relative to Slot A;
- anomaly relation;
- new possibilities;
- currently exhausted.

Do not use color alone for these states.

### E. New Discovery Reveal

Desktop and mobile.

Show:

- result art;
- element name;
- Set;
- rarity;
- short description;
- actions:
  - Usa risultato
  - Vedi scheda
  - Nuovo esperimento

### F. Anomaly outcome

Show pair:
`Luna + Vita`

State:
`Reazione instabile`

Do not show any future result.

Use incomplete geometric/orbital visual language.

### G. Progressive navigation states

At minimum:

1. brand-new game — Lab + settings only;
2. Collection unlocked;
3. Sets unlocked;
4. Anomalies unlocked;
5. full mature nav with Esplora.

## Component structure

Build reusable Figma components/variants for:

- AppShell
- NavigationRail
- BottomNavigation
- DiscoveryLevelBadge
- ElementCard
- ElementToken
- ElementSlot
- CombineButton
- ReactionStage
- DiscoveryReveal
- SearchBar
- Filter control
- Hint action
- InlineNotice
- Modal / BottomSheet

## Responsive behavior

Respect the repository breakpoints:

- mobile: <768
- compact: 768–1023
- desktop: 1024–1439
- wide: 1440+

Do not design desktop and mobile as unrelated products.

## Accessibility

Must preserve:

- 44×44 touch targets;
- visible focus;
- no color-only state;
- large-text resilience;
- reduced-motion-compatible layouts;
- readable contrast;
- keyboard/tap path without drag.

## Content rules

Do not expose:

- hidden Set names before reveal;
- global hidden denominator;
- undiscovered secret elements;
- exact undiscovered recipe answers.

## Handoff requirement

Before Codex Phase 3 begins, approve:

1. desktop Lab;
2. mobile Lab;
3. ElementCard states;
4. reaction-state hierarchy;
5. discovery reveal;
6. anomaly state;
7. responsive behavior.

The approved Figma file/frame references must then be added to the Phase 3 Codex task.
