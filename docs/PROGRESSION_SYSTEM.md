# Progression System

Status: **stable rules / tunable numbers v2**

## Goal

Progression widens what the player can understand and attempt.

The player should feel:

> Ora conosco abbastanza del mio universo perché qualcosa di nuovo possa esistere.

## Discovery Level

Player level represents breadth of discovery.

Exact early XP values live in `XP_AND_LEVELS.md`.

Numbers remain balance-tunable without changing the system.

## Eras

### I — Origini

Approximate:
Lv. 1–8

Sets:
- Origini
- Cosmo

Learns:
- pair combination;
- A+A;
- first reveal;
- Collection;
- first Set expansion.

### II — Mondo

Approximate:
Lv. 9–16

Set:
- Mondo

Learns:
- alternate routes;
- broader reuse;
- Collections;
- tested-pair memory.

### III — Vita

Approximate:
Lv. 17–26

Sets:
- Vita
- Piante
- Funghi
- Animali

Learns:
- branching search space;
- stronger catalog/filtering;
- hidden natural Set;
- remaining-reaction assistance.

### IV — Umanità

Approximate:
Lv. 27–36

Sets:
- Umanità
- Cultura
- Tecnologia

Learns:
- intentional creation;
- symbolic concepts;
- rich cross-era reuse.

### V — Arcano

Approximate:
Lv. 37–46

Sets:
- Magia
- Creature fantastiche

Learns:
- anomaly payoff;
- hidden Set discovery;
- old pairs becoming meaningful.

### VI — Invisibile

Approximate:
Lv. 47–56

Sets:
- Spiriti
- Sogni
- Emozioni

Learns:
- abstract/non-physical ingredients.

### VII — Impossibile

Approximate:
Lv. 57+

Sets:
- Tempo e Dimensioni
- Paradossi
- Entità

Learns:
- late experiment modes;
- conceptual/deep secret chains.

## Gate philosophy

Level gates:
- eligibility;
- advanced feature availability;
- pacing.

Discovery gates:
- actual Set reveal;
- keystone meaning;
- mystery payoff.

## Keystone design

A critical Era transition must not depend on one obscure unhinted pair.

Use combinations of:

- minimum level/eligibility;
- any N of M keystones;
- alternate recipe;
- clue;
- completion fallback.

## Inventory

Discovered elements:

- remain available permanently;
- are reusable infinitely;
- are never consumed by normal combine.

## Pair semantics

- A+B equals B+A;
- A+A is supported where authored;
- base pair outcome is deterministic;
- repeat recipes grant 0 XP.

## Gated future content

Author behavior explicitly:

- dormant;
- anomaly;
- unlock_trigger.

Do not infer every locked recipe as anomaly.

## Feature disclosure

Prefer state-based disclosure:

- Collection after early discoveries;
- Sets after first Set expansion;
- Anomalies after first anomaly;
- Map after graph has useful density.

Advanced hint tools may use level/collection thresholds.

## Anti-stuck

Every critical path needs at least two recovery mechanisms among:

- alternate route;
- multiple keystones;
- contextual hint;
- Set hint;
- progress fallback.

The content validator/simulator enforces reachability.

## Balance status

The **structure is locked** for implementation.

Exact level thresholds and XP values remain tunable through data after playtesting and should never be hard-coded in UI/domain logic.
