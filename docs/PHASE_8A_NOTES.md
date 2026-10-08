# Phase 8A — proposed pack preflight, implementation paused
Status: **draft authoring dossier only; not loaded by the game; human direction pending**.

This branch starts at Phase 7.5C / PR #11. Original seed remains the only runtime content (0.1.0, 67 elements, 64 recipes). No Domain, React, resolver, save schema, XP curve, unlock, hint, visibility, persistence or PWA implementation is changed.

Read all required documents: AGENTS, CODEX_LONG_RUN, CONTENT_ROADMAP, LIFE_PLANTS_FUNGI_ANIMALS, IMPLEMENTATION_SEED_CONTENT, SETS_AND_PROGRESSION, DATA_MODEL, DECISIONS, RESOLUTION_ENGINE, VALIDATION_AND_TESTING and SAVE_AND_VERSIONING. The newer Humanity preference for Mammifero instead of the older Topo entry was considered in the proposal.

## Concrete review material
- `proposals/phase-8a/pack.json`: 51 candidate element/recipe additions, proposed contentVersion 0.2.0, one Animals Set, family tags, localized descriptions/art placeholders and a new unresolved Wolf+Moon observation. No new Collections or level thresholds.
- `proposals/phase-8a/review.json`: every candidate ID/PairKey, classification, rarity/visibility, completion and within-pack downstream use; **all approval fields PENDING**. No new recipe is claimed canon. Classification is about source provenance, not approval.
- `evidence/phase-8a/proposal-preflight.json`: real strict schema/reference/ambiguity and fixed-point resolver dry run. **118/118 reachable**, four starters, maximum depth **12**, no blocked unlocks. 51/51 unordered pairs produce their selected result; unauthored Mammifero+Mammifero is no reaction.
- Proposed sizes: Mondo 31, Piante 19, Funghi 9, Animali 31; the other seed Sets unchanged. Additions to existing Sets are bonus members, preserving all six previous required denominators and completed badges. Animal members are required within the new Set.
- Animal announcement after owned Creatura, reveal after Pesce; the other Animal recipes are dormant until that reveal. Fish route uses existing Creature+Ocean. Unknown Animal names/counts/details/graph nodes and unobserved Wolf+Moon Archive entry remain absent in dry-run projections.
- Old fully progressed save dry-run retains discoveries, XP and completed Sets; an old failed Creature+Ocean test becomes stale/newly possible without awarding Fish. Seed Luna+Vita stays unresolved and its definition remains unchanged.

## Why runtime implementation stopped
`CODEX_LONG_RUN.md`, Stop conditions, requires: “Stop the current stage and report, rather than guessing” when “a candidate recipe collides with an existing pair”.

Authoring preflight found:
1. Proposed Roccia+Tempo → Cristallo conflicts with locked Roccia+Tempo → Terra. The seed takes precedence; no condition/priority override or replacement pair was invented.
2. Proposed Fiore+Insetto → Pianta carnivora conflicts within the same proposal with Insetto+Fiore → Ape. No directional ordering or priority trick was used.

Both conflicted targets are excluded from the reviewable dry-run pack and recorded in the rejection list. A human question asks whether to discard these two candidates and continue with 51 proposals, or leave this as a dossier. Until answered, runtime integration, contentVersion activation, Animal UI screenshots and the full new-content browser flow remain **NOT IMPLEMENTED / NOT RUN**. 118 is below the 120–160 target; rejected recipes have not been replaced with count-inflating filler.

## Commands
```sh
npx tsx scripts/audit-phase8a-proposal.ts
npm run audit:proposal:8a
npm run check
npm run validate:pwa
npm run profile:catalog
npm run profile:map
npm run test:e2e
npm run test:production
```
The first command audits the proposed pack in memory. Other commands verify the actual 67-element game and its unchanged earlier functionality. Dry-run numbers must not be presented as the shipped/game content count. Manual visual approval and canon approval remain pending.

Final local regression results: `npm run check` PASS (199 unit/component tests in 15 files, typecheck/lint, seed validator/simulation and production build); E2E 20/20; production 13/13 in one complete run; PWA validator PASS (20 assets, 10 JS chunks); both 1000-element profiles PASS. The standalone proposal preflight additionally checks all 67 definitions and 64 recipes unchanged, all six earned completion denominators, unordered pairs, unauthored A+A, stale failure reactivation and fresh/announced/unknown-detail/Map/Archive safety. No Animal screenshot is claimed because the proposed pack has not been activated in runtime. `evidence/phase-8a/verification.json` distinguishes the actual-game and proposed-pack evidence.

## Candidate matrix
IDs denote unordered inputs; the JSON manifest includes rarity, visibility, completion, localized copy and downstream links.

