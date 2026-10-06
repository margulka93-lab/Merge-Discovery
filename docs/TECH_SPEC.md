# Technical Specification

Status: **implementation-ready architecture v1**

## Product target

Primary:
responsive web app / PWA.

Later:
Android packaging using the same web codebase and domain model.

No backend required for v1.

## Recommended stack

### Core

- TypeScript
- React
- Vite

### Routing

- React Router

### Runtime state

- Zustand for application/UI orchestration and derived selectors

Domain truth remains plain serializable objects and pure functions.

### Validation

- Zod for content/save runtime schemas

If implementation chooses an equivalent schema library, it must satisfy the same strict validation/test requirements and should not be changed casually after content ships.

### Persistence

- IndexedDB
- Dexie as the preferred adapter

Storage stays behind a repository abstraction.

### Localization

- i18next or equivalent key-based runtime localization

Italian is the first authored locale.

### Testing

- Vitest
- React Testing Library
- Playwright

### Graph

Preferred candidate:
`@xyflow/react` for interactive desktop/local graph exploration.

Adopt only if:

- local-neighborhood rendering remains performant;
- accessible alternative relationship list is implemented;
- dependency does not leak graph concerns into domain data.

A simpler custom renderer is acceptable if it better satisfies requirements.

### PWA

Use Vite-compatible service-worker/PWA integration.

Cache strategy must support offline gameplay and safe update prompts.

### Android

Capacitor is the intended later wrapper after web/PWA feature parity.

Do not introduce Android-specific logic into domain modules.

## Styling

Use:

- CSS custom properties for design tokens;
- CSS Modules or clearly scoped component styles;
- responsive layout with grid/flex/container queries where appropriate.

Do not introduce a heavy generic component kit that fights the custom Lab/field-guide visual identity.

## Architecture layers

### 1. Domain

Pure TypeScript.

Contains:

- element/set/recipe types;
- resolver;
- unlock evaluation;
- progression calculations;
- completion;
- visibility projection;
- reachability helpers.

Rules:

- no React;
- no DOM;
- no IndexedDB;
- no network;
- no animation;
- no platform APIs.

### 2. Content

Contains:

- canonical source JSON;
- runtime schemas;
- compiled indexes;
- localization data;
- content migration aliases.

Content validation runs before app build succeeds.

### 3. Application

Coordinates use cases:

- start/load game;
- combine;
- favorite;
- request hint;
- import/export;
- recompute after content update.

This layer turns domain events into persisted state changes.

### 4. Persistence

Adapters for:

- IndexedDB;
- memory test repository;
- future Capacitor/native/cloud adapters.

### 5. UI

React components/routes.

Consumes application selectors/actions.

Must not implement recipe/unlock logic.

### 6. Platform

PWA/browser integration:

- service worker/update;
- install prompts if later desired;
- audio lifecycle;
- safe-area handling.

Future Android adapter lives here.

## Proposed source tree

```text
src/
  app/
    App.tsx
    router.tsx
    store/
  domain/
    model/
    resolver/
    progression/
    visibility/
    completion/
    hints/
  content/
    data/
    schemas/
    indexes/
    localization/
  application/
    combine/
    save/
    import-export/
    updates/
  persistence/
    SaveRepository.ts
    indexeddb/
    memory/
  ui/
    shell/
    lab/
    catalog/
    sets/
    collections/
    anomalies/
    graph/
    settings/
    components/
  platform/
    pwa/
    audio/
  styles/
    tokens.css
    global.css
scripts/
  validate-content/
  simulate-content/
tests/
  fixtures/
  e2e/
public/
  assets/
    elements/
    sets/
    audio/
```

Exact filenames may vary; layer boundaries may not.

## Dependency direction

Allowed:

`UI → Application → Domain`

`Application → Persistence interface`

`Content → schemas/domain types`

Not allowed:

`Domain → React`

`Domain → IndexedDB`

`Content data → UI components`

`Persistence → UI`

## Content indexes

Build/startup should pre-index:

- PairKey → explicit recipes
- PairKey → anomaly
- tag rule structures
- elementId → element
- setId → members
- elementId → discovered relationship metadata as needed

Do not scan hundreds/thousands of recipes on every combine.

## App state split

### Durable player state

Lives in SaveRepository-backed snapshot.

### Derived gameplay state

Selectors/functions:

- level;
- visible Sets;
- completion;
- exhaustion;
- new possibilities.

### Ephemeral UI state

Examples:

- Slot A/B;
- search query;
- open sheet;
- active filter;
- current graph focus.

Ephemeral state is not written to save unless a specific UX reason exists.

## Routing

Suggested routes:

- `/` → Lab
- `/collection`
- `/sets`
- `/sets/:setId`
- `/elements/:elementId`
- `/explore/anomalies`
- `/explore/map`
- `/settings`

Route guards project player visibility.

Undiscovered deep link never exposes hidden data.

## Boot sequence

1. load/validate bundled content;
2. open persistence adapter;
3. load save or create new;
4. migrate save schema;
5. reconcile content version;
6. compute derived state;
7. render app;
8. asynchronously prepare noncritical art/audio.

If canonical bundled content fails validation in production, show a recoverable fatal-content screen rather than booting corrupted gameplay.

## Save transaction

Combine flow:

1. UI requests combination;
2. application calls pure resolver;
3. application creates next save snapshot from events;
4. snapshot validation;
5. persist transaction;
6. publish state/events;
7. UI presents result.

Animation never determines whether state is saved.

## PWA

Requirements:

- app shell usable offline after first successful load;
- canonical content bundled/cached;
- safe version update;
- no forced reload during active transaction/reveal;
- installability can be enabled without changing gameplay.

## Android

Only after web vertical slice stabilizes.

Capacitor wrapper should provide:

- WebView shell;
- safe areas;
- native back handling if needed;
- share/export adapter if useful.

Do not fork gameplay implementation.

## Security

MVP has no untrusted multiplayer content.

Still:

- validate imported JSON strictly;
- never eval imported data;
- escape/localize strings normally through React;
- avoid injecting arbitrary HTML from content;
- service worker cache only intended origins/assets.

## Performance

Design target:

- content definitions: 1,000+;
- Lab combine: effectively instant;
- large catalog: virtualization-ready;
- graph: local subgraph projection;
- lazy-load hero art where appropriate.

No WebGL requirement.

## Browser target

Modern evergreen desktop/mobile browsers and current Android WebView through later Capacitor target.

Exact support matrix should be documented at public release, not hard-coded into domain assumptions.

## No backend assumption

The architecture must not depend on:

- auth;
- API availability;
- remote recipe service;
- analytics;
- cloud save.

Those can be added around the local-first core later.

## Definition of architectural success

A future content designer can add a valid new element/recipe/Set through data and localization without editing React gameplay logic.
