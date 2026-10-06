# Progression System

## Design goal

Progression should continually widen the player's possibility space without turning levels into arbitrary locks.

The player should feel:

> I understand more of this universe, therefore I can now make stranger things.

## Player level

Working name: **Livello di Scoperta**.

Level represents breadth of understanding, not power.

Exact XP values are tracked in `XP_AND_LEVELS.md`.

## Era structure

### Era I — Origini

Approximate level band: 1–8.

Primary Sets:

- Origini
- Materia
- Cosmo

Player learns:

- two-input combination;
- new discovery reveal;
- same-element recipes;
- catalog;
- basic clue language.

### Era II — Mondo

Approximate level band: 9–16.

Primary Set:

- Mondo

Geology, waters and atmospheric phenomena are currently represented through tags/collections inside Mondo rather than separate Sets.

Player learns:

- alternate recipes;
- broader cross-set reuse;
- first optional Collections;
- tested-pair memory becoming important.

### Era III — Vita

Approximate level band: 17–26.

Primary Sets:

- Vita
- Piante
- Funghi
- Animali

Player learns:

- large branching discovery spaces;
- stronger catalog filtering;
- remaining-reaction assistance;
- hidden natural Sets.

### Era IV — Umanità

Approximate level band: 27–36.

Primary Sets:

- Umanità
- Cultura
- Tecnologia

Player learns:

- combinations between natural and human-made domains;
- richer alternate routes;
- broader Collection goals.

### Era V — Arcano

Approximate level band: 37–46.

Primary Sets:

- Magia
- Creature fantastiche

At least one major Set is hidden before reveal.

Player learns:

- anomaly resolution;
- old elements gaining new possibilities;
- hidden Set discovery;
- secret recipes.

### Era VI — Invisibile

Approximate level band: 47–56.

Primary Sets:

- Spiriti
- Sogni
- Emozioni

Player learns:

- abstract ingredients;
- poetic but internally consistent recipes;
- non-physical discovery chains.

### Era VII — Impossibile

Approximate level band: 57+.

Primary Sets:

- Tempo e Dimensioni
- Paradossi
- Entità

Player learns:

- endgame experiment modifiers;
- rare multi-stage discoveries;
- deep secret content.

## Level gates versus discovery gates

Level gates primarily unlock **capability or eligibility**.

Examples:

- an announced Set can become eligible;
- an advanced hint tool becomes available;
- a future experiment modifier can be introduced.

Discovery gates primarily unlock **meaning**.

Examples:

- Stella reveals Cosmo;
- Vita reveals the Life branch;
- Muffa reveals Funghi;
- a future anomaly resolution may reveal Magia.

## Set unlock categories

### Announced

Visible before unlock.

### Discovery

Revealed by a qualifying discovery.

### Hybrid

Requires both progression eligibility and a discovery condition.

### Secret

No slot is shown before its trigger.

## Keystone discoveries

Each Era contains several keystone discoveries that demonstrate mastery.

Progression must not rely on one fragile recipe.

Recommended gate design:

- a minimum progression threshold;
- plus any N of M keystones;
- with a completion/fallback route when appropriate.

## Anomalies and future Sets

Each future-crossing recipe is explicitly authored as one of:

- `dormant` — behaves as no reaction until eligible;
- `anomaly` — visibly reacts and is archived;
- `unlock_trigger` — can reveal a hidden Set when conditions are met.

Not every future recipe becomes an anomaly.

## Inventory semantics

Once discovered, an element is permanently available and infinitely reusable.

Combining does not consume it.

This keeps experimentation frictionless and removes resource farming from the core loop.

## Same-element combinations

Explicit `A + A` recipes are supported.

Examples:

- Energia + Energia → Calore
- Albero + Albero → possible future forest result

Same-element combination is never universally valid.

## Recipe order

Base two-input recipes are unordered.

`A + B` equals `B + A`.

Directional behavior, if ever introduced, belongs to a separate modifier/mechanic rather than the base pair model.

## Anti-stuck design

Every progression chapter must be audited for reachability.

Critical gates require more than one recovery path through combinations of:

- alternate recipes;
- multiple acceptable keystones;
- contextual clue;
- set-level clue;
- resonance;
- progress fallback.

No critical node may depend on a single obscure unhinted recipe.

## First-session philosophy

Detailed in `FIRST_SESSION_EXPERIENCE.md`.

Core rule:

Features are disclosed when they become useful rather than all appearing at level 1.

Examples:

- Collection after a few discoveries;
- Set browser after the first meaningful Set expansion;
- Anomaly archive only after the first anomaly;
- discovery graph after enough relationships exist to justify it.
