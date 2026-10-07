# Phase 7 — production web hardening

Scope: current `CODEX_TASK.md`, Phase 7 only. Canonical content, resolver, visibility, unlocks, XP, information modes, favorites and save schema are unchanged. Tier 4/5 hints, Resonance, Arcano, Phase 8 content and Phase 9 Android/Capacitor were not started. Motion tiers below are presentation intensities, not hint tiers.

## Architecture and production PWA

Domain stays pure. Application supplies committed snapshots and semantic presentation events. Composition in `src/app/App.tsx` connects those events to `src/platform/audio` and `src/platform/pwa`; UI receives DTOs/callbacks. All preferences go through `SaveApplication.updatePreferences`, including the existing sound/music fields. No platform state enters PlayerSave or IndexedDB.

The small Vite post-build plugin (`src/platform/pwa/build.ts`) emits `sw.js` and `pwa-artifacts.json`. It hashes asset paths and bytes, explicitly precaches the generated HTML, bundled canonical data, JS/CSS, manifest and local icons, including **every lazy chunk**. Installation is atomic: a failed asset fetch deletes only the incomplete new cache. No runtime response caching, external requests, dev modules, GitHub, imported JSON or exported saves. IndexedDB remains the only save source of truth. Known application navigations use the cached shell, including Map query parameters. No global offline banner.

Normal/maskable PNG icons are project-owned geometric technical placeholders, not production illustrations. Their motif is inside the maskable safe circle. Replace the three files in `public/icons` and retain manifest dimensions/purposes when final assets are approved. The manifest uses Italian, left-to-right, standalone display and the canonical midnight navy colors. No install prompt is fabricated; no notification permission is requested.

Registration runs only from the production entry, including fatal startup/recovery. A normal boot cannot offer acceptance until its existing boot promise has settled and the playable shell has rendered. Missing SW support or registration/network errors do not block gameplay. Production should be served over HTTPS (localhost is suitable for local testing). Use a separate preview origin from development to avoid testing an old registered worker against Vite dev assets. Local saves are scoped to their origin, as before.

## Update protocol

Installation never calls `skipWaiting`. A waiting worker creates one polite, nonblocking availability announcement without moving focus. The coordinator synchronously counts combine, preference, import/preview/export and recovery operations; a major discovery/Set/Collection/anomaly outcome holds a separate acknowledgement lock. The banner exposes **Aggiorna ora** only when both locks are clear. Result information and controls are available immediately after persistence; there is no animation timer in this protocol.

An explicit result action (new experiment, repeat, use, clear/select or open its sheet) acknowledges the outcome. Leaving the Laboratory alone does not acknowledge it. **Più tardi** hides the notice for this page session and returns focus to the current main; the waiting update is retained and offered on a later page boot. Accepting an update synchronously prevents new operations, sends one activation message, and reloads the accepting tab once on controller change. It never writes another save. Existing Phase 2 startup reconciliation then runs normally.

Other tabs never auto-reload. The worker retains old app caches while multiple clients remain open, and reads an old tab's hashed lazy assets from those caches. When activating alone it retains current and immediate predecessor caches, deleting only older caches with this application's prefix. Unrelated caches are untouched.

Unit/integration coverage includes nested locks, idempotent release/activation/reload, no reload on initial activation or another tab's activation, actual SaveApplication combine/reopen with identical persisted slots/XP/discoveries, failed precache rollback, query navigation, non-GET/external/export exclusions and previous lazy assets. Production browser coverage installs a real waiting worker by changing its build version in a **test-only asset server**, keeps a new discovery visible, acknowledges it, applies once and checks unchanged IndexedDB. There is no application test/update backdoor in the shipped build.

## Splitting and bundle evidence

Baseline was measured from unchanged `origin/main` (`7b96c55`) before implementation using the same production builder. Values are decimal kB, gzip is measured independently for each JS chunk.

