# Implementation Seed Content v1

Status: **locked for first Codex implementation unless deliberately revised**

This is not the launch content total.

It is the canonical first implementation dataset used to prove the engine, UX and validation pipeline.

## Scope

67 elements.

Sets:

- Origini — 10
- Cosmo — 9
- Mondo — 22
- Vita — 9
- Piante — 12
- Funghi — 5

Four starters:

- void — Vuoto
- energy — Energia
- matter — Materia
- time — Tempo

## Set visibility

| Set ID | Display | Visibility | Reveal |
| --- | --- | --- | --- |
| origins | Origini | announced/current | available at start |
| cosmos | Cosmo | announced locked | discover `star` |
| world | Mondo | announced after Cosmo | first `lava` or `water` |
| life | Vita | discovery | discover `life` |
| plants | Piante | discovery/announced after Life | discover `seed` or `moss` |
| fungi | Funghi | hidden | discover `mold` |

## Elements

### Origini

| ID | Name | Rarity | Starter |
| --- | --- | --- | --- |
| void | Vuoto | common | yes |
| energy | Energia | common | yes |
| matter | Materia | common | yes |
| time | Tempo | uncommon | yes |
| light | Luce | common | no |
| heat | Calore | common | no |
| space | Spazio | common | no |
| gravity | Gravità | uncommon | no |
| plasma | Plasma | uncommon | no |
| gas | Gas | common | no |

### Cosmo

| ID | Name | Rarity |
| --- | --- | --- |
| cosmic_dust | Polvere cosmica | common |
| nebula | Nebulosa | uncommon |
| star | Stella | uncommon |
| asteroid | Asteroide | common |
| comet | Cometa | uncommon |
| planet | Pianeta | uncommon |
| moon | Luna | uncommon |
| star_system | Sistema stellare | rare |
| galaxy | Galassia | rare |

### Mondo

| ID | Name | Rarity |
| --- | --- | --- |
| lava | Lava | common |
| rock | Roccia | common |
| soil | Terra | common |
| sand | Sabbia | common |
| mountain | Montagna | common |
| volcano | Vulcano | uncommon |
| water | Acqua | common |
| ocean | Oceano | uncommon |
| atmosphere | Atmosfera | uncommon |
| wind | Vento | common |
| steam | Vapore | common |
| cloud | Nuvola | common |
| rain | Pioggia | common |
| humidity | Umidità | common |
| mud | Fango | common |
| swamp | Palude | uncommon |
| river | Fiume | common |
| lake | Lago | common |
| desert | Deserto | uncommon |
| island | Isola | uncommon |
| night | Notte | uncommon |
| shadow | Ombra | uncommon |

### Vita

| ID | Name | Rarity |
| --- | --- | --- |
| life | Vita | rare |
| cell | Cellula | common |
| bacterium | Batterio | common |
| algae | Alga | common |
| movement | Movimento | uncommon |
| creature | Creatura | uncommon |
| evolution | Evoluzione | rare |
| egg | Uovo | common |
| plankton | Plancton | uncommon |

### Piante

| ID | Name | Rarity |
| --- | --- | --- |
| moss | Muschio | common |
| seed | Seme | common |
| sprout | Germoglio | common |
| grass | Erba | common |
| flower | Fiore | common |
| tree | Albero | uncommon |
| forest | Foresta | rare |
| cactus | Cactus | uncommon |
| reed | Canna | common |
| water_lily | Ninfea | uncommon |
| fruit | Frutto | uncommon |
| fern | Felce | uncommon |

### Funghi

All are hidden until first Set reveal.

| ID | Name | Rarity |
| --- | --- | --- |
| mold | Muffa | uncommon |
| fungus | Fungo | uncommon |
| mycelium | Micelio | rare |
| spore | Spora | uncommon |
| lichen | Lichene | rare |

## Canonical recipes

Input order is irrelevant.

### Origini

