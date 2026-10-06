# First Content Slice — v1

Status: **active design draft**

Purpose: prove that the early universe can form a coherent reachable graph before we author hundreds of elements.

This slice is larger than the first 30–60 minutes. It is the first several hours' content sandbox.

## Starting concepts

The player begins with four reusable concepts:

1. Vuoto
2. Energia
3. Materia
4. Tempo

They are conceptual tools, not consumable quantities.

## Set structure in this slice

### Origini

- Vuoto
- Energia
- Materia
- Tempo
- Luce
- Calore
- Spazio
- Gravità

### Materia

- Plasma
- Gas

This set is intentionally tiny in v1 and must later either grow or be folded into Origini.

### Cosmo

- Polvere cosmica
- Nebulosa
- Stella
- Asteroide
- Cometa
- Pianeta
- Luna
- Sistema stellare
- Galassia

### Mondo

- Lava
- Roccia
- Terra
- Sabbia
- Montagna
- Vulcano
- Acqua
- Oceano
- Atmosfera
- Vento
- Vapore
- Nuvola
- Pioggia
- Umidità

This replaces the earlier split between Geologia and Atmosfera e Acque for the first content pass.

Reason:

A single `Mondo` set is more legible to the player and has healthier early content density. Geology, climate and waters can remain tags/collections unless later volume justifies promotion.

### Vita

- Vita
- Cellula
- Batterio
- Alga

This is currently a small bridge set. It must expand later.

### Piante

- Muschio
- Seme
- Germoglio
- Albero

This set is underfilled and exists only to test the branch. Later content will expand it substantially.

### Funghi

- Muffa
- Fungo

Hidden set proof-of-concept only. Later content will expand it.

Total current elements: **43**.

## Core recipe graph

### Primordial reactions

- Vuoto + Energia → Luce
- Energia + Energia → Calore
- Energia + Materia → Plasma
- Vuoto + Tempo → Spazio
- Materia + Spazio → Gravità
- Materia + Calore → Gas
- Materia + Tempo → Polvere cosmica

### Cosmos

- Polvere cosmica + Luce → Nebulosa
- Plasma + Gravità → Stella
- Polvere cosmica + Gravità → Asteroide
- Polvere cosmica + Spazio → Cometa
- Stella + Polvere cosmica → Pianeta
- Pianeta + Polvere cosmica → Luna
- Stella + Pianeta → Sistema stellare
- Stella + Stella → Galassia

### World

- Pianeta + Calore → Lava
- Lava + Tempo → Roccia
- Pianeta + Cometa → Acqua
- Cometa + Calore → Acqua — alternate recipe
- Acqua + Pianeta → Oceano
- Roccia + Tempo → Terra
- Roccia + Acqua → Sabbia
- Roccia + Pianeta → Montagna
- Montagna + Lava → Vulcano
- Gas + Gravità → Atmosfera
- Atmosfera + Energia → Vento
- Acqua + Calore → Vapore
- Vapore + Atmosfera → Nuvola
- Nuvola + Nuvola → Pioggia
- Pioggia + Calore → Umidità

### First life

- Oceano + Energia → Vita
- Vita + Acqua → Cellula
- Cellula + Terra → Batterio
- Vita + Luce → Alga

### Plants

- Alga + Terra → Muschio
- Vita + Terra → Seme
- Seme + Acqua → Germoglio
- Germoglio + Tempo → Albero

### First hidden natural branch

- Vita + Umidità → Muffa
- Muffa + Tempo → Fungo

## Unlock flow

### Origini

Available immediately.

### Cosmo

Announced but initially locked.

Preferred keystone:

`Plasma + Gravità → Stella`

Stella reveals the full Cosmo set.

### Mondo

Announced only after Cosmo begins.

Preferred eligibility trigger: Pianeta.

Preferred reveal trigger: first successful world-forming discovery such as Lava or Acqua.

### Vita

Not displayed as an ordinary future locked set.

Preferred reveal:

`Oceano + Energia → Vita`

This should receive a major transition reveal.

### Piante

Foreshadowed only after Vita exists.

Preferred reveal: Seme or Muschio.

### Funghi

Hidden.

No catalog slot before:

`Vita + Umidità → Muffa`

The Muffa discovery reveals the set.

## Water bottleneck revision

v0 required:

`Cometa + Calore → Acqua`

That was too fragile as the only path to a critical ingredient.

v1 makes the more conceptually legible world-building recipe primary:

`Pianeta + Cometa → Acqua`

Interpretation:

A young world receives water-bearing material from icy bodies.

The original `Cometa + Calore → Acqua` remains as an alternate route.

This gives Acqua two paths and teaches alternate recipes naturally.

## Scientific tone

The game is conceptually coherent, not a scientific simulator.

Early recipes should pass this test:

> Can a curious player understand the association after seeing the result?

They do not need to represent literal chemistry or astrophysics.

Descriptions may add a one-sentence real-world connection where appropriate without presenting symbolic recipes as exact scientific processes.

## Candidate first anomaly

Provisional only:

`Luna + Vita → unstable reaction`

The future result is intentionally unspecified.

Purpose:

- teach that a meaningful pair can exist before its domain is available;
- foreshadow a later rule expansion;
- avoid revealing a fantasy set name.

This recipe should remain optional and must not gate early progression.

## Reachability requirements

Later automated validation must confirm:

1. every required non-secret element is reachable from the starters;
2. unlock conditions do not create circular dependencies;
3. no critical set requires a single unhinted obscure pair;
4. alternate recipes do not accidentally bypass intended progression;
5. hidden recipes do not leak into visible completion counts.

## Current content-design issues

- Materia is too small as a mature set.
- Vita is too small as a mature set.
- Piante and Funghi are only skeletal proof branches.
- Mondo may become large; tags/collections must keep navigation manageable.
- Some cosmic recipes remain symbolic and need description review.
- The first anomaly's eventual canonical result has not been chosen.
