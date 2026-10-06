# Taxonomy

Status: **stable design v2**

This document defines the hierarchy used to organize content.

## 1. Era

An **Era** is a macro progression chapter.

It answers:

> What kind of reality is the player currently learning to create?

Current Eras:

- Origini
- Mondo
- Vita
- Umanità
- Arcano
- Invisibile
- Impossibile

Eras organize progression. They are not element ownership buckets.

## 2. Set

A **Set** is the primary catalog family of an element.

Every element belongs to exactly one Set.

Examples:

- Origini
- Cosmo
- Mondo
- Piante
- Animali
- Cultura
- Tecnologia
- Magia
- Sogni

Sets drive:

- catalog sections;
- completion;
- reveal events;
- visual accents;
- some hint logic;
- Set completion rewards.

A Set must be large/meaningful enough that revealing it opens a real new discovery space.

### Important resolved choice

**Materia is not a separate player-facing Set in the first game architecture.**

Matter-related primitive concepts such as Plasma and Gas belong to **Origini**.

Likewise:

- Geologia;
- Acque;
- Clima;
- Fenomeni atmosferici

remain Collections/Tags inside **Mondo** unless future content volume proves a separate Set is justified.

## 3. Collection

A **Collection** is an optional thematic grouping that may cross Sets.

Elements may belong to zero, one or many Collections.

Examples:

- Creature notturne
- Cose che volano
- Felini
- Ciclo dell'acqua
- Vita marina
- Inventori
- Oggetti impossibili

Collections:

- provide optional completion goals;
- can span multiple Eras;
- do not gate core progression.

## 4. Tag

A **Tag** is semantic metadata used mainly by game logic.

Uses:

- generic rules;
- hint generation;
- filtering;
- validation;
- Collection authoring;
- future tooling.

Example:

`Rosa`

Primary Set:
`plants`

Tags may include:

- plant
- flower
- organic
- living
- terrestrial
- fragile

Tags are not necessarily player-facing.

## 5. Rarity

Rarity is independent from Set.

Current scale:

1. Comune
2. Insolito
3. Raro
4. Straordinario
5. Segreto

Rarity expresses discovery unusualness, complexity or secrecy.

It is not power or economic value.

## 6. Visibility

Set/element visibility is independent from rarity.

### Announced

Can be shown before unlock.

### Discovery

Revealed through ordinary progression discovery.

### Hidden

Absent until an authored reveal.

### Secret

Optional surprise content excluded from normal completion pressure before discovery.

## 7. Unlock mode

A Set can unlock through:

- level/era eligibility;
- discovery;
- hybrid gate;
- secret trigger.

Level opens possibility; discovery provides the reveal.

## 8. Element ownership

One primary Set only.

Example:

`Sirena`

Primary Set:
`fantastic_creatures`

Possible tags/Collections:

- aquatic
- humanoid
- mythic
- living
- sea_creatures

No duplicate catalog ownership.

## 9. Set creation test

Before creating a Set, ask:

1. Can it support a substantial meaningful roster?
2. Does revealing it open a new search space?
3. Does it deserve independent completion?
4. Would it still matter if Collections/Tags existed?
5. Does it create useful cross-Set recipes?

If most answers are no, use Collection or Tag.

## 10. Current core Set architecture

### Era I — Origini

- Origini
- Cosmo

### Era II — Mondo

- Mondo

### Era III — Vita

- Vita
- Piante
- Funghi
- Animali

### Era IV — Umanità

- Umanità
- Cultura
- Tecnologia

### Era V — Arcano

- Magia
- Creature fantastiche

Potential future Set only if content justifies:
- Luoghi impossibili

### Era VI — Invisibile

- Spiriti
- Sogni
- Emozioni

### Era VII — Impossibile

- Tempo e Dimensioni
- Paradossi
- Entità

## 11. Default Collection/Tag themes

Prefer Collection/Tag unless later promoted:

- Geologia
- Acque
- Clima
- Habitat
- Mestieri
- Cucina
- Vita marina
- Insetti
- Rettili
- Uccelli
- Mammiferi
- Felini
- Notturni
- Spazio profondo
- Trasporti
- Arte
- Scienza
- Incubi
- Memorie
