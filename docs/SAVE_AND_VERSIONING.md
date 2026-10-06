# Save, Persistence & Content Versioning

Status: **implementation-ready design specification v1**

## v1 philosophy

Merge Discovery is **local-first**.

The first playable product does not require:

- account creation;
- backend;
- cloud login;
- always-online access.

The game must remain fully playable offline after the web app has loaded/cached required assets.

## Persistence target

Web/PWA:

- IndexedDB is the primary durable store.

Small UI preferences may be mirrored in localStorage for startup convenience, but canonical game progress lives in IndexedDB.

Android later:

- same logical save model;
- Capacitor/native storage adapter may wrap the same persistence interface;
- game domain must not depend on browser-specific storage directly.

## Persistence abstraction

Domain code talks to:

`SaveRepository`

not IndexedDB.

Required methods conceptually:

- load()
- createNew()
- persist(snapshot)
- export()
- import()
- clear()

Storage adapters implement the interface.

## Autosave

Persist after every durable gameplay transaction that changes:

- XP;
- discovery;
- recipe history;
- tested pair;
- anomaly state;
- revealed/completed Set;
- favorite/settings.

Writes may be coalesced within a very short debounce window, but the UI must consider an experiment committed only after state mutation succeeds.

Critical visibility changes should flush promptly.

## Atomicity

A combination is one logical transaction.

It must not save:

- recipe discovered but element missing;
- XP awarded without discovery;
- anomaly resolved without resolution result.

Build next PlayerSave snapshot in memory, validate, then persist atomically.

## Save schema version

`saveSchemaVersion` is an integer controlled by code.

Every code release knows how to migrate all supported prior schema versions in sequence.

Example:

`1 → 2 → 3`

Never write ad hoc migration logic inside UI components.

## Content version

`contentVersionSeen` is independent from save schema.

Examples:

- save schema did not change;
- content 0.2 adds 30 recipes.

On load:

1. migrate save schema first;
2. load current content package;
3. reconcile content version;
4. recalculate derived state;
5. surface new possibilities.

## Content reconciliation

### Added element

No save migration required.

### Added recipe

Previously tested no-reaction pairs may become relevant.

Re-evaluate tested pair metadata and mark affected known elements with new possibilities.

### Added hidden recipe

Must not expose anything before its reveal requirements.

### Renamed display name

Localization-only change. No migration.

### Renamed internal ID

Avoid.

If unavoidable, add a durable alias/migration mapping.

### Removed element/recipe

Prefer deprecation rather than deletion after public release.

If removal is necessary:

- preserve historical discovery in migration metadata where possible;
- do not make the entire save unloadable.

## Content migrations

`migrations.json` may define:

- element ID alias;
- recipe ID alias;
- retired content;
- replacement Set mapping.

Each migration must be testable.

## Export / import

Before public launch, support user-visible save export/import.

Export format:

- UTF-8 JSON;
- includes product identifier;
- save schema version;
- content version seen;
- checksum/hash field optional for accidental corruption detection, not DRM.

Import process:

1. parse;
2. validate shape;
3. migrate;
4. validate references;
5. preview basic stats;
6. explicit confirmation;
7. write;
8. reload derived state.

Never silently overwrite current save without confirmation.

## Backup

MVP may keep:

- current save;
- previous successful snapshot.

If current snapshot fails validation, offer recovery from previous local snapshot.

Do not keep an unbounded history.

## Corruption handling

If some noncritical references are unknown:

- preserve recognized progress;
- quarantine/ignore invalid optional IDs;
- show a human-readable recovery message.

If the entire structure is invalid:

- do not auto-reset;
- offer export of raw save for recovery/debug;
- offer previous backup;
- only then offer new game.

## Reset

`Nuova partita / Azzera progresso` requires explicit confirmation and should explain that local discoveries will be deleted.

## Multi-profile

Not required for v1.

Save schema should not assume multiple characters/profiles.

A future account/cloud layer can wrap one or more saves later.

## Cloud sync

Deferred.

The local domain model must not contain server-specific identifiers.

If cloud sync is added later, conflict strategy should operate on versioned snapshots/events rather than forcing backend concerns into gameplay now.

## Offline behavior

The game can:

- combine;
- discover;
- browse catalog;
- view map;
- save;

without network.

Only future optional features such as account sync or downloadable expansion content may require connectivity.

## Time

Gameplay progression must not depend on client clock for rewards.

Timestamps are history metadata only.

Changing device time must not grant progression advantages.

## Privacy

MVP save contains gameplay state/preferences only.

Do not store sensitive personal information.

## Acceptance criteria

Persistence implementation is not complete until tests cover:

- save/load round trip;
- crash-safe atomic transaction behavior;
- schema migration;
- content-version reconciliation;
- stale no-reaction becoming new possibility;
- unknown optional ID recovery;
- export/import;
- backup recovery.
