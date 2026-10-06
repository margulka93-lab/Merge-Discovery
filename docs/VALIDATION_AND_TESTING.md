# Validation, Simulation & Test Strategy

Status: **implementation-ready design specification v1**

Validation is a product feature of the authoring pipeline, not optional cleanup.

A data-driven discovery game can silently become unwinnable if content is not audited automatically.

## Validation layers

### 1. Schema validation

Every content file validates required fields, enums and types.

Fail build on:

- unknown field shape where strict schemas apply;
- missing ID;
- invalid enum;
- malformed localization key.

### 2. Referential integrity

Fail on:

- recipe references unknown element;
- element references unknown Set;
- Collection references unknown member;
- anomaly references unknown inputs;
- unlock references unknown target;
- missing required localization key.

### 3. Identity validation

Fail on:

- duplicate IDs;
- duplicate recipe IDs;
- duplicate unordered pair recipes that can overlap;
- duplicate Set sort positions where uniqueness matters.

### 4. Recipe ambiguity

For every input pair and reachable state class, prove that at most one result can win.

Fail on:

- two explicit recipes both valid without unique priority;
- equal-priority tag rules both winning;
- recipe and anomaly both claiming the same active state without intended precedence.

### 5. Reachability simulation

Start from starter elements.

Repeatedly apply:

- currently valid recipes;
- unlock rules;
- feature rules;

until fixed point.

Report:

- required elements never reachable;
- Set reveal never reachable;
- gate cycle;
- feature required before its own unlock.

Simulation should support multiple progression checkpoints, not only “everything unlocked”.

## Locked implementation seed audit

The first implementation content seed must prove:

- 100% required reachability from starters;
- no required secret dependency;
- no circular Set reveal;
- at least one same-element recipe;
- at least one alternate recipe;
- one hidden Set reveal;
- one anomaly path.

## 6. Progression simulation

Headless simulator estimates:

- discoveries available at each state;
- XP gained along representative paths;
- earliest/latest reasonable level for keystones;
- risk of reaching level gate without meaningful recipes;
- risk of content exhaustion before next Era eligibility.

This is not an AI player.

It uses deterministic/path-search scenarios.

## 7. Spoiler validation

Automated assertions:

- hidden Set IDs/names absent from player-facing locked-set lists;
- secret elements excluded from normal denominator;
- secret recipes excluded from missing-recipe counts;
- search index built only from visible knowledge;
- graph projection never inserts hidden nodes.

## 8. Completion validation

For each Set:

- required member count > 0;
- every required element is reachable;
- bonus/secret members do not reduce earned completion;
- content update cannot accidentally revoke completed badge without explicit migration policy.

## 9. Save compatibility tests

Every released save schema fixture must load under current code.

Fixtures should include:

- fresh save;
- early-game save;
- anomaly observed;
- completed Set;
- pre-content-update failed pair.

## 10. Resolver unit tests

Minimum cases:

- A+B equals B+A;
- A+A;
- explicit recipe;
- explicit override beats tag rule;
- alternate recipe;
- known repeated recipe = 0 XP;
- anomaly;
- dormant pair behaves no-reaction;
- unlock trigger;
- invalid ambiguous content rejected.

## 11. UI component tests

Test behavior rather than screenshot-only details.

Examples:

- keyboard fills and clears slots;
- hidden content not rendered;
- same element can fill both slots;
- reduced motion state suppresses major movement;
- Collection unlock does not steal Lab focus.

## 12. End-to-end tests

Playwright target flows:

1. new game → first discovery;
2. discover same-element recipe;
3. unlock Collection;
4. reveal Cosmo;
5. create alternate Water recipe;
6. reveal Life;
7. reveal hidden Funghi;
8. register anomaly;
9. reload and preserve progress;
10. export/import save.

Later Arcano flow gets its own E2E scenario.

## 13. Responsive tests

Viewport matrix at minimum:

- 320×568
- 360×800
- 390×844
- 768×1024
- 1024×768
- 1280×800
- 1440×900
- 1920×1080

Also test:

- 200% browser text zoom where feasible;
- landscape mobile;
- touch emulation.

## 14. Accessibility tests

Automated checks cannot replace manual testing but must catch:

- unlabeled controls;
- focus traps;
- contrast regressions where detectable;
- duplicate IDs;
- invalid landmarks.

Manual keyboard and screen-reader smoke tests remain required.

## 15. Performance budgets

Target assumptions for initial architecture:

- 1,000 element definitions should load without redesign;
- catalog list/grid must virtualize when necessary;
- discovery graph renders local neighborhood, never entire 1,000-node graph by default;
- combination resolution should be indexed, not scan every recipe on every click.

Concrete bundle budgets can be set after scaffold profiling.

## 16. CI gate

Every implementation PR should run:

1. typecheck;
2. lint;
3. unit tests;
4. content schema validation;
5. semantic content validation;
6. reachability simulation;
7. relevant component tests;
8. build.

E2E may run on PR or protected main depending CI cost, but must run before release.

## 17. Design simulation result — seed graph

The current proposed implementation seed contains **67 elements** across:

- Origini: 10
- Cosmo: 9
- Mondo: 22
- Vita: 9
- Piante: 12
- Funghi: 5

A manual headless graph simulation performed during design found:

- 67/67 elements reachable from the four starters;
- maximum dependency depth: 11 recipe layers;
- no unreachable required node in the proposed seed recipe graph.

The canonical implementation seed is documented separately and should be revalidated by code rather than trusting this manual design check.