| Metric | Before raw / gzip kB | After raw / gzip kB |
| --- | ---: | ---: |
| Entry JS | 594.846 / 180.551 | 116.740 / 31.380 |
| Largest JS chunk | 594.846 / 180.551 | 263.031 / 83.616 |
| Largest lazy feature (Catalog) | included in entry | 12.259 / 3.900 |
| Total JS | 594.846 / 180.551 | 604.707 / 186.304 |

The eager entry also imports React/router (263.031 kB), schema validation (96.640 kB) and storage (96.411 kB): total eager JS is **572.822 kB**, not just the 116.740 kB entry. Splitting reduces eager application work and enables independent caching; it does not eliminate vendor downloads. Total JS/gzip grows slightly because Phase 7 adds platform/recovery functionality and chunk boundaries reduce cross-chunk compression. No budget threshold was raised: entry and all chunks must stay below 500 kB.

Lazy UI boundaries: Discovery Map; Catalog/Set/Element sheets as one shared feature module; thematic Collections; Anomaly Archive; Settings; SaveDiagnostics only when recovery is needed or its details are opened. Guards precede route rendering. Suspense supplies quiet loading text, and focus is restored after lazy route commit. Laboratory remains mounted through navigation, preserving input/search/session behavior. Laboratory's shared reveal CSS stays eager; Catalog and Map CSS are deferred. All deferred files are deliberately precached for offline use.

`bundle-before.json` / `bundle-after.json` in `docs/evidence/phase-7` give byte counts and filenames. Production performance timings are informational, not hardware-dependent pass thresholds. Existing 1,000-element synthetic profiles retain 64 authored recipes, cached projectors and no global pair matrix. Local Map render size remains bounded. `artKey` SVG placeholders retain their fixed art containers; no image production or replacement catalog was introduced.

## Motion and audio

`src/application/presentation.ts` maps the highest committed outcome to a presentation tier, cue and acknowledgement requirement. All lower-priority callouts remain readable. Tier 0 selection/press uses 100 ms; known 300 ms; alternate 550 ms; new element 1,100 ms; completed Collection/normal Set 1,750 ms; hidden Set 2,200 ms. A newly revealed but incomplete Collection uses the new-discovery intensity, not the completion cue. Unresolved anomaly uses a restrained opacity/archive-mark grammar, not flashing/glitch repetition. One stage animation replaces competing child animations. Durations, easing, focus, repeated paper/art colors, card/inset radii and slot/notice shadows are tokens.

Saved reduced motion **or** OS reduced motion produces a 160 ms static crossfade, keeping headings, art, callouts, semantic feedback and actions. No progress relies on animation completion. Existing safe-area/navigation behavior remains; the new notice is also bounded by dynamic viewport and safe-area insets.

WebAudio implements replaceable low-volume sine-tone placeholders behind stable IDs: `ui_select`, `combine_known`, `combine_no_reaction`, `discover_alternate`, `discover_new`, `collection_complete`, `set_reveal`, `hidden_set_reveal`, `anomaly_unstable`. Sound defaults off; no AudioContext is created before both consent and a user gesture. Selection is throttled; unavailable/blocked/suspended audio falls back silently without rejecting gameplay. Music remains a disabled future preference with clear copy, not a generated loop. Future `anomaly_resolve` and `arcano_reveal` are reserved design IDs only, with no implemented payoff.

## Recovery, accessibility and responsive audit

The top-level error boundary presents calm retry/reload/raw-export actions without exposing exception stacks. Fatal bundled-content validation stops gameplay and offers reload plus read-only export of the original current/backup slots. Neither path clears a save. The recovery composition also subscribes to updates: raw export uses the exact Phase 2 recovery envelope and holds an operation lock; an explicit reload can activate a healthy waiting build before reloading. Retry refreshes the cached boot promise from the latest committed save instead of displaying the first-launch snapshot. `tests/ui-fixtures/recovery.html` exercises both screens against real IndexedDB without corrupting canonical data; this isolated dev fixture is excluded from production/precache. It is also covered by component and browser accessibility tests.

