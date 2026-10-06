# XP & Level Curve

Status: **provisional numeric design v1**

Numbers are intentionally concrete so the progression can be simulated later. They are not final balance values.

## Purpose of levels

Player level represents breadth of discovery.

Levels should:

- pace announced content;
- unlock assistance and presentation features at sensible collection sizes;
- provide satisfying progress feedback;
- never replace actual discovery conditions.

A level alone should rarely create an element or complete a set.

## XP rewards

### New element

Base reward: **100 XP**

Rarity modifier:

| Rarity | Bonus | Total base discovery XP |
| --- | ---: | ---: |
| Comune | +0 | 100 |
| Insolito | +20 | 120 |
| Raro | +50 | 150 |
| Straordinario | +100 | 200 |
| Segreto | +200 | 300 |

### Alternate recipe

Discovering a new valid recipe for an already known result:

**20 XP**

First-time element discovery takes precedence; do not award both 100+ and alternate-recipe XP for the same first recipe.

### Register anomaly

First registration of an authored anomaly:

**30 XP**

Repeatedly triggering the same anomaly:

**0 XP**

### Resolve anomaly

Resolution bonus:

**80 XP**, in addition to any XP earned for the resulting new element.

### Reveal announced set

**50 XP**

### Reveal hidden set

**125 XP**

### Reveal deep secret set

**250 XP**

### Complete normal set

Provisional formula:

`100 + (5 × number of required elements in set)`

Cap: **300 XP**

Secret/easter-egg elements are excluded from normal completion requirements until discovered.

### Repeat known recipe

**0 XP**

This is non-negotiable unless later playtesting finds a strong reason otherwise.

## Early cumulative level thresholds

| Level | Total XP required |
| ---: | ---: |
| 1 | 0 |
| 2 | 250 |
| 3 | 600 |
| 4 | 1,000 |
| 5 | 1,450 |
| 6 | 1,950 |
| 7 | 2,500 |
| 8 | 3,100 |
| 9 | 3,750 |
| 10 | 4,450 |
| 11 | 5,200 |
| 12 | 6,000 |
| 13 | 6,850 |
| 14 | 7,750 |
| 15 | 8,700 |

Beyond level 15 the curve will be designed after content density through Humanity is mapped.

## Expected early cadence

With mostly common discoveries, the intended rhythm is approximately:

- Level 2 after 2–3 new discoveries;
- Level 3 after roughly 5–6 total discoveries;
- Levels 4–6 during the transition into Cosmo;
- Levels 7–10 while constructing the first world and approaching Life.

Set and rarity bonuses will shift this naturally.

The first 43-element content slice is larger than a single session and is expected to span multiple early levels.

## Feature unlock philosophy

Core usability should not be arbitrarily level-gated.

Prefer state-based unlocks:

- Collection: after 3 discoveries;
- Set browser: after first set expansion;
- Anomaly archive: after first anomaly;
- Discovery graph: after graph has enough nodes to be useful.

Level-based unlocks are better for:

- advanced hint tools;
- optional filtering;
- experiment modifiers;
- eligibility for announced future domains.

## Level-up presentation

Normal level-up:

- compact;
- celebratory but non-blocking;
- clearly secondary to a new discovery reveal.

A level-up must never visually overpower:

- hidden set reveal;
- first Life discovery;
- first supernatural discovery;
- major anomaly resolution.

If level-up and major discovery occur together, combine them into one coherent celebration rather than two stacked modals.

## No farming

XP is tied to first-time knowledge states.

The player cannot efficiently level by:

- repeating recipes;
- repeatedly causing the same failure;
- repeatedly triggering the same anomaly;
- recreating already known elements.

This keeps progression aligned with the game's actual goal: discovering new relationships.
