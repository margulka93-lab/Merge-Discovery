# Detailed Screen Specifications

Status: **UX specification draft v2**

This document translates the game systems into concrete desktop/mobile screens before implementation.

---

# 1. Laboratory

## Primary job

Let the player choose two known elements, understand what has already been tested, combine them, and continue experimenting with minimal friction.

## Desktop layout

### Left navigation rail — 220–260 px conceptual width

Top:
- logo/compact wordmark;
- Discovery Level + progress;
- discovered-element count.

Navigation:
- Laboratorio
- Collezione
- Set
- Anomalie, once unlocked
- Mappa, once unlocked

Bottom:
- active optional objective;
- settings/profile.

### Center experiment stage — dominant area

Upper:
- contextual breadcrumb such as current Set filter;
- optional lightweight hint access.

Middle:
- Slot A card;
- plus symbol / reaction connector;
- Slot B card;
- large Combine button.

Below:
- reaction surface.

Neutral state:
quiet table/desk.

Known reaction:
fast result chip/card.

New discovery:
full illustrated reveal.

Anomaly:
distortion field rather than a normal card.

Bottom:
- last discovery;
- “use result” action;
- “view card” action.

### Right library panel — 320–400 px conceptual width

Header:
- search;
- filter;
- favorites toggle.

Body:
- 3–4 column element-card grid depending width.

Context mode after Slot A selection:
- tested failures subtly marked;
- known successful pair marker;
- anomaly marker;
- untested cards unchanged.

Footer:
- active filter summary.

## Mobile layout

Top bar:
- Lv.
- discovered count;
- contextual alert.

Main stage:
- two large slots side by side if width allows, otherwise stacked;
- Combine button directly below;
- result area.

Library:
- search;
- horizontal quick favorites;
- scrollable 3-column compact card grid.

Bottom nav:
- Lab
- Collection
- Sets
- contextual Map/Anomaly
- Profile

## Key interaction decisions

- tap/click fills next slot;
- tapping the same element twice allows A+A;
- explicit Combine button;
- result does not automatically replace Slot A;
- “Usa risultato” intentionally replaces Slot A and clears Slot B;
- “Continua” clears both slots by default.

### Why not persist Slot A automatically?

Automatic persistence makes rapid testing easier but creates accidental repeated experiments and hides state.

Preferred:
after result, show:
- Usa risultato
- Ripeti con A
- Nuovo esperimento

This can be streamlined after playtesting.

---

# 2. New Discovery Reveal

## Primary job

Make discovery feel materially different from ordinary successful combination.

## Standard new element

Stage:
1. inputs converge;
2. reaction glow;
3. new art resolves;
4. element name;
5. Set chip + rarity;
6. short one-line description;
7. actions.

Actions:
- Usa risultato
- Vedi scheda
- Continua

No forced catalog navigation.

## Major discovery

Used for:
- first Stella;
- first Vita;
- hidden Set reveal;
- Arcano.

Adds:
- environment reaction;
- Set reveal;
- stronger sound;
- one short thematic line.

No giant paragraph.

---

# 3. Collection Home

## Primary job

Answer:
- what did I just discover?
- where am I making progress?
- what should I revisit?

## Desktop

Top:
- search;
- filter;
- total discoveries, without hidden denominator.

Hero row:
- recent discoveries;
- new possibilities.

Main grid:
- active Set cards.

Secondary:
- Collections close to completion;
- favorites.

Right optional detail pane:
- selected recent element.

## Mobile

Top search.
Then stacked sections:
- Recenti
- Nuove possibilità
- Set
- Collezioni
- Preferiti

Sections collapse after first screenful.

---

# 4. Set Detail

## Primary job

Turn a domain into a satisfying collection space without revealing secrets.

Header:
- Set icon/art;
- name;
- visible completion;
- short thematic line.

Controls:
- sort;
- filter;
- hide currently exhausted.

Grid states:
- discovered card;
- intentionally visible unknown;
- glimpsed silhouette;
- no slot at all for secrets.

Footer:
- Set Collections;
- completion reward;
- graph shortcut.

