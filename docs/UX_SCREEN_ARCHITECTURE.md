# UX & Screen Architecture

Status: **stable interaction architecture v2**

Merge Discovery is web-first, responsive and touch-friendly.

Desktop/mobile share one information architecture.

Exact breakpoint behavior is defined in `RESPONSIVE_AND_UI_STATES.md`.

## Navigation

Primary destinations:

- Laboratorio
- Collezione
- Set / Collezioni
- Anomalie — after first anomaly
- Mappa — after useful graph density
- Impostazioni / Profilo

Mobile:
max five bottom-nav destinations.

Once both Map and Anomalies exist, group them under **Esplora**.

Desktop:
persistent side rail may show them separately.

## Laboratory — desktop

Three zones:

### Left rail

- navigation;
- Discovery Level;
- discovery count;
- optional **player-pinned** Collection objective.

### Center

- Slot A
- Slot B
- Combine
- reaction/result
- hint control
- last discovery shortcut

### Right library

- search
- favorites
- filters
- known element cards
- tested-pair context relative to selected input

## Laboratory — mobile

Order:

- compact status
- slots
- Combine
- result
- favorites/search
- library
- bottom navigation

Tap-select is baseline.

Drag is enhancement only.

## Input

Tap element:
fills next free slot.

Tap filled slot:
clears it.

Tap same element when one slot already contains it:
fills second slot, enabling A+A naturally.

## Combine

Explicit Combine action is required after two inputs.

No auto-resolve on second selection.

## After result

Result does **not** automatically replace Slot A.

Offer:

- **Usa risultato** — result becomes Slot A, Slot B clears
- **Ripeti con A** — original Slot A remains, Slot B clears
- **Nuovo esperimento** — both clear

Known quick reactions may use a compact version of these controls.

## Failure/anomaly

No reaction:
neutral short feedback, pair remembered.

Anomaly:
distinct visual state, archive registration automatic.

## Library state priority

Relative to selected Slot A, show at most the most useful contextual marker.

Priority examples:

1. anomaly/revisitable
2. new possibilities
3. tested failure
4. known success
5. default

Do not light up undiscovered valid partners.

## Favorites

All favorited elements are available through filter.

Quick access:

- mobile: horizontal favorites strip, up to ~6 visible before scroll;
- desktop: first 8 recent/pinned favorites before overflow.

No hard cap on stored favorites.

## Search

Always available once catalog/library size justifies it.

No hidden content in autocomplete.

## Filters

Quick:

- Preferiti
- Nuovi
- Ha possibilità
- Set corrente

Advanced:
sheet/panel.

## Collection

Default answers:

- cosa ho appena scoperto?
- dove sto progredendo?
- cosa può essere interessante riesaminare?

Mobile detail:
dedicated route/page.

Desktop:
optional inspector pane.

## Set / Collection tabs

Keep Sets and Collections conceptually separate.

Do not merge them into one undifferentiated list.

## Element Detail

Structure defined in `SCREEN_SPECS.md`.

Reaction history belongs to **Element Detail → Esperimenti**, not a standalone global matrix.

## Anomalies

Archive unavailable before first anomaly.

States:

- instabile
- inerte
- riesaminabile
- risolta

Hidden result never appears before resolution.

## Map

Unlock around 15–20 discoveries or equivalent graph density.

Desktop:
pan/zoom local graph.

Mobile:
one-hop/local neighborhood by default.

Accessible relationship list always available.

## Progressive disclosure

Start:
Lab + settings access.

After early discoveries:
Collection.

After first Set reveal:
Sets.

After first anomaly:
Anomalies.

After graph density:
Map.

## Celebration hierarchy

1. known result
2. alternate recipe
3. new element
4. Collection complete
5. normal Set reveal
6. hidden Set reveal
7. Era-defining discovery
8. supernatural/anomaly culmination

## Persistent header

Prioritize:

- Discovery Level
- discovery count
- relevant contextual alert

No coin/gem/stamina bar.

## Pinned objectives

No Collection goal appears in Lab automatically.

Player can pin one optional objective from Collection/Set screens.

## Set reveal environment

During reveal only, the Lab may temporarily react to the new Set accent.

Afterward it returns to the normal shell.

Do not permanently recolor the entire Lab per Set.

## Core launch experiment mode

Exactly two reusable inputs.

No third ingredient slot, environment slot or directional recipe in core launch.

Future experiment modes must extend the domain signature deliberately and are not part of initial architecture scope beyond extensibility.

## Accessibility

See `ACCESSIBILITY.md`.

Core rules:

- no drag requirement
- full keyboard path
- no color-only state
- reduced motion
- large text resilience
- touch targets

## Resolved former open questions

- result persistence: explicit post-result actions, no automatic replacement;
- reaction history: Element Detail;
- hint control: near reaction stage / contextual detail, secondary hierarchy;
- Lab Collection objective: player-pinned only;
- Set reveal: temporary reveal accent only;
- breakpoints: defined in responsive specification.
