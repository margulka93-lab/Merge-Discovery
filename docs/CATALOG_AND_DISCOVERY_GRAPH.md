# Catalog & Discovery Graph

Status: **design draft v1**

The catalog is a primary gameplay surface, not a passive encyclopedia.

Its job is to make a growing universe understandable without exposing future secrets.

## Core goals

The catalog must help the player:

- remember what exists;
- understand how discoveries relate;
- identify promising unexplored areas;
- complete sets without brute force;
- revisit alternate recipes;
- notice old elements that became relevant again;
- enjoy collection progress.

It must not become a spreadsheet of spoilers.

## Global completion rule

There is **no truthful global “X / total game elements” counter** while hidden and secret content exists.

Preferred global header:

> 37 scoperte

Optional secondary information:

> 3 set attivi · 1 completato

Visible completion percentages apply only to currently revealed sets and visible required content.

Hidden and secret elements do not inflate visible denominators before reveal.

## Catalog home

### Primary content

1. Recently discovered elements
2. Active sets
3. Sets close to completion
4. Newly available reactions / revisitable anomalies
5. Optional collections

### Suggested desktop structure

Left:
- search;
- filters;
- set list.

Center:
- selected set grid or discovery feed.

Right, when enough width exists:
- selected element preview.

### Suggested mobile structure

Single-column navigation.

Top:
- search;
- filter button.

Then:
- active set cards;
- discovery grid.

Element details open as a full page or bottom sheet depending content depth.

## Set cards

An unlocked set card shows:

- set name;
- representative icon/art;
- required discovered count;
- visible required total;
- completion bar;
- optional “new possibilities” indicator.

Example:

> Cosmo  
> 8 / 12  
> 2 elementi conosciuti hanno ancora reazioni da scoprire

An announced but locked set may show:

- name;
- lock state;
- broad thematic clue.

A hidden set does not appear.

A secret set does not appear and does not reserve blank space.

## Element visibility states

### Discovered

Shows:

- art;
- name;
- set;
- rarity if rarity is player-facing;
- short description;
- discovered recipes;
- known relationships.

### Glimpsed

Used sparingly.

Shows:

- silhouette or abstract icon;
- clue;
- no name unless intentionally revealed.

### Unknown visible slot

Shows:

- placeholder;
- possibly one broad clue.

Use only when the set's design benefits from visible completion structure.

### Hidden

No slot.

### Secret

No slot and not counted toward normal completion before discovery.

### Anomalous unknown

Shown in the anomaly archive, not necessarily inside a normal set.

It represents a reaction, not a confirmed element identity.

## Element detail page

Recommended sections:

### Header

- artwork;
- name;
- set;
- rarity;
- favorite toggle;
- discovered status.

### Description

Short authored text.

Tone:

- concise;
- curious;
- sometimes lightly poetic;
- factual where appropriate;
- never written like a database dump.

### First discovery

Shows the player's first successful recipe.

Example:

> Scoperto con  
> Pianeta + Cometa

Optional later:
- discovery date;
- whether it was hinted or found independently.

Do not over-gamify “found without hint” unless later achievement design needs it.

### Recipes

Shows only player-discovered recipes by default.

Example:

> Ricette conosciute  
> ✓ Pianeta + Cometa  
> ✓ Cometa + Calore

Unknown normal recipes may be represented according to the player's completion settings:

- hidden entirely;
- vague “altre possibilità”;
- exact missing count in advanced collector mode.

Secret recipes remain excluded until relevant.

### Reactions

Answers:

> What can I still do with this element?

Possible states:

- “Sembra avere ancora reazioni da scoprire.”
- “Per ora non risultano altre reazioni con gli elementi che conosci.”
- “Una vecchia reazione potrebbe essere cambiata.”

Never claim permanent exhaustion when future domains can reactivate an element.

### Relationships

Shows nearby graph relationships.

Examples:

- produces;
- produced by;
- alternate recipe;
- anomaly involving this element.

### Collections

Optional thematic collections this element contributes to.

## Search

Search becomes useful around 15–20 known elements and should then be always available.

Searches:

- element name;
- set name;
- visible collection names.

Future option:
- description keywords.

Do not expose hidden elements through search autocomplete.