| Element | Inputs | Set | Provenance (not approval) |
| --- | --- | --- | --- |
| fish / Pesce | creature + ocean | animals | preferred-proposal |
| mammal / Mammifero | creature + soil | animals | preferred-proposal |
| bird / Uccello | creature + wind | animals | preferred-proposal |
| reptile / Rettile | creature + rock | animals | new-proposal |
| insect / Insetto | creature + grass | animals | new-proposal |
| frog / Rana | creature + swamp | animals | preferred-proposal |
| snail / Lumaca | creature + humidity | animals | preferred-proposal |
| butterfly / Farfalla | creature + flower | animals | preferred-proposal |
| spider / Ragno | creature + shadow | animals | preferred-proposal |
| shark / Squalo | fish + shadow | animals | preferred-proposal |
| crab / Granchio | creature + mud | animals | preferred-proposal |
| owl / Gufo | bird + night | animals | preferred-proposal |
| seagull / Gabbiano | bird + ocean | animals | preferred-proposal |
| duck / Anatra | bird + water | animals | preferred-proposal |
| crow / Corvo | bird + shadow | animals | preferred-proposal |
| mouse / Topo | mammal + seed | animals | new-proposal |
| rabbit / Coniglio | mammal + grass | animals | new-proposal |
| squirrel / Scoiattolo | mammal + tree | animals | new-proposal |
| deer / Cervo | mammal + forest | animals | new-proposal |
| fox / Volpe | mammal + shadow | animals | new-proposal |
| wolf / Lupo | mammal + night | animals | new-proposal |
| bear / Orso | mammal + mountain | animals | new-proposal |
| goat / Capra | creature + mountain | animals | preferred-proposal |
| bat / Pipistrello | mammal + wind | animals | new-proposal |
| horse / Cavallo | mammal + movement | animals | new-proposal |
| turtle / Tartaruga | reptile + water | animals | new-proposal |
| lizard / Lucertola | reptile + soil | animals | new-proposal |
| snake / Serpente | reptile + grass | animals | new-proposal |
| bee / Ape | insect + flower | animals | new-proposal |
| ant / Formica | insect + soil | animals | new-proposal |
| firefly / Lucciola | insect + light | animals | new-proposal |
| metal / Metallo | heat + rock | world | new-proposal |
| salt / Sale | ocean + heat | world | new-proposal |
| beach / Spiaggia | sand + ocean | world | new-proposal |
| cave / Grotta | rock + void | world | new-proposal |
| valley / Valle | mountain + soil | world | new-proposal |
| waterfall / Cascata | mountain + river | world | new-proposal |
| fog / Nebbia | humidity + night | world | new-proposal |
| rainbow / Arcobaleno | rain + light | world | new-proposal |
| lightning / Fulmine | cloud + energy | world | new-proposal |
| shrub / Cespuglio | grass + tree | plants | new-proposal |
| climber / Rampicante | sprout + tree | plants | new-proposal |
| berry / Bacca | shrub + fruit | plants | new-proposal |
| root / Radice | tree + soil | plants | new-proposal |
| aquatic_plant / Pianta acquatica | grass + water | plants | new-proposal |
| thorn / Spina | cactus + rock | plants | new-proposal |
| pollen / Polline | flower + wind | plants | new-proposal |
| truffle / Tartufo | mycelium + tree | fungi | new-proposal |
| glowing_fungus / Fungo bioluminescente | fungus + shadow | fungi | new-proposal |
| mycorrhiza / Micorriza | mycelium + root | fungi | new-proposal |
| yeast / Lievito | fruit + spore | fungi | new-proposal |

## Subsequent-stage read-only analysis
No Phase 8B/C or Android code has been implemented. The analysis below is independent preparation while the collision decision is pending.
- 8B draft Energia+Atmosfera → Suono conflicts with the locked Vento outcome. Sabbia+Calore → Vetro conflicts with locked Deserto. The same document also proposes Sabbia+Fuoco; that alternative needs a valid Fire route and explicit review. No seed pair should be overridden after Humanity unlock.
- The Humanity document explicitly supersedes its older Legno+Strumento → Carta choice with Legno+Acqua → Carta and reserves Legno+Strumento → Ruota. That documented resolution can be considered rather than introducing a two-result pair.
- 8C preferred Mito+Energia bridge comes from newer DECISIONS/Humanity direction; older Leggenda+Energia and Umano+Tempo→Storia wording is historical. The current early XP curve has 15 thresholds; working Era bands (e.g. Arcano 37+) cannot simply be used as runtime minimum gates. A reachable authored eligibility proposal/extended curve requires review.
- Android toolchain read-only audit: bundled Android Studio JBR 21.0.8, SDK platforms android-35/android-36 and emulator AVD Medium_Phone_API_36.1 exist. No device is attached; emulator has not been launched. PATH/JAVA_HOME/ANDROID_HOME are not configured. This is **environment inspection only**, not Capacitor scaffold/build/emulator validation. Current [official environment setup](https://capacitorjs.com/docs/getting-started/environment-setup) and [Capacitor 8 migration guide](https://capacitorjs.com/docs/updating/8-0) were consulted. No keystore, credentials, installation or publication.
