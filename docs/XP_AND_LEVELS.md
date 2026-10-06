# XP & Level Curve

Status: **implementation-ready early curve / balance-tunable v2**

## Purpose

Discovery Level represents breadth of knowledge.

Levels pace eligibility and feedback; they do not replace discovery gates.

## XP rewards

### New element

Base:
**100 XP**

Rarity bonus:

| Rarity | Bonus | Total |
| --- | ---: | ---: |
| Comune | 0 | 100 |
| Insolito | 20 | 120 |
| Raro | 50 | 150 |
| Straordinario | 100 | 200 |
| Segreto | 200 | 300 |

### Alternate recipe

**20 XP**

If the same recipe also discovers the element for the first time, award normal discovery XP rather than double-counting alternate XP.

### First anomaly registration

**30 XP**

Repeated anomaly:
0 XP.

### Anomaly resolution

**80 XP** bonus plus normal new-result discovery XP if applicable.

### Announced Set reveal

**50 XP**

### Hidden Set reveal

**125 XP**

### Deep secret Set reveal

**250 XP**

### Normal Set completion

`100 + 5 × required element count`

Cap:
300 XP.

### Repeat known recipe

**0 XP**

Stable design rule.

## Early cumulative thresholds

| Level | Total XP |
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

These thresholds are canonical starting balance data for implementation, not immutable game design.

Beyond level 15:
content data may initially extrapolate a smooth increasing curve until Humanity content is fully authored.

Do not hard-code thresholds in components.

## Expected seed cadence

The 67-element implementation seed is larger than one session.

Expected broad rhythm:

- Lv. 2 after roughly 2–3 discoveries;
- Lv. 3 after roughly 5–6;
- early Cosmo across Lv. 4–6;
- first Mondo/Life progress over following levels.

Actual cadence is validated by simulator/playtest and can be tuned through progression data.

## Feature unlocks

Prefer state-based unlocks:

- Collection after early discoveries;
- Sets after first Set reveal;
- Anomalies after first anomaly;
- Map after graph density threshold.

Levels are appropriate for:

- advanced hint availability;
- Era eligibility;
- future non-core features.

**No third input/modifier slot is part of the core launch progression.**

## Presentation

Normal level-up:
compact and non-blocking.

Major discovery/reveal always takes visual priority.

If events coincide, compose one coherent celebration.

## No farming

No meaningful XP from:

- repeat recipe;
- repeat failure;
- repeat anomaly;
- recreating a known result through an already known recipe.
