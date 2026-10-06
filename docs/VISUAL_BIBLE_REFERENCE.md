# Visual Bible Reference

Status: **canonical visual reference for implementation**

This document captures the approved visual direction represented by the Merge Discovery design-bible poster and translates it into implementation language.

It replaces the need for a Figma gate.

## Overall identity

Merge Discovery should look like a **premium illustrated discovery game** built around:

- a dark midnight observatory/laboratory;
- warm amber/gold interaction accents;
- painterly element artwork;
- subtle celestial diagrams and constellation lines;
- a cleaner illustrated field-guide treatment for catalog/detail surfaces;
- restrained violet/indigo effects for anomalies and later Arcano content.

The mood is **cozy modern-magical**, not medieval.

Avoid:

- glossy free-to-play mobile aesthetics;
- neon cyberpunk;
- generic dashboard UI;
- parchment everywhere;
- excessive gamification chrome;
- currencies/stamina bars;
- combat-stat cards.

## Logo / brand

Working visual:

- serif/editorial display treatment for `MERGE DISCOVERY`;
- warm gold lettering over dark blue;
- small symbolic mark combining a flame/spark and a water/element motif inside an orbit/circle;
- celestial linework in the background.

A text treatment is acceptable until final brand assets exist.

## Core palette

Use the canonical tokens from `DESIGN_SYSTEM.md`.

Key anchors:

- background: `#0B1220`
- surface: `#151F2E`
- elevated surface: `#1C293A`
- text: `#F7F3EA`
- warm accent: `#D9B66F`
- anomaly: `#A891E8`
- field-guide paper: `#F3EBDD`
- field-guide ink: `#26313A`

## Laboratory — desktop

The visual reference uses a three-column shell.

### Left navigation

Dark rail with:

- wordmark;
- Laboratorio;
- Collezione;
- Set;
- Anomalie when unlocked;
- Mappa when unlocked;
- objectives/settings where relevant.

Use warm gold for the active state and compact icons.

It should feel like an observatory console, not a SaaS sidebar.

### Center experiment area

Dominant visual focus.

Show:

- subtle cosmic/orbit background;
- two large illustrated element cards;
- plus sign;
- explicit warm `Combina` button;
- result card below.

The visual formula should read immediately:

`Elemento A + Elemento B → Risultato`

Example:

`Acqua + Terra → Fango`

The result rests on a soft illuminated sigil/orbit.

### Right inventory/library

Compact illustrated grid.

Top:

- search;
- lightweight filters/favorites.

Cards:

- strong art/icon;
- short name;
- minimal Set/state cue;
- dark surface;
- consistent size.

## Laboratory — mobile

Portrait layout keeps the same product identity.

Order:

1. compact Discovery Level/progress header;
2. Slot A + Slot B;
3. explicit `Combina`;
4. result/reveal;
5. element library;
6. bottom navigation.

Use large touch-friendly cards and 3-column inventory where width allows.

## Element artwork

Preferred:

- centered painterly object;
- simple dark backdrop;
- readable silhouette;
- restrained warm rim light;
- enough detail for hero use but clear at card size.

Phase 3 can use stylized placeholders preserving the expected composition and `artKey`.

## Element card

Anatomy:

- illustration first;
- name;
- small Set/state cue;
- subtle warm border when selected;
- anomaly uses icon/label plus violet treatment.

No stats.

## Result hierarchy

### New element

Strong warm/gold focus.

### New recipe

Smaller positive reveal.

### New Set

Stronger domain reveal.

### Anomaly

Purple/indigo incomplete energy geometry with `Reazione instabile`.

### No reaction

Quiet neutral ring with `Nessuna reazione`.

No punishment/error styling.

## Catalog / detail direction

Later Phase 4 should preserve the poster's illustrated field-guide feeling while obeying spoiler rules.

Typical content:

- large art;
- name;
- rarity/Set chips;
- short description;
- known recipes;
- relationships / `Usato per`.

Do not copy illustrative `???` from the poster if it would leak hidden content.

## Discovery Map direction

Dark cosmic canvas.

Nodes:

- circular illustrated elements;
- thin glowing edges;
- selected chain highlighted;
- labels near nodes.

Render local neighborhoods, not the whole universe at once.

## Hint direction

Hints appear as progressively clearer contextual information.

The canonical mechanics remain in `HINTS_AND_FAILURE.md`:

- free;
- player-controlled;
- no currency;
- no timer.

## Anomaly payoff direction

Visual story:

`Lupo + Luna`

Before Arcano:
unstable violet reaction, no result spoiler.

After the relevant future unlock:
same motif stabilizes and can reveal the authored result.

Gameplay specifics remain governed by `ARCANE_TRANSITION.md`.

## Era presentation

Illustrated atmospheric cards:

- Origini
- Mondo
- Vita
- Umanità
- Arcano
- Invisibile
- Impossibile

Exact level numbers shown in concept art are not canonical when they conflict with progression data.

## Source-of-truth rule

The poster is a **visual direction reference**, not a gameplay/data specification.

If there is a conflict:

1. gameplay/data docs win;
2. UX/specification docs win for behavior;
3. this file controls mood, hierarchy and visual language.

## Phase 3 minimum visual bar

The first playable Laboratory must already communicate:

- dark cozy observatory;
- gold discovery focus;
- illustrated/symbolic element cards;
- celestial/orbit motifs;
- distinct known/new/anomaly/no-reaction states;
- desktop/mobile continuity.

Final production illustrations are not required for Phase 3.
