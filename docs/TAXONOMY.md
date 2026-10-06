# Taxonomy

This document defines the hierarchy used to organize content. The distinction is important for scaling the game without turning every theme into a first-class set.

## 1. Era

An **Era** is a macro progression chapter.

It answers: **what kind of reality is the player currently learning to create?**

Examples:

- Origini
- Mondo
- Vita
- Umanità
- Arcano
- Invisibile
- Impossibile

Eras are progression structure, not element ownership. An element does not need an `era_id` if its set already determines the relevant era.

## 2. Set

A **Set** is the primary catalog family of an element.

Every element belongs to exactly one set.

Examples:

- Cosmo
- Geologia
- Piante
- Funghi
- Animali
- Cultura
- Tecnologia
- Magia
- Sogni

Sets drive:

- catalog sections;
- completion percentage;
- unlock events;
- presentation accents;
- some hint logic;
- set completion rewards.

A set should be large and meaningful enough that unlocking it feels like a new discovery space.

## 3. Collection

A **Collection** is an optional thematic grouping that may cross sets.

Elements may belong to zero, one or many collections.

Examples:

- Creature notturne
- Cose che volano
- Felini
- Tempeste
- Cose rosse
- Spazio profondo
- Vita marina
- Inventori
- Oggetti impossibili

Collections exist for optional goals, achievements and extra discovery structure.

They should not gate core progression.

This layer solves a major taxonomy problem: themes such as Habitat, Clima, Mestieri or Cucina do not automatically need to become full sets.

## 4. Tag

A **Tag** is semantic metadata used primarily by game logic.

Tags can support:

- generic combination rules;
- hint generation;
- filtering;
- validator checks;
- collection membership;
- future content tooling.

Example:

`Rosa`

Primary set: `piante`

Tags:

- plant
- flower
- organic
- living
- terrestrial
- fragile

Tags are not necessarily visible to the player.

## 5. Rarity

Rarity is orthogonal to Set.

Current scale:

1. Comune
2. Insolito
3. Raro
4. Straordinario
5. Segreto

Rarity describes discovery unusualness, route complexity or secrecy.

It does not describe combat power or economic value.

## 6. Visibility class

Each set and element can have a visibility class independent of rarity.

### Announced

Shown before unlock.

### Hidden

Not shown before a reveal condition.

### Secret

Designed as optional surprise content and excluded from normal completion pressure until discovered.

## 7. Unlock mode

A set can unlock by one of these modes.

### Level

Unlocked when the required player level is reached.

### Discovery

Unlocked by discovering a qualifying element or concept.

### Hybrid

Requires both a progression threshold and a discovery condition.

### Secret trigger

Unlocked by a specific hidden recipe, anomaly resolution or special condition.

## 8. Element ownership rule

An element has exactly one primary Set even when several classifications would be defensible.

Example:

`Sirena`

Primary set: `creature_fantastiche`

Possible tags/collections:

- aquatic
- humanoid
- mythic
- living
- folklore
- sea-creatures

This prevents duplicate catalog ownership.

## 9. Set creation test

Before creating a new Set, ask:

1. Can it support a substantial number of meaningful elements?
2. Does unlocking it create a genuinely new search space?
3. Does it deserve its own completion identity?
4. Would it still matter if collections and tags existed?
5. Does it create useful cross-set recipes?

If most answers are no, use a Collection or Tag instead.

## 10. Current classification decisions

### Full sets

Strong candidates:

- Origini
- Cosmo
- Materia
- Geologia
- Atmosfera e Acque
- Vita
- Piante
- Funghi
- Animali
- Umanità
- Cultura
- Tecnologia
- Magia
- Creature fantastiche
- Spiriti
- Sogni
- Emozioni
- Tempo e Dimensioni
- Paradossi
- Entità

### Prefer collections/tags unless content proves otherwise

- Clima
- Habitat
- Mestieri
- Cucina
- Vita marina
- Insetti
- Rettili
- Uccelli
- Mammiferi
- Notturni
- Spazio profondo

These can later be promoted to Sets if content volume and progression justify it.
