# First Content Slice — v0

Status: **design draft**

Purpose: prove that the early universe can form a coherent reachable graph before we author hundreds of elements.

This is not yet the final recipe list.

## Starting principles

The player begins with four reusable concepts:

1. Vuoto
2. Energia
3. Materia
4. Tempo

They are not consumed when used.

The opening should make clear that these are conceptual building blocks, not physical inventory quantities.

## First 42 elements

### Origini

1. Vuoto — starter
2. Energia — starter
3. Materia — starter
4. Tempo — starter
5. Luce
6. Calore
7. Spazio
8. Gravità

### Materia

9. Plasma
10. Gas

### Cosmo

11. Polvere cosmica
12. Nebulosa
13. Stella
14. Asteroide
15. Cometa
16. Pianeta
17. Luna
18. Sistema stellare
19. Galassia

### Geologia

20. Lava
21. Roccia
22. Terra
23. Sabbia
24. Montagna
25. Vulcano

### Atmosfera e Acque

26. Acqua
27. Oceano
28. Atmosfera
29. Vento
30. Vapore
31. Nuvola
32. Pioggia
33. Umidità

### Vita

34. Vita
35. Cellula
36. Batterio
37. Alga

### Piante

38. Muschio
39. Seme
40. Germoglio
41. Albero

### Funghi

42. Muffa
43. Fungo

The draft currently contains 43 rather than 42 elements. This is intentional: content sizing should follow the graph rather than an arbitrary round number.

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
- Cometa + Calore → Acqua
- Acqua + Pianeta → Oceano
- Roccia + Tempo → Terra
- Roccia + Acqua → Sabbia
- Roccia + Pianeta → Montagna
- Montagna + Lava → Vulcano

### Atmosphere and water cycle

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

### First hidden branch

- Vita + Umidità → Muffa
- Muffa + Tempo → Fungo

This draft uses Funghi as the first example of a discovery-revealed set.

## Unlock demonstration

The slice intentionally demonstrates several unlock modes.

### Origini

Available immediately.

### Materia

Announced.

First qualifying discovery: Plasma or Gas.

### Cosmo

Announced but locked at the start.

Suggested reveal trigger: first Stella.

The player may have seen a locked `Cosmo` entry before this point.

### Geologia

Announced later.

Suggested reveal trigger: first Lava or Roccia after the world exists.

### Atmosfera e Acque

Announced.

Suggested reveal trigger: first Acqua.

### Vita

Not shown as a normal locked set before its first discovery.

Suggested reveal trigger:

`Oceano + Energia → Vita`

The reveal should feel larger than a routine element discovery.

### Piante

Can be foreshadowed after Vita exists.

Suggested reveal trigger: Seme or Muschio.

### Funghi

Hidden.

No catalog slot before discovery.

`Vita + Umidità → Muffa`

The first Muffa reveal also reveals the existence of the Funghi set.

## Why this slice is useful

It already demonstrates:

- starter concepts;
- same-element recipe: Energia + Energia;
- cross-set combinations;
- set discovery;
- hidden set discovery;
- elements remaining useful across several eras;
- one element having a long gameplay life, especially Energia, Materia, Tempo, Acqua and Calore.

## Known weaknesses to review

### Scientific looseness

Some combinations are symbolic rather than scientifically literal.

Examples:

- Materia + Spazio → Gravità
- Stella + Polvere cosmica → Pianeta
- Cometa + Calore → Acqua

The intended tone is intuitive discovery, not a physics simulator.

We should decide how far this looseness can go while early progression still feels coherent.

### Water bottleneck

Acqua currently depends on discovering Cometa.

This may be too obscure for a critical early ingredient.

Potential alternatives:

- provide a second recipe for Acqua;
- add Ghiaccio;
- add Idrogeno/Ossigeno later but avoid chemistry overload;
- use a guided clue around Cometa.

### Atmosphere naming

`Atmosfera e Acque` may be too broad as a set name.

Potential alternatives:

- Mondo naturale
- Cielo e Acque
- Atmosfera
- Acque

This should be tested against future content volume.

### Life origin

`Oceano + Energia → Vita` is elegant and readable but intentionally simplified.

This is probably acceptable if descriptions make clear that the game is conceptual rather than didactic.

## Required validator for this content later

When implementation begins, an automated graph validator must confirm that every non-secret element in the slice is reachable from the four starters under the intended unlock rules.
