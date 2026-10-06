# Progression System

## Design goal

Progression should continually widen the player's possibility space without turning levels into arbitrary locks.

The player should feel:

> I understand more of this universe, therefore I can now make stranger things.

## Player level

Working name: **Livello di Scoperta**.

The exact public-facing name may change.

Level primarily represents breadth of understanding, not power.

## Sources of progression XP

XP should strongly favor novelty.

Relative reward hierarchy:

1. first discovery of a secret set;
2. first discovery of a new element;
3. set completion;
4. anomaly resolution;
5. discovering an alternate recipe;
6. registering a new anomaly;
7. repeating a known recipe: no meaningful XP.

Exact numbers are deferred until the content graph is mapped.

## Era structure

The current target progression uses seven broad eras.

### Era I — Origini

Approximate level band: 1–8.

Focus:

- primitive concepts;
- energy;
- matter;
- first cosmic bodies.

Primary sets:

- Origini
- Cosmo
- Materia

Player learns:

- two-input combination;
- new discovery reveal;
- catalog;
- basic clue language.

### Era II — Mondo

Approximate level band: 9–16.

Focus:

- planets becoming places;
- geology;
- atmosphere;
- water;
- climate-like phenomena.

Primary sets:

- Geologia
- Atmosfera e Acque

Player learns:

- generic tag rules;
- alternate recipes;
- first collections.

### Era III — Vita

Approximate level band: 17–26.

Focus:

- living systems;
- plants;
- fungi;
- animals.

Primary sets:

- Vita
- Piante
- Funghi
- Animali

Player learns:

- large branching discovery spaces;
- stronger catalog filtering;
- first “remaining reactions” hints;
- optional collection goals.

### Era IV — Umanità

Approximate level band: 27–36.

Focus:

- people;
- culture;
- tools;
- technology.

Primary sets:

- Umanità
- Cultura
- Tecnologia

Player learns:

- combinations between natural and human-made domains;
- more alternate recipes;
- richer clue types.

### Era V — Arcano

Approximate level band: 37–46.

Focus:

- first major break from ordinary reality.

Primary sets:

- Magia
- Creature fantastiche

Visibility:

At least one primary set should be hidden before its first reveal.

Player learns:

- anomaly resolution;
- old combinations becoming valid;
- hidden set discovery;
- secret recipes.

### Era VI — Invisibile

Approximate level band: 47–56.

Focus:

- emotions;
- dreams;
- spirits;
- memory-like concepts.

Primary sets:

- Spiriti
- Sogni
- Emozioni

Player learns:

- abstract ingredients;
- poetic but internally consistent recipes;
- more non-physical discovery chains.

### Era VII — Impossibile

Approximate level band: 57+.

Focus:

- time;
- dimensions;
- paradoxes;
- cosmic or conceptual entities.

Primary sets:

- Tempo e Dimensioni
- Paradossi
- Entità

Player learns:

- endgame experiment modifiers;
- rare multi-stage discoveries;
- deep secret content.

## Level gates versus discovery gates

Level gates should primarily unlock **capability**.

Examples:

- a new announced set can begin appearing;
- a new hint type becomes available;
- an experiment modifier slot becomes available.

Discovery gates should primarily unlock **meaning**.

Examples:

- discovering Muffa reveals Funghi;
- resolving an impossible reaction reveals Magia;
- discovering Incubo reveals a hidden branch of Sogni.

This keeps progression from feeling like a checklist of arbitrary level locks.

## Set unlock categories

### Scheduled announced set

The catalog shows the set in advance with a lock.

Example:

`Piante — si apre durante l'Era Vita`

Avoid exact level spoilers unless helpful.

### Discovery set

The set exists as a hidden or unnamed slot until an anchor discovery occurs.

Example:

Muffa → reveal Funghi.

### Secret set

No slot and no completion requirement exist before discovery.

The first discovery reveals both the element and the existence of its set.

## Keystone discoveries

Each era should contain several **keystone discoveries** that demonstrate mastery of the current search space.

Progression must not rely on one fragile recipe.

Recommended gate structure:

- required level threshold;
- plus any N of M keystone discoveries;
- OR a high enough era completion percentage as fallback.

This reduces the risk of players becoming stuck on one obscure combination.

## Anomalies and future sets

Not every recipe leading to locked content becomes visible as an anomaly.

Each future-crossing recipe must be explicitly flagged as one of:

- `dormant` — behaves as no reaction until eligible;
- `anomaly` — visibly reacts and is stored;
- `unlock_trigger` — can directly reveal a hidden set when progression conditions are met.

This prevents the anomaly archive from filling with accidental spoilers.

## Inventory semantics

Current decision proposal:

Once discovered, an element is conceptually owned forever and may be reused infinitely.

Combining does not consume elements.

Reasons:

- experimentation remains frictionless;
- no farming loop is required;
- collection state is simple and legible;
- focus stays on discovery rather than resource management.

## Same-element combinations

The engine must permit explicit `A + A` recipes.

Examples may include:

- Albero + Albero → Foresta
- Stella + Stella → Sistema binario

Same-element combination is not universally valid; it uses authored recipes like any other pair.

## Recipe order

Two-input recipes are unordered by default.

`A + B` equals `B + A`.

If future experiment modifiers introduce directional behavior, that should be modeled separately rather than making base recipes order-sensitive.

## Anti-stuck design

Every progression chapter must be audited for reachable paths.

Potential recovery tools:

- free contextual clue after repeated failed experimentation;
- set-level clue;
- resonance;
- “known element still has undiscovered reactions” indicator;
- optional goals pointing toward unexplored families;
- alternate recipes.

No critical progression node should depend on a single obscure, unhinted recipe.
