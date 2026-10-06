# Hints, Failure & Anti-Brute-Force

Status: **stable system v2**

## Core principle

Discovery rewards reasoning and curiosity, not exhaustive pair testing.

Hints reduce combinatorial fatigue without turning the game into “click the highlighted answer”.

## Outcomes

### New discovery

Previously unknown element.

### Known reaction

Known recipe/result.

Repeat XP:
0.

### Anomaly

Authored meaningful reaction that cannot yet resolve.

### No reaction

Message:

> Nessuna reazione.

The pair is remembered.

## Tested-pair memory

Every attempted unordered pair is stored.

A+B and B+A are the same PairKey.

Contextual states may include:

- untested;
- tested no-reaction;
- known success;
- anomaly.

This memory is always free and never a resource.

## Hint philosophy

**There is no hint currency in the core product.**

No Intuizione points, tickets, ads or timers are required to request help.

Stronger hints become available through:

- player request;
- progression;
- collection size;
- detected stall.

Using hints does not reduce rewards or disable achievements.

## Hint ladder

### Tier 0 — natural information

Always available:

- art/name semantics;
- Set organization;
- recipe history;
- tested-pair memory;
- current exhaustion state where the information mode permits it.

### Tier 1 — reaction availability

Example:

> Hai ancora reazioni non scoperte con elementi che conosci.

No exact answer.

### Tier 2 — directional clue

Example:

> L’Acqua sembra avere ancora qualcosa da fare con il mondo naturale.

### Tier 3 — partner-family clue

Example:

> Una delle reazioni mancanti coinvolge un elemento del Mondo.

### Tier 4 — strong conceptual clue

Example:

> Pensa a cosa succede quando l’acqua incontra qualcosa di molto caldo.

### Tier 5 — partner reveal

Last-resort / explicit strong-help request.

Example:

> Acqua + Calore → ?

The player still performs the experiment and discovers the result.

## Availability

Tier 1:
available once the catalog is large enough that blind matrix testing is unreasonable.

Tier 2:
available on explicit request.

Tier 3:
available after repeated stall or in Relaxed information preference.

Tier 4:
available after stronger stall or repeated request for a clearer hint.

Tier 5:
available as an explicit “Mostrami con cosa provare” action after prolonged stall.

No real-time waiting period.

## Stall detection

May consider:

- consecutive no-reactions;
- many experiments without discovery;
- repeating exhausted branches;
- player near a critical progression gate without a keystone.

Stall detection only offers help.

It never:

- changes recipe odds;
- secretly grants discoveries;
- changes canonical outcomes.

## Proactive offer

Example:

> Vuoi un indizio?

Choices:

- Non ora
- Leggero
- Più chiaro

If repeatedly declined, suppress further proactive offers for the session/context.

## Currently exhausted

An element is currently exhausted when no discoverable non-secret reaction currently exists with:

- known elements;
- unlocked rules;
- active experiment mode.

This state is recalculated whenever content/progression changes.

Player-facing language:

> Hai esplorato tutte le reazioni attualmente note con ciò che possiedi.

Never imply permanent exhaustion.

## Exact counts

Default Balanced mode:
avoid exact missing-recipe counts.

Mystery mode:
show even less.

Collector mode:
may show exact missing counts for **currently eligible non-secret** recipe space.

Secret/dormant content never inflates visible counts.

## Secret protection

Hints must not expose:

- hidden Set name;
- secret result;
- partner whose very existence is hidden;
- secret missing count.

## No-reaction history

No global A×B spreadsheet.

Element Detail includes an Experiments view with:

- Successi
- Anomalie
- Nessuna reazione

This is memory, not a puzzle solution screen.

## Resonance

Resonance is an **optional future advanced browsing aid**, not required for seed implementation.

If implemented after large catalogs:

- selected element can group known partners into semantic response bands;
- response is suggestive, not a guarantee;
- it never highlights the exact solution by default.

Do not build Resonance in initial Codex phases unless separately scoped.

## Critical progression protection

No required Era transition can depend on:

- hidden secret recipe;
- one obscure unhinted recipe;
- A+A before A+A has been taught;
- an anomaly indistinguishable from ordinary failure;
- invisible concept without clue path.

Critical gates have at least two recovery mechanisms.

## Player information preferences

### Mystery

Minimal proactive information.

### Balanced

Default.

### Collector

More completion/exhaustion counts.

Hint strength remains separately user-controlled; these are not difficulty modes.
