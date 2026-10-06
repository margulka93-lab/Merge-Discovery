# First Session Experience

Status: **design draft v1**

This document designs the first 30–60 minutes as an experience rather than a fixed tutorial script.

The game must teach through successful experimentation and progressive disclosure.

## First-session goals

By the end of a normal first session, the player should understand that:

- discovered elements are permanently reusable;
- combinations are normally unordered;
- the same element may sometimes be used twice;
- not every pair reacts;
- old elements remain useful;
- the catalog remembers discoveries;
- sets can appear as the universe expands;
- some future possibilities are deliberately hidden;
- the game is larger than the initial scientific-looking layer suggests.

The player should not need to learn all of these through text.

## Opening

### Screen 1

Title and immediate start.

No account creation requirement.
No lore wall.
No tutorial carousel.

Suggested line:

> Combina. Scopri. Espandi il possibile.

### First laboratory state

Only the laboratory is functionally available.

Four starting concepts are present:

- Vuoto
- Energia
- Materia
- Tempo

They are reusable and cannot be lost.

The combine area has two slots.

Interaction supports:

- tap element → fill next free slot;
- drag element → slot;
- tap a filled slot → remove;
- explicit `Combina` action after two slots are filled.

The first version should not auto-combine the instant the second element touches the slot. The explicit action gives the player a readable moment of intent and works consistently with touch.

## First instruction

One sentence only:

> Scegli due concetti e prova a combinarli.

The UI should visually demonstrate the two empty slots without forcing one specific recipe.

## Starter-pair design

The four starter concepts must contain several valid combinations so free experimentation is likely to succeed.

Planned valid early pairs include:

- Vuoto + Energia → Luce
- Energia + Energia → Calore
- Energia + Materia → Plasma
- Vuoto + Tempo → Spazio
- Materia + Tempo → Polvere cosmica

This deliberately teaches that:

- different pairs can work;
- `A + A` can work;
- the player is not following one mandatory recipe chain.

## Failure in the first minute

An invalid combination is allowed immediately.

Feedback:

> Nessuna reazione.

No red error language.
No lost resource.
No cooldown.

If the player's first two attempts both fail, the game gives a subtle one-time assist:

> Alcuni concetti sembrano reagire più facilmente all'Energia.

No exact answer is highlighted.

## First discovery reveal

The first discovery receives a clear but short reveal:

1. combination contracts into the central reaction area;
2. brief visual transformation;
3. element illustration appears;
4. name appears;
5. `Nuova scoperta`;
6. element moves into the known-element inventory.

Target duration: approximately 1.5–2.5 seconds before the player can continue.

The reveal should feel rewarding without making repeated discovery slow.

## Progressive disclosure

The first session should not expose every menu at launch.

### At 1 discovered element

Laboratory remains the focus.

The new element simply joins the available inventory.

### At 3 discovered elements

Unlock **Collezione**.

Micro-message:

> Le tue scoperte vengono archiviate qui.

No forced navigation.

### At 5 discovered elements

The collection begins displaying the concept of **Set**.

The player sees `Origini` as their first coherent family.

### On first announced-set reveal

Unlock the full **Set** browser.

### On first anomaly

Unlock **Archivio anomalie**.

Do not show an empty anomaly menu before the player has any reason to understand it.

### After enough branching exists

Unlock the **Mappa delle scoperte**.

Recommended trigger: approximately 15–20 discovered elements rather than a fixed player level.

## Expected pacing

These are target windows for a curious new player, not hard timers.

### 0–5 minutes — “I understand the toy”

Expected:

- 2–5 new discoveries;
- at least one successful free experiment;
- likely discovery of Luce, Calore, Plasma, Spazio or Polvere cosmica;
- Collection becomes available near the end of this phase.

Desired feeling:

> Ah, okay. I can just try things.

### 5–15 minutes — “There is a structure”

Expected:

- most foundational Origini concepts discovered;
- Gravità and/or Gas become reachable;
- the player starts reusing earlier discoveries;
- first visible progress inside a set;
- first player level increases.

Desired feeling:

> These aren't random recipes; things connect.

### 15–25 minutes — “The universe opens”

Expected milestone:

`Plasma + Gravità → Stella`

Stella acts as a keystone.

Its discovery reveals or fully unlocks **Cosmo**.

Set reveal should be stronger than a normal element reveal:

> NUOVO SET — COSMO

The catalog visibly gains a new section.

Desired feeling:

> Oh. This is going somewhere much bigger.

### 25–40 minutes — “I can make a world”

Expected discoveries may include:

- Nebulosa
- Asteroide
- Cometa
- Pianeta
- Luna
- Sistema stellare
- Galassia

The player should not be expected to find all of them before progressing.

Creating Pianeta makes world-building branches eligible.

The first world-scale discovery reveals the next announced set, currently working-titled **Mondo**.

Desired feeling:

> I started with nothing and now I have a place.

### 40–60 minutes — “Something new is alive”

Fast/curious players may reach:

- Acqua
- Oceano
- Terra
- atmosphere/water-cycle discoveries;
- Vita.

Preferred life keystone:

`Oceano + Energia → Vita`

**Vita should not look like an ordinary routine unlock.**

The game has now crossed from constructing matter to constructing living things.

Suggested reveal hierarchy:

1. reaction behaves differently;
2. new element appears;
3. short pause;
4. hidden/previously unnamed set becomes visible;
5. catalog expands.

Desired feeling:

> Wait — now I can create living things too?

## Optional first-session mystery

The first session may expose one anomaly if the player independently finds a flagged pair.

It must not be required.

Candidate design direction:

`Luna + Vita → unstable reaction`

No future result or set is named.

Message:

> Qualcosa ha reagito, ma non riesci ancora a stabilizzarlo.

The anomaly is archived.

This quietly establishes that the current rules are not the whole game.

The exact canonical pair remains provisional.

## First hidden natural set

**Funghi** is currently the preferred first hidden-but-not-fantasy set.

Candidate trigger:

`Vita + Umidità → Muffa`

Result:

- Muffa discovered;
- the previously invisible Funghi set appears;
- the player learns that not every set is announced in advance.

This can occur during the first session for a very exploratory player, but it is not a pacing requirement.

## First-session UI rules

### Do

- keep the laboratory available at all times;
- make newly discovered elements immediately selectable;
- remember tested pairs;
- make set unlocks visually distinct from level-ups;
- allow the player to ignore newly unlocked menus and keep combining.

### Do not

- stop the player for long modal tutorials;
- force the player to open every new feature;
- show the entire future set list;
- show recipe checklists immediately;
- bombard the player with achievements;
- make the first session dependent on one obscure recipe.

## Tested-pair memory

From the beginning, the game remembers every attempted pair.

When the player selects the first element, previously tested partners can later show a discreet status.

This prevents accidental repetition without turning the inventory into a solution map.

Exact visual treatment belongs in UX design.

## Session exit

There is no artificial “session complete” screen.

If the player leaves, the game saves immediately.

On return, the laboratory should reopen in a useful neutral state and the collection should clearly show what was last discovered.

Potential return prompt:

> Ultima scoperta: Pianeta

No daily punishment or lost streak.
