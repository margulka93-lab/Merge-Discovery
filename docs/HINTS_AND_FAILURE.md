# Hints, Failure & Anti-Brute-Force

Status: **design draft v1**

## Core principle

Discovery should reward reasoning and curiosity, not exhaustive pair testing.

The game needs assistance systems that reduce combinatorial fatigue without reducing play to “click the glowing answer”.

## Failure types

The player can receive four distinct experiment outcomes.

### 1. New discovery

A previously unknown element is created.

### 2. Known reaction

A valid recipe creates an already discovered element.

Useful for confirming a relationship, but grants no meaningful repeat XP.

### 3. Anomaly

The pair is intentionally meaningful but cannot yet fully resolve.

The reaction is recorded if its recipe is flagged `anomaly`.

### 4. No reaction

The current pair does not produce anything under current rules.

Message:

> Nessuna reazione.

A failed pair is remembered.

## Failed-pair memory

Every attempted unordered pair is stored as tested.

`A + B` and `B + A` are one tested pair.

Selecting an element should eventually allow the inventory to distinguish:

- untested partner;
- tested — no reaction;
- tested — known recipe;
- tested — anomaly.

This is informational memory, not a hint cost.

The default visual treatment should remain subtle.

## Hint ladder

Assistance becomes stronger only when requested or when the player is demonstrably stalled.

### Tier 0 — Natural affordance

Always available.

Examples:

- semantic art and naming;
- set organization;
- known recipe history;
- tested-pair memory.

### Tier 1 — Reaction availability

Unlocked after the collection becomes large enough to make brute force unreasonable.

For a selected discovered element, the game may state:

> Hai ancora reazioni non scoperte con elementi che conosci.

It should not always give an exact count.

Exact counts can become an advanced catalog option later.

### Tier 2 — Directional clue

Example:

> L'Acqua sembra avere ancora qualcosa da fare con il mondo naturale.

This points toward a semantic family or set, not a specific element.

### Tier 3 — Partner-family clue

Example:

> Una delle reazioni mancanti dell'Acqua coinvolge un elemento di Geologia.

Still no exact partner.

### Tier 4 — Strong clue

Example:

> Prova a pensare a cosa accade quando l'Acqua incontra qualcosa di molto caldo.

This can nearly identify the idea but preserves the final action.

### Tier 5 — Reveal partner

Last-resort accessibility / anti-stuck option.

Example:

> Acqua + Calore → ?

The result remains unrevealed until performed.

The game should very rarely reveal the complete recipe and result without player action.

## Hint access model

Current preferred direction: **no paid or time-gated hint energy**.

Hints should be earned through normal discovery progress and available as a player-controlled assistance feature.

Possible implementation model:

- Tier 1 is free information.
- Tier 2 is free after a short stall condition or user request.
- Tier 3 uses a limited-but-renewable Insight resource.
- Tier 4 costs more Insight.
- Tier 5 is always available after prolonged stall, accessibility mode, or repeated failed attempts.

Exact economy is not yet locked.

## Insight resource — provisional

Working name: **Intuizione**.

Purpose: gate stronger hints without gating experimentation.

Possible sources:

- new element discovery;
- set milestones;
- alternate recipe;
- anomaly resolution.

Critical rule:

A player can always continue experimenting at zero Intuizione.

The resource must never function like stamina.

## Stall detection

The game may infer that assistance is useful when several conditions overlap:

- many consecutive no-reaction attempts;
- no new discoveries for a significant number of experiments;
- repeated testing concentrated around already exhausted elements;
- progression gate is close but the player lacks one of several keystones.

Stall detection should only offer help.

It must never secretly alter recipe outcomes.

## Contextual offer

After a stall threshold:

> Vuoi un indizio?

Options:

- No
- Leggero
- Più chiaro

The game should remember if the player repeatedly declines and avoid nagging.

## “Exhausted element” concept

An element can be marked as **currently exhausted** when, among the player's presently known elements and unlocked rules, it has no remaining undiscovered valid reactions.

This is extremely useful information.

However, display should be optional because some players enjoy uncertainty.

Suggested catalog toggle:

> Mostra elementi senza reazioni note rimanenti

Important: “currently exhausted” is not permanent. New sets can make old elements useful again.

## Why exact reaction counts are dangerous

Showing:

> Acqua — 7/8 ricette

can turn discovery into completion accounting.

Recommended compromise:

- early game: no counts;
- midgame: vague availability;
- advanced completion view: exact counts for already-unlocked, non-secret recipe space;
- secret recipes never inflate visible required completion before discovery.

## Secret recipe protection

Hidden/secret recipes do not contribute to visible “missing recipe” counts before the player has discovered the relevant secret layer.

Otherwise the interface leaks that something exists.

## No-reaction visibility

The catalog should not display a giant global matrix of failed pairs.

For a selected element, tested partners can be filtered or softly marked.

A dedicated experiment history may exist later, but it should not become a spreadsheet-like burden.

## Resonance — advanced hint mechanic

Working concept.

The player activates Resonance on one element.

For a short inspection state, known elements are grouped into:

- quiet;
- faint response;
- strong response.

Important:

A response category is not a guarantee that a direct recipe exists.

It may indicate:

- direct undiscovered recipe;
- anomaly;
- useful semantic family;
- ingredient relevant after another unlock.

This keeps Resonance suggestive rather than deterministic.

Resonance should unlock only after the collection is large enough to need it.

## Critical progression protection

No required era transition may depend on:

- a secret recipe;
- an unhinted single recipe;
- a same-element recipe unless the game has already taught `A + A`;
- an anomaly that looks identical to a normal failure;
- a recipe involving a currently invisible concept with no clue path.

Each critical gate needs at least two of:

- multiple possible keystones;
- alternate recipes;
- contextual clue;
- set clue;
- progress fallback.

## Player styles

The hint system should support three natural play styles.

### Explorer

Wants minimal guidance and enjoys strange experiments.

Can suppress proactive hint offers.

### Collector

Wants completion information and clear remaining-work indicators.

Can enable more counts and filters.

### Relaxed

Wants frequent suggestions without outright solutions.

Can enable earlier contextual clues.

These should be preferences, not separate difficulty modes requiring different save files.