## Filters

Minimum mature set:

- set;
- rarity;
- newly discovered;
- has undiscovered known reactions;
- currently exhausted;
- favorite.

Optional:

- collection;
- anomaly involvement;
- recipe completion state.

## Sorting

Recommended:

- recently discovered;
- alphabetical;
- set order;
- rarity;
- most unexplored.

Default should normally be set/recent context, not alphabetical.

## Favorites

Players can favorite any discovered element.

Reasons:

- quick access in laboratory;
- personal collection;
- useful for frequently tested core ingredients.

Favorites are not a progression mechanic.

## Tested-pair history

Do not build a giant global A×B matrix.

From an element page, an **Esperimenti** subview may show known partners grouped as:

- successful;
- anomaly;
- tested with no reaction.

Untested partners remain normal inventory entries.

This gives memory without making the game feel like data entry.

## “Currently exhausted”

An element is currently exhausted when no undiscovered non-secret reaction exists with:

- the player's known elements;
- currently available rules;
- currently unlocked domains.

Suggested icon:
a small completed ring/check, not a dead-end symbol.

Tooltip:

> Hai esplorato tutte le reazioni attualmente note con ciò che possiedi.

When a new domain changes this, the marker disappears and the element can receive a subtle “new possibilities” dot.

This is a major return-to-old-content mechanism.

## New possibilities signal

When progression makes an old discovered element relevant again, the catalog may mark it.

Examples:

- new set unlock adds a valid recipe;
- anomaly becomes resolvable;
- new modifier can act on it.

Suggested label:

> Nuove possibilità

This should be informative, not a full solution.

## Set completion

Normal set completion excludes:

- hidden secret elements not yet revealed;
- future expansion content not active for this save/version;
- intentionally optional easter eggs.

When a secret element is later found, it becomes a **bonus discovery** rather than retroactively invalidating a previously earned completion badge.

This avoids the unpleasant “100% became 92%” problem.

## Completion states

A set can display:

- In corso
- Quasi completo
- Completo
- Completo + segreti trovati

No visible “120%”.

## Discovery graph

Internally, the discovery structure is a graph, not a tree.

An element may have:

- multiple recipes;
- multiple parents;
- many outputs;
- cross-set relationships.

### Graph modes

#### Ancestry

Selected element centered.

Shows known ways the player reached it.

Useful question:

> Come ci sono arrivata?

#### Possibilities

Selected element centered.

Shows known outgoing discovered relationships and abstract markers for eligible undiscovered directions.

Useful question:

> Dove posso andare da qui?

#### Set map

Shows relationships among elements inside one set plus major cross-set bridges.

Useful question:

> Come è costruito questo dominio?

### Graph spoiler rules

The graph only renders:

- discovered nodes;
- intentionally glimpsed nodes;
- explicit anomaly markers.

It never creates empty node shapes for undiscovered secret content.

### Graph edges

Known recipe edge:
solid.

Alternate known recipe:
solid, visually grouped.

Anomaly:
distinct unstable edge.

Unknown possibility:
never points to a hidden node; it may end in a generic question marker if hint settings allow it.

## Mobile graph

Mobile must support:

- pinch zoom;
- pan;
- tap node to focus;
- “center selected” control;
- one-level neighborhood by default.

Do not attempt to render the entire mature 300+ element graph at once on a phone.

## Desktop graph

Desktop can support broader exploration but should still use progressive expansion.

Controls:

- zoom;
- pan;
- center;
- ancestry depth;
- set filter;
- hide completed branches.

## Catalog spoiler preferences

Potential player preference:

### Mystery

Minimal missing counts and fewer silhouettes.

### Balanced

Default design.

### Collector

More visible normal completion data and reaction counts.

These settings never reveal hidden/secret domains.

## New-discovery flow into catalog

A new element reveal offers, but does not force:

- `Usa subito`
- `Vedi scheda`

Default focus remains Laboratory.

The game should not repeatedly drag the player away from experimentation.

## Required future usability test

Before implementation is considered mature, test catalog behavior at simulated collection sizes:

- 20 elements;
- 75 elements;
- 150 elements;
- 300 elements;
- 1,000 elements.

The interface must remain navigable without changing the underlying information model.
