# Discovery Architecture

## Terminology

### Element

Anything the player can discover and potentially use in an experiment.

Examples: Vuoto, Acqua, Quercia, Gatto, Nostalgia, Portale.

### Set

The primary collection family of an element.

Examples: Cosmo, Piante, Animali, Emozioni.

An element belongs to one primary set.

### Tag

A cross-cutting semantic property used by rules and discovery logic.

Example for Rosa:

- plant
- flower
- organic
- natural
- terrestrial
- fragile

### Recipe

A specific authored combination that produces a result.

Example:

`Acqua + Terra → Fango`

Input order is normally irrelevant.

### General rule

A rule operating on tags/categories rather than explicit element IDs.

Example:

`[plant] + Fuoco → Cenere`

### Specific override

An authored recipe that has priority over a general rule.

Example:

`Fiore della Fenice + Fuoco → Seme della Fenice`

### Anomaly

A meaningful reaction whose result cannot yet stabilize because its destination domain or another required capability is unavailable.

Anomalies are recorded without exposing the hidden result.

## Combination resolution priority

Provisional order:

1. explicit special recipe;
2. explicit normal recipe;
3. applicable authored tag rule;
4. anomaly condition;
5. no reaction.

This order must later be tested against edge cases.

## Multiple recipes

One element may have multiple valid discovery paths.

Example:

`Terra + Acqua → Fango`

`Polvere + Pioggia → Fango`

Discovering an element does not necessarily mean exhausting all of its recipes.

The encyclopedia can therefore track both:

- element completion;
- recipe completion.

## Player-facing discovery states

### Discovered

Full information available.

### Glimpsed

The player knows a discoverable slot exists and may receive a silhouette, clue or partial metadata.

### Unknown

A visible slot exists but its content is hidden.

### Secret

No slot is shown before discovery.

### Anomalous

The player has observed evidence that a valid reaction exists, but the result cannot yet be resolved.

## Set visibility

Sets can be:

### Announced

Visible in the progression/catalog before unlock.

### Hidden

Absent from the interface until the player discovers evidence of them.

Hidden sets are important to the game's sense of expansion.

## Anomaly behavior

If two inputs map to a valid result from a domain the player should not yet access, the game must not expose the result name or its set.

Example:

`Gatto + Vuoto → [hidden]`

Player-facing result:

> Reazione instabile. Le due essenze sembrano compatibili, ma non riesci ancora a stabilizzarle.

The pair is stored in the anomaly archive.

When the relevant condition later becomes valid, the archive can signal that an old anomaly may now be revisited.

## Anti-brute-force principle

The game should never assume that a player will test every known element against every other known element.

As collection size grows, support systems must narrow the search space without solving combinations automatically.

Candidate systems:

- semantic clues;
- “possible reactions remain” counts;
- resonance hints;
- set-level hints;
- recipe fragments;
- anomaly callbacks;
- goals or research prompts.

Exact hint economics are not yet decided.

## Discovery graph

The catalog should eventually support a relationship view where a player can inspect how an element was reached and what known discoveries branch from it.

This is not necessarily a literal biological tree: many elements have multiple parents and multiple recipes, so the underlying model is a graph.

## Future experiment types

The first game layer should use two-input combinations.

Later layers may introduce carefully gated modifiers:

- conditions: Tempo, Calore, Freddo, Pressione;
- environments: Oceano, Deserto, Palude, Vuoto;
- rare three-part recipes.

These should expand possibility space rather than replace the two-input core.
