# CODEX_TASK.md — Phase 7

Phase 0 + 1 + 2 + 3 + 4 + 5 + 6 are merged.

## Goal

Perform the **Product Polish / PWA hardening** pass.

At the end of Phase 7, the current 67-element game should behave like a robust installable local-first web product:

- offline after first successful load;
- safely updateable without destroying an active experiment/reveal;
- meaningfully code-split and profiled;
- accessible across the supported responsive matrix;
- equipped with consistent motion tiers;
- equipped with browser-safe audio infrastructure;
- protected by production-grade error boundaries/fallbacks.

Do not add new canonical gameplay/content in this task.

Do not start Android/Capacitor.

## Required reading

Read before changing code:

- `AGENTS.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/TECH_SPEC.md`
- `docs/MOTION_AUDIO.md`
- `docs/ACCESSIBILITY.md`
- `docs/RESPONSIVE_AND_UI_STATES.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/VISUAL_DIRECTION.md`
- `docs/VISUAL_BIBLE_REFERENCE.md`
- `docs/COPY_AND_LOCALIZATION.md`
- `docs/SAVE_AND_VERSIONING.md`
- `docs/VALIDATION_AND_TESTING.md`
- `docs/PHASE_6_NOTES.md`

Inspect the current Vite bundle/chunks before choosing lazy boundaries.

## Scope

### 1. PWA integration

Add a Vite-compatible PWA/service-worker integration in the platform layer.

Preferred:
`vite-plugin-pwa` or an equally small Vite-compatible solution.

Requirements:

- production build emits a valid web manifest;
- app shell is available offline after one successful online load;
- bundled canonical content required for gameplay is precached;
- local UI assets required for the current product are precached;
- IndexedDB save remains the source of durable player progress;
- service worker must not cache imported save JSON or create a parallel save store;
- no backend/network dependency is introduced.

Keep service-worker concerns out of Domain/Application.

### 2. Web app manifest

Provide a production manifest with at least:

- `name`: Merge Discovery
- useful `short_name`
- `start_url`
- `display: standalone`
- theme/background colors matching design tokens
- language/direction where supported
- install icons suitable for normal and maskable use

Create simple project-owned placeholder PWA icons if final brand icons do not exist.

Do not use third-party/copyrighted icon assets.

Placeholder icons should reflect the current Merge Discovery elemental/orbit identity and be easy to replace later.

### 3. Offline behavior

After a successful first production load, verify that the player can go offline and still:

- boot the application;
- load the current IndexedDB save;
- navigate Lab/Catalog/Set/Element/Collections/Anomalies/Map;
- combine known inputs;
- persist progress locally;
- use hints and information modes;
- export save JSON.

Do not display a scary global “offline” banner during normal local gameplay.

Connectivity messaging appears only if a future network-dependent feature needs it.

### 4. Safe update flow

Implement a platform/application update state.

When a new service worker/build is available:

- show a small non-blocking `Aggiornamento disponibile` notice;
- never force reload;
- never call update/reload in the middle of a save transaction;
- never reload while a major result/reveal is actively being presented;
- offer `Aggiorna ora` only at a safe point;
- allow `Più tardi`.

A safe point means at minimum:

- no combine transaction in flight;
- no import/overwrite transaction in flight;
- no active blocking recovery operation;
- no major discovery/Set/anomaly reveal currently requiring player acknowledgement.

If update becomes available at an unsafe point:

- remember it in ephemeral platform state;
- surface actionable update once safe.

Do not persist “update available” in PlayerSave.

### 5. Update + save compatibility

Before reload for an accepted update:

- current committed save must already be durable;
- no extra save write is required merely for the service-worker update;
- after reload, normal Phase 2 migration/reconciliation handles content/schema versions.

Add an integration test simulating an available update around a combine/reveal boundary.

No update may cause:

- duplicate XP;
- repeated discovery event;
- lost committed discovery;
- half-persisted state.

### 6. Installation affordance

Installability itself is required.

An in-product install prompt is optional, but if implemented:

- use the browser `beforeinstallprompt` event only;
- never nag;
- show it in Settings or another low-pressure context;
- no fake install button on unsupported browsers;
- dismissal is session/platform UI state, not gameplay progress.

Do not add notification permission requests.