The automated production matrix covers Laboratory, Catalog, Sets/index/detail, Element sheet, thematic Collections/index/detail, Anomaly Archive, local Map and Settings at **320×568, 390×844, 768×1024, 1024×768, 1440×900 and 1920×1080**. Axe WCAG 2.2 AA tags, overflow and 44 px target checks run on each route. Additional checks exercise update notice, hint, settings/import-export, forced colors, saved/OS reduced motion, extra-large text, landscape phone, keyboard/search viewport changes and 200% zoom reflow. The latter uses the equivalent CSS viewport (1440×900 at 200% → 720×450); earlier regression tests additionally exercise 200% text enlargement. This is not a claim of manual browser-chrome zoom or physical virtual-keyboard execution.

The existing full-seed keyboard progression and route knowledge-boundary tests remain required. Regression screenshots now use each Playwright test output directory, preserving historical tracked evidence and avoiding observed Windows write locks. Only the six Phase 7 captures are published to their new documentation directory. Appearance does not steal focus; explicit update deferral returns to main; lazy screen commit and recovery focus are logical. No new live outcome duplication or color-only gameplay information is introduced.

### Manual screen-reader release checklist — NOT EXECUTED

Codex did not run NVDA/JAWS/VoiceOver. This remains a manual release check, separate from automated axe:

- Start NVDA/JAWS on Windows or VoiceOver on macOS/iOS; navigate landmarks and skip to main.
- In Laboratory, select two elements with keyboard, combine, hear one concise discovery announcement, retain focus on Combina and reach result actions.
- Open an owned Element sheet; verify name, known relationships, favorites and return navigation.
- In Map, use the structured relationship explorer, change central element and verify heading/focus without requiring the visual graph.
- Request, advance and close a hint; confirm no exact recipe leak and return focus to its trigger.
- Open an observed anomaly; read inputs/status and prepare retry without automatic combination.
- Change information/accessibility/audio preferences; inspect import preview and cancellation before overwrite.
- Observe waiting-update availability once without focus movement; confirm major reveal blocks update, acknowledge, defer/return focus, then accept at a safe point.
- On fatal/error fixture, read the alert, retry/reload and export original JSON; confirm save survives.

## Evidence and commands

Production browser JSON, bundle reports, synthetic profiles and reachability are under `docs/evidence/phase-7`. The six production screenshots are under `docs/screenshots/phase-7`: desktop Laboratory, new discovery, Settings; mobile shell, safe update; minimum-width Catalog.

```sh
npm ci
npm run dev
npm run check
npm run validate:pwa
npm run measure:bundle
npm run profile:catalog
npm run profile:map
npx playwright install chromium
npm run test:e2e
npm run test:production
npm run preview -- --host 127.0.0.1
```

The production E2E command uses real `dist` files at isolated port 5179 and must follow a successful build. `npm run preview` is the standard Vite production preview for manual verification. CI runs all gates, including both browser suites and the PWA artifact validator.

The first Linux CI run exposed a legacy route-test selector matching both the Mondo Set and Mondo roccioso Collection during navigation. The test now focuses the exact `/sets/world` destination, which also waits for the intended route content; its focused local rerun passed. No application behavior or canonical content changed for this correction.

Final gates passed: **186 unit/component tests in 12 files, 20 regression E2E, 10 production E2E plus two expanded offline/deferral reruns**, content/PWA validators, production build and both 1,000-element profiles. Final results are recorded in `docs/evidence/phase-7/verification.json` after completion. Canonical acceptance remains **67/67 reachable, depth 11, no blocked unlocks, four completed Collection chapters and one observed unresolved anomaly**. No specification contradiction was found; unexecuted manual assistive-technology and physical-device checks are explicitly listed above.