Desktop:
4–6 cards per row.

Mobile:
2–3 cards per row.

---

# 5. Element Detail

## Hero

Large illustration.
Name.
Set.
Rarity.
Favorite.

One-sentence description.

## Discovery block

“Scoperto con”
- input A
- input B

Optional:
alternate discovered recipes.

## Possibilities block

Default language:
- “Ha ancora reazioni da scoprire.”
- or “Hai esplorato tutte le reazioni attualmente note con ciò che possiedi.”

Collector mode can show exact non-secret missing counts.

## Relationships

Small local graph.

## Collections

Chips/cards for memberships.

## Experiments

Tabs:
- Successi
- Anomalie
- Nessuna reazione

Do not render full pair matrix.

---

# 6. Sets & Collections

Two primary tabs.

## Sets

Cards ordered by progression.
Hidden Sets absent.
Announced locked Sets can appear.

Card:
- art;
- name;
- completion;
- state;
- new possibility badge.

## Collections

Cards ordered by:
- active;
- nearly complete;
- completed;
- secret discovered.

Collection chapter structure visible where relevant.

---

# 7. Anomaly Archive

## Visual tone

Dark glass, restrained violet distortion, same global UI shell.

## List item

Inputs:
two known element icons.

Status:
- Instabile
- Inerte
- Riesaminabile
- Risolta

Metadata:
- first observed;
- whether conditions changed.

No hidden result.

## Revisitable state

Strong but not spoiler-heavy callout:

“Qualcosa è cambiato.”

Action:
“Riprova nel laboratorio”

The player must still perform the combination.

## Resolved anomaly

After resolution:
shows result and links into discovery graph.

---

# 8. Discovery Map

## Default principle

Never dump the full graph.

Open focused on selected node or recent discovery.

## Desktop

Large canvas.

Left controls:
- ancestry
- possibilities
- Set filter
- depth 1/2/3
- hide completed

Right mini inspector on selection.

## Mobile

One-hop neighborhood.

Gestures:
- pinch
- pan
- tap
- center

Bottom sheet inspector for selected node.

---

# 9. Optional Objectives / Collections

No dedicated permanent nav item needed at launch.

Surface through:
- Collection home;
- Set pages;
- small Lab objective card.

Objective card:
- Collection name;
- progress;
- one clue;
- optional reward.

Never show countdown timers.

---

# 10. Profile / Settings

Minimal.

Player:
- total discoveries;
- Sets completed;
- hidden Sets found;
- favorite discovery;
- optional badges.

Settings:
- Mystery / Balanced / Collector information mode;
- proactive hint frequency;
- reduced motion;
- sound/music;
- text size;
- high contrast;
- input preferences.

No fake avatar economy required.

---

# 11. First-session UI disclosure

### Start
Laboratory + settings only.

### 3 discoveries
Collection appears.

### First Set reveal
Sets appears.

### 15–20 discoveries
Map appears.

### First anomaly
Anomalies appears.

Navigation physically expands as understanding expands.

---

# 12. Design-system component list

Required reusable components later:

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
- SetCard
- CollectionCard
- ProgressRing/Bar
- SearchBar
- FilterSheet
- HintCard
- AnomalyCard
- ElementDetail
- LocalGraph
- GraphCanvas
- Toast/InlineNotice
- Modal/BottomSheet

This list is for later implementation planning only; no code yet.

---

# 13. Visual density targets

## Desktop
Atmospheric but information-rich.

The Lab may show:
- 12–20 element cards without scrolling depending viewport.

## Mobile
Never require tiny icons.

Target:
- 3 compact cards per row on ordinary phone;
- 2 per row at large text size.

Element names should remain readable without relying on tooltip.

---

# 14. Concept-art screens to produce

Separate concept frames should be created for:

1. Laboratory — desktop
2. Laboratory — mobile
3. Collection / Set detail
4. Element detail
5. Anomaly Archive
6. Discovery Map
7. Arcano hidden-Set reveal

The purpose of concept art is to validate layout, hierarchy and mood — not to freeze pixel-perfect UI before implementation.