### 7. Design token hardening

Audit Phase 3–6 styles.

Move repeated semantic values into the existing token system where practical:

- backgrounds/surfaces;
- text/muted text;
- borders;
- warm discovery accent;
- anomaly accent;
- field-guide surfaces;
- focus ring;
- spacing;
- radii;
- motion duration/easing;
- elevation/shadow tokens where useful.

Do not perform a visual redesign.

Do not replace the custom product identity with a generic UI library.

Hardcoded one-off values are still acceptable when truly local, but repeated semantic colors/durations should not drift across feature CSS files.

### 8. Motion tier implementation

Map the current UI outcomes to the tiers in `MOTION_AUDIO.md`.

At minimum:

#### Tier 0
- element/card selection;
- button press;
- slot fill/clear.

#### Tier 1
- known result.

#### Tier 2
- alternate recipe.

#### Tier 3
- new element.

#### Tier 4
- Collection completion / normal Set reveal.

#### Tier 5
- hidden Funghi Set reveal.

#### Anomaly
- own restrained unstable grammar.

Implementation requirements:

- central semantic motion classes/tokens or presentation mapping;
- avoid page-blocking waits;
- essential actions available as soon as semantic state is committed;
- no animation controls persistence;
- no strobing/glitch-heavy effects.

### 9. Reduced motion

Respect BOTH:

- saved `reducedMotion`;
- `prefers-reduced-motion`.

When either is active:

- remove large movement/parallax;
- reduce transitions to short opacity/static emphasis;
- anomaly becomes static/low-motion;
- Tier 4/5 remains semantically stronger through typography/border/layout/copy rather than duration.

Add tests proving major reveal information does not disappear when motion is removed.

### 10. Audio event infrastructure

Implement browser audio infrastructure in:

`src/platform/audio/`

or equivalent.

Stable logical event IDs must include at minimum:

- `ui_select`
- `combine_known`
- `combine_no_reaction`
- `discover_alternate`
- `discover_new`
- `collection_complete`
- `set_reveal`
- `hidden_set_reveal`
- `anomaly_unstable`

Future-safe IDs may be documented for:

- `anomaly_resolve`
- `arcano_reveal`

UI/domain code should dispatch logical event IDs, not hardcoded file paths.

### 11. Audio placeholders / lifecycle

Production sound design is out of scope.

For Phase 7, use one of these acceptable strategies:

A. tiny project-owned placeholder audio assets; or
B. a lightweight Web Audio placeholder synthesizer behind the same event-key interface.

Requirements:

- default remains silent according to current save defaults;
- no AudioContext/playback before user interaction;
- if browser blocks/suspends audio, gameplay is unaffected;
- repeated low-value interactions must not become noisy;
- no audio cue conveys information unavailable visually;
- sound preference persists through existing settings.

Do not add large audio packages.

### 12. Sound settings

Use existing durable settings:

- `soundEnabled`
- `musicEnabled`

Expose clear controls in Settings.

Phase 7 does not require an actual ambient music track.

If no music asset exists:

- `musicEnabled` may remain disabled/noted as future or control future-ready state;
- do not play fake continuous oscillator music.

### 13. Route-level code splitting

The current build has an advisory JS chunk around ~595 kB.

Phase 7 must address it with real architecture, not by increasing `chunkSizeWarningLimit`.

Use route/feature lazy loading where appropriate.

Strong candidates:

- Map;
- Catalog/Set/Element/Collections bundle;
- Anomaly Archive;
- Settings diagnostics/import-export.

Laboratory core should remain quick.

Requirements:

- loading state follows existing quiet product language;
- route guards/hidden-content safety remain outside or ahead of lazy UI where necessary;
- deep links still work;
- lazy chunks are cached by PWA after use / or precached if intentionally chosen;
- no hidden metadata is serialized into UI purely because a lazy bundle exists.

### 14. Bundle budget

Do not “fix” the warning by simply raising the warning threshold.

After code splitting, document:

- entry chunk size;
- largest lazy chunk;
- total production JS;
- gzip sizes where available.

Target:

- no single initial JS chunk >500 kB uncompressed;
- preferably substantially below that;
- no single feature chunk becomes an obvious >500 kB replacement problem.

If the target cannot be met without redesigning architecture/dependencies:

