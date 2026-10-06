# UX & Screen Architecture

Status: **interaction design draft v1**

The game is web-first, responsive and touch-friendly from the start.

The same information architecture should support desktop and Android-sized screens.

## Navigation model

Primary destinations:

1. Laboratorio
2. Collezione
3. Set / Collezioni
4. Anomalie — only after first anomaly
5. Mappa — only after enough graph density
6. Profilo / Impostazioni

On mobile, use bottom navigation for the most frequent destinations.

On desktop, use a persistent side rail.

## Laboratory — desktop

Three-zone layout:

### Left rail

- primary navigation;
- current level;
- discovery count;
- optional active objective.

### Center workspace

- two combination slots;
- combine action;
- reaction/result area;
- contextual clue area;
- last discovery shortcut.

### Right library

- search;
- favorites;
- filters;
- known elements grid/list;
- tested-pair state relative to the selected first input.

Desktop advantage:

The player can keep inventory visible while combining.

## Laboratory — mobile

Single focused vertical flow.

Header:

- level;
- recent discovery indicator;
- compact menu if needed.

Center:

- slot A;
- plus;
- slot B;
- combine button;
- reaction/result.

Lower area:

- horizontal/vertical element library;
- search;
- quick favorites.

Bottom navigation:

- Lab
- Collection
- Sets
- Map/Anomalies contextual slot
- Profile

Avoid tiny drag targets.

Tap-select is the baseline interaction.

Drag-and-drop is optional enhancement.

## Input behavior

### Tap

Tap an element:

- fills the next free slot.

Tap a filled slot:

- clears it.

Tap an already selected element while only one slot is filled:

- if same-element recipes are supported, fill the second slot with the same element.

This makes A+A discoverable without a tutorial wall.

### Drag

Drag into a slot is supported on desktop and touch devices where comfortable.

Do not require it.

## Combine button

The button is active only when both slots are populated.

Why explicit action is preferred:

- readable intentionality;
- consistent on mobile;
- supports pre-reaction anticipation;
- prevents accidental combinations during scrolling/dragging.

## Post-combination state

### New discovery

Show:

- short reveal animation;
- new element;
- `Nuova scoperta`;
- actions:
  - Use now
  - View card
  - Dismiss/continue

### Known result

Fast feedback.

Do not replay the full reveal.

### No reaction

Short, neutral response.

The pair becomes remembered.

### Anomaly

Distinct effect.

Offer:

- Save to archive — automatic by default, button wording may simply acknowledge.
- View anomaly — optional.

## Library item states

Element card can show:

- favorite;
- new;
- currently exhausted;
- new possibilities;
- tested/no reaction relative to selected input;
- anomaly relation.

Do not show all icons at once.

Priority and context determine which state is visible.

## Selected-input mode

When Slot A contains an element, the library becomes context-aware.

Possible visual changes:

- already tested no-reaction partners become subtly muted;
- known successful partners can show a tiny history mark;
- anomaly partners can show instability mark;
- untested elements remain visually normal.

Important:

Do not brighten all valid undiscovered partners by default.

That would solve the game automatically.

## Search

Sticky and fast.

Desktop:
- always visible.

Mobile:
- compact bar above library or expandable search.

Search results never expose hidden content.

## Filters

Quick filters:

- Favorites
- New
- Has possibilities
- Current Set

Advanced filters live in a sheet/panel.

## Collection screen

Default view:

- recent discoveries;
- active Sets;
- near-complete Sets;
- favorites.

Desktop can show element detail in a right pane.

Mobile opens detail as dedicated page/sheet.

## Sets screen

Two tabs:

- Sets
- Collections

Avoid treating both as one undifferentiated grid.

### Set card

Shows:

- name;
- art/icon;
- visible completion;
- unlock state;
- new possibilities badge.

### Collection card

Shows:

- theme;
- chapter completion;
- optional reward;
- no main-path pressure.

## Element detail — mobile

Recommended vertical structure:

1. hero art;
2. name / set / rarity;
3. short description;
4. discovered recipe;
5. known alternate recipes;
6. reactions / possibilities;
7. collections;
8. graph shortcut;
9. experiment history.

No dense two-column tables.

## Element detail — desktop

Two-column detail:

Left:
- artwork;
- identity;
- description.

Right:
- recipes;
- relationships;
- collections;
- graph preview.

## Anomaly archive

Unavailable before first anomaly.

Main list shows:

- input pair;
- status;
- when first observed;
- whether something changed.

States:

- unstable;
- dormant;
- revisitable;
- resolved.

Never show hidden result name before resolution.

## Discovery map

Unlock after approximately 15–20 discoveries.

### Desktop

Canvas-style pan/zoom.

Default focus:

- selected element;
- nearby relationships.

### Mobile

Only local neighborhood by default.

Full global graph is optional.

Controls:

- center;
- back;
- ancestry;
- possibilities;
- set filter.

## First-run progressive disclosure

At game start:

Visible:
- Lab only.

After ~3 discoveries:
- Collection.

After first Set expansion:
- Sets.

After first anomaly:
- Anomalies.

After graph density threshold:
- Map.

Settings/Profile remain accessible through a compact control from the beginning.

## Visual hierarchy of celebrations

From least to most important:

1. known reaction;
2. alternate recipe;
3. new element;
4. collection complete;
5. normal Set reveal;
6. hidden Set reveal;
7. Era-defining discovery;
8. first supernatural transition / major anomaly resolution.

The game must not use the same animation for all events.

## Persistent status

Header should prioritize:

- Discovery Level;
- total discovered count;
- active contextual alert.

Do not show five currencies.

At current design stage, there is no reason for the header to contain:

- coins;
- stamina;
- premium gems;
- crafting resources.

## Responsive breakpoints — conceptual

Exact CSS values deferred.

### Wide desktop

Three columns.

### Tablet / narrow desktop

Side navigation + center workspace, library becomes collapsible drawer.

### Mobile

Single column + bottom navigation.

Core interaction remains identical.

## Orientation

Portrait mobile is primary.

Landscape should work but does not need a unique custom layout in v1.

## Accessibility interaction requirements

Already known even before full accessibility design:

- all actions available without drag;
- keyboard support on web;
- no color-only state communication;
- reduced motion option;
- readable touch targets;
- text scaling must not break the combine area.

## UX questions still open

- whether the first slot selection should persist after a result for rapid experimentation;
- whether “Use now” puts the new result into Slot A automatically;
- how many favorites appear in quick access;
- whether reaction history belongs on element detail or separate history;
- exact placement of hint controls;
- whether active Collection goals appear in Lab by default;
- whether Set reveal temporarily changes Lab background/accent.