- `void + energy → light`
- `energy + energy → heat`
- `energy + matter → plasma`
- `void + time → space`
- `matter + space → gravity`
- `matter + heat → gas`
- `matter + time → cosmic_dust`

### Cosmo

- `cosmic_dust + light → nebula`
- `plasma + gravity → star`
- `cosmic_dust + gravity → asteroid`
- `cosmic_dust + space → comet`
- `star + cosmic_dust → planet`
- `planet + cosmic_dust → moon`
- `star + planet → star_system`
- `star + star → galaxy`

### Mondo

- `planet + heat → lava`
- `lava + time → rock`
- `planet + comet → water` — primary
- `comet + heat → water` — alternate
- `water + planet → ocean`
- `rock + time → soil`
- `rock + water → sand`
- `rock + planet → mountain`
- `mountain + lava → volcano`
- `gas + gravity → atmosphere`
- `atmosphere + energy → wind`
- `water + heat → steam`
- `steam + atmosphere → cloud`
- `cloud + cloud → rain`
- `rain + heat → humidity`
- `soil + water → mud`
- `mud + water → swamp`
- `mountain + water → river`
- `river + soil → lake`
- `sand + heat → desert`
- `soil + ocean → island`
- `planet + void → night`
- `light + void → shadow`

### Vita

- `ocean + energy → life`
- `life + water → cell`
- `cell + soil → bacterium`
- `life + light → algae`
- `life + energy → movement`
- `life + movement → creature`
- `creature + time → evolution`
- `creature + life → egg`
- `life + ocean → plankton`

### Piante

- `algae + soil → moss`
- `life + soil → seed`
- `seed + water → sprout`
- `sprout + soil → grass`
- `sprout + light → flower`
- `sprout + time → tree`
- `tree + tree → forest`
- `seed + sand → cactus`
- `sprout + swamp → reed`
- `flower + water → water_lily`
- `tree + flower → fruit`
- `moss + time → fern`

### Funghi

- `life + humidity → mold`
- `mold + time → fungus`
- `fungus + soil → mycelium`
- `fungus + atmosphere → spore`
- `algae + fungus → lichen`

## First anomaly

`moon + life`

Anomaly ID:

`lunar_life_instability`

Category:

`mythic`

Player message:

> Qualcosa ha reagito, ma non riesci ancora a stabilizzarlo.

It has no result element in seed v1.

This deliberately validates support for anomalies whose future payoff ships in a later content package.

## Starter collections

### water_cycle — Ciclo dell'acqua

Members:

- water
- steam
- cloud
- rain
- ocean

Reveal:
discover steam or cloud.

### children_of_stars — Figli delle stelle

Members:

- star
- planet
- moon
- comet
- asteroid
- galaxy

Reveal:
discover star.

### rocky_world — Mondo roccioso

Members:

- rock
- soil
- sand
- mountain
- volcano
- island

Reveal:
discover rock.

### green_everywhere — Verde ovunque

Members:

- moss
- grass
- flower
- tree
- forest
- fern
- cactus

Reveal:
discover seed or moss.

## Required feature coverage

This dataset intentionally contains:

- starter elements;
- A+A recipe: `energy + energy`, `star + star`, `cloud + cloud`, `tree + tree`;
- alternate recipe: Water;
- announced Set reveal: Cosmo;
- discovery Set reveal: Vita/Piante;
- hidden Set reveal: Funghi;
- one unresolved anomaly;
- long-lived early ingredients;
- several cross-Set recipes.

## Reachability audit

Design-time fixed-point simulation result:

- starters: 4
- total elements: 67
- reachable elements: 67
- unreachable required elements: 0
- maximum recipe dependency depth: 11

This is a design audit only.

The implementation validator must reproduce the result from canonical data.

## Content lock rule

Codex may correct:

- spelling;
- schema formatting;
- invalid references found by validators.

Codex must not silently change:

- recipe meanings;
- Set ownership;
- rarity;
- unlock behavior;
- anomaly meaning.

Any gameplay-content change returns to design review.