- document the exact blocker;
- do not hide it with config.

### 15. Performance profiling

Keep existing:

- catalog 1,000-definition synthetic profile;
- map 1,000-definition synthetic profile.

Add/extend a browser/product performance smoke covering:

- cold production boot from cached assets;
- warm boot;
- Laboratory ready;
- route switch to Map;
- route switch to Catalog;
- combine transaction UI publication.

Do not make CI depend on fragile absolute millisecond thresholds across runners.

Use budgets/assertions for structural regressions instead:

- no global pair matrix;
- no unbounded graph render;
- bounded rendered node count in local Map;
- code-split chunks exist;
- no repeated full-content scan in render loops.

### 16. Element/card rendering polish

Without final production illustrations:

- preserve current `artKey` placeholder contract;
- add lazy/deferred behavior only where actually beneficial;
- avoid layout shift in cards/heroes;
- use fixed aspect-ratio containers;
- prevent image/art fallback from collapsing layout.

No asset-generation project in this phase.

### 17. Production error boundary

Add a top-level React error boundary/fatal UI for unexpected render/application failures.

Requirements:

- calm Merge Discovery styling;
- no raw stack trace to normal user;
- clear reload/retry action;
- save export/recovery link/action when the application/save layer is available;
- development mode may expose diagnostics separately.

Do not silently wipe save.

### 18. Fatal bundled-content failure

The architecture document requires a recoverable fatal-content screen.

If bundled content validation/build/startup fails at runtime:

- do not enter gameplay with partial content;
- show a clear fatal-content state;
- offer safe reload;
- preserve/export existing local save if possible.

Build-time validation remains mandatory.

Add a test fixture/path for this UI without corrupting canonical content.

### 19. Accessibility hardening audit

Treat WCAG 2.2 AA core-flow regressions as blockers.

Run/fix:

- keyboard-only full seed smoke or representative end-to-end progression;
- Lab;
- Collection/Catalog;
- Element Detail;
- Collections;
- Anomaly Archive;
- Map;
- Hint UI;
- Settings/import-export;
- update banner;
- error boundary/fatal screen.

Requirements remain:

- logical focus;
- skip-to-main mechanism if not already present;
- semantic landmarks;
- live announcements not duplicated;
- no color-only state;
- 44×44 touch targets;
- forced colors;
- reduced motion;
- 200% zoom.

### 20. Screen-reader smoke documentation

Automated tests are not a substitute for an actual assistive-technology smoke procedure.

Add a concise manual checklist for at least:

- VoiceOver or NVDA/JAWS equivalent;
- Lab combination;
- new discovery announcement;
- Element Detail;
- Map relationship explorer;
- hint request;
- Anomaly entry;
- settings/update notice.

Do not claim manual execution if Codex cannot actually perform it.

Mark it as a release checklist item if unexecuted.

### 21. Responsive hardening matrix

Re-run and fix all current primary screens at:

- 320×568
- 390×844
- 768×1024
- 1024×768
- 1440×900
- 1920×1080

Also test:

- 200% browser zoom;
- extra-large in-game text;
- landscape phone;
- soft-keyboard search interaction where Playwright can reasonably simulate viewport changes;
- safe-area CSS variables.

No horizontal document overflow.

### 22. Safe areas

Add/use CSS environment insets where appropriate:

- top app shell;
- mobile bottom nav;
- full-width sheets;
- update/install notices.

Critical controls must not sit behind mobile browser/native gesture areas.

This should remain compatible with future Capacitor without Android-specific branching.

### 23. PWA update/offline UI accessibility

Update/install controls must:

- be keyboard reachable;
- have explicit labels;
- not steal focus when appearing;
- announce availability politely at most once per update;
- retain focus logically after update dismissal;
- never require a timed response.

### 24. Security / cache scope

Service worker must cache only intended app-origin build/static assets.

Do not:

- cache arbitrary external origins;
- intercept GitHub/dev URLs;
- eval imported data;
- inject raw HTML from content;
- cache user save exports as runtime responses.

Keep strict import validation unchanged.

### 25. Production build verification

Add commands/scripts as needed to verify:

- manifest emitted;
- service worker emitted;
- PWA registration in production preview;
- app works offline after first load;
- update prompt flow can be exercised in a controlled test;
- lazy chunks load successfully through production preview;
- IndexedDB persists across offline reload.

