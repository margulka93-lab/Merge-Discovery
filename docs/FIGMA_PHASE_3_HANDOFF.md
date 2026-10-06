# Figma Phase 3 UI Gate — Review Handoff

Status: **ready for user visual review — Codex Phase 3 remains blocked**

## Figma file

https://www.figma.com/design/LKF4Ft9nQYSxn65j30XphE

File:
`Merge Discovery — Phase 3 UI Gate`

## Pages

- `01 Foundations`
- `02 Components`
- `03 Screens`

## Foundations

Node:
`1:41`

Contains:

- core Lab colors;
- field-guide colors;
- Set accents;
- spacing/radius variables;
- reusable typography styles;
- visual specimen.

## Reusable component sets

### ElementCard

Node:
`3:75`

10 states:

- Default
- Focus
- Selected
- Favorite
- New
- Failed
- Success
- Anomaly
- NewPossibilities
- Exhausted

### ElementSlot

Node:
`4:50`

States:

- Empty
- Filled
- Focused
- Reacting

### CombineButton

Node:
`4:57`

States:

- Disabled
- Ready
- Pressed

### ReactionStage

Node:
`4:96`

States:

- Idle
- Known
- NoReaction
- NewDiscovery
- Alternate
- Anomaly

## Primary review frames

### Laboratory — desktop

Node:
`5:2`

Reference size:
1440 × 900

Direct node URL:

https://www.figma.com/design/LKF4Ft9nQYSxn65j30XphE?node-id=5-2

### Laboratory — mobile

Node:
`5:144`

Reference size:
390 × 844

Direct node URL:

https://www.figma.com/design/LKF4Ft9nQYSxn65j30XphE?node-id=5-144

### Interaction states

Node:
`6:134`

Includes:

- no reaction;
- known reaction;
- new discovery;
- alternate recipe;
- Luna + Vita anomaly treatment;
- hidden Set reveal;
- progressive navigation reference.

Direct node URL:

https://www.figma.com/design/LKF4Ft9nQYSxn65j30XphE?node-id=6-134

### Narrow mobile validation

Node:
`6:209`

Reference:
320 × 568

Direct node URL:

https://www.figma.com/design/LKF4Ft9nQYSxn65j30XphE?node-id=6-209

## What this gate is deciding

Before Phase 3 Codex starts, the user should approve or request revisions to:

1. overall modern-magical Lab direction;
2. desktop information hierarchy;
3. mobile hierarchy;
4. card density;
5. slot/reaction-stage hierarchy;
6. discovery/anomaly visual distinction;
7. progressive navigation approach.

## Not final production art

The element imagery in these frames is deliberately symbolic/placeholder.

This gate locks:

- layout;
- hierarchy;
- component state language;
- responsive composition;
- design-token direction.

It does not lock final illustrated element assets.

## Codex status

`CODEX_TASK.md` remains intentionally blocked.

After explicit approval:

1. mark these node references as approved;
2. write final Phase 3 Codex task;
3. require Codex to consult the approved Figma nodes;
4. implement the playable Laboratory only;
5. review PR before moving to Catalog.