Do not rely only on Vite dev server for PWA acceptance.

### 26. CI

Extend CI without making it excessively flaky.

Required gates:

- existing check/tests/validator/reachability;
- existing catalog/map profiles;
- production build;
- PWA artifact/manifest validation;
- E2E current suite;
- targeted production-preview PWA/offline E2E.

If service-worker browser tests are inherently flaky in one CI mode, isolate them clearly and document why; do not silently skip all offline validation.

## Required reusable/platform pieces

At minimum:

- PWA registration/update controller;
- update notice component;
- platform online/offline capability helper if needed;
- audio event interface/engine;
- semantic motion token/tier mapping;
- top-level ErrorBoundary;
- fatal-content fallback;
- lazy feature boundaries.

Do not move gameplay truth into these layers.

## Required tests

### PWA

- manifest has required fields/icons;
- service worker generated;
- production preview registers SW;
- second load works offline;
- offline load opens current save;
- offline combine persists and survives reload;
- offline Map/Catalog routes open after cached use or deliberate precache strategy.

### Update

- update availability is non-blocking;
- unsafe combine/reveal prevents immediate reload;
- accepted safe update calls the update path once;
- `Più tardi` leaves gameplay usable;
- no duplicate discovery/XP around simulated update boundary.

### Audio

- default settings cause no playback;
- playback cannot initialize before user interaction;
- enabled sound dispatches expected logical event ID;
- blocked/suspended audio does not reject gameplay actions;
- reduced motion does not alter audio correctness;
- sound setting persists.

### Motion

- event → tier mapping;
- reduced-motion mapping;
- hidden Funghi reveal retains semantic Tier 5 text without large animation;
- anomaly remains readable with animation disabled.

### Bundle/lazy loading

- route-level lazy chunks exist;
- initial chunk stays under target;
- changing warning limit is not the mechanism used;
- deep links lazy-load successfully;
- hidden route guards still prevent data leakage.

### Error handling

- UI render error reaches branded error boundary;
- retry path works where possible;
- fatal-content fixture never boots gameplay;
- neither path clears current IndexedDB save.

### Accessibility/responsive

- skip link/focus;
- update notice accessible;
- settings audio controls accessible;
- 320 px;
- landscape phone;
- 200% zoom;
- extra-large text;
- forced colors;
- reduced motion;
- axe on representative primary routes.

### Regression

All Phase 0–6 tests/E2E remain green.

Canonical seed remains:

- 67/67 reachable;
- max depth 11;
- no blocked required unlocks;
- 4 Collections;
- 1 unresolved anomaly.

## Screenshot evidence required

Use the production build/preview where applicable.

Include:

1. `1440×900` — polished Laboratory normal state;
2. `1440×900` — Tier 3/new element or major reveal showing motion-tier visual hierarchy in a static frame;
3. `1440×900` — Settings with accessibility/audio/information controls;
4. `390×844` — installed/PWA-like standalone responsive shell or production mobile shell;
5. `390×844` — update-available notice at a safe point;
6. `320×568` — one core screen after responsive hardening.

Also include machine-readable/documented PWA evidence; screenshots alone do not prove offline behavior.

## Explicitly out of scope

Do NOT implement:

- new canonical elements/recipes/Sets/Collections;
- Tier 4/5 hints;
- Resonance;
- pinned objective save field;
- achievements;
- final illustration production;
- production sound/music composition;
- Arcano payoff content;
- Android/Capacitor;
- backend/cloud sync;
- accounts;
- monetization;
- analytics;
- notifications.

## Delivery

Work on a dedicated branch and open a PR.

PR description must include:

- PWA/service-worker strategy;
- cache scope;
- update-safe-point behavior;
- bundle before/after table;
- lazy boundaries;
- motion tier architecture;
- audio event architecture/placeholder strategy;
- error/fatal-content recovery behavior;
- accessibility audit summary;
- manual screen-reader checklist status;
- responsive matrix results;
- offline/PWA production-preview evidence;
- screenshots listed above;
- commands run;
- unit/component/E2E results;
- validator/reachability results;
- explicit confirmation Phase 8 content and Phase 9 Android were not started.

Do not extend scope.
