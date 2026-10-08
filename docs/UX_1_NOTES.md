# UX-1 — two shared-engine interaction modes

Draft stacked on PR #11 (`codex/phase-7-5c`). #9–#12 verified open/unmerged at start. This branch merges the two new proposal documents from main, without including PR #12's authoring dossier or changing canonical content. No visual or usability approval is implied.

Read AGENTS, UX_1_TWO_MODES, CONTENT_1_IMPORTER, CODEX_LONG_RUN, VISUAL_UX_ALIGNMENT, VISUAL_BIBLE_REFERENCE and original poster, TECH_SPEC, DATA_MODEL, RESOLUTION_ENGINE, SAVE_AND_VERSIONING, DECISIONS, GAME_VISION, IMPLEMENTATION_SEED_CONTENT, VALIDATION_AND_TESTING, ACCESSIBILITY, HINTS_AND_FAILURE, SCREEN_SPECS, DESIGN_SYSTEM, RESPONSIVE_AND_UI_STATES, UX_SCREEN_ARCHITECTURE, MOTION_AUDIO and PHASE_7_NOTES. UX-1's explicit free-table gesture overrides the historical explicit-combine requirement for that mode only; classic Lab keeps its explicit action.

## Implementation

- One App command coordinates both input modes through the unchanged SaveApplication, resolver, PlayerSave and ContentIndex. Outcomes and reusable result figures publish after successful persistence. A failure preserves the prior save and input figures.
- `application/attempt.ts` checks the current resolver, current recipe identity and meaningful events. A known result from a new alternative recipe, changed eligibility, stale failed pair or new anomaly payoff is never blocked. A remembered outcome avoids another transaction; explicit retry remains available. Deliberate remembered attempts still count towards session-only stall offers, preserving existing hint semantics.
- `FreeTable.tsx` owns presentation copies and percentage coordinates only. Native pointer capture supports mouse/touch/pen input without another drag library. Intentional moved overlap invokes the same command; clicks/duplication do not combine. Inputs are reusable and return to their prior position after collision. A new committed result is placed nearby; a remembered drop does not manufacture another result figure.
- All operations also have buttons and keyboard paths. Enter/Space adds/selects, arrows move without combining, Shift speeds movement, Delete removes, Escape clears selection; Duplica/Combina figure/Ripeti figure comunque/Rimuovi/Pulisci operate on presentation copies. Clearing the table never clears discoveries. Rendering suspends older figures beyond 100 with a visible warning; this is not a progression cap.
- Shared library query/favorites/recency/filter/order state survives mode and route changes. Search normalizes Italian accents, searches owned names, visible Set names and optional localized aliases; it never searches a raw universe. `/` focuses search except while typing. Sticky controls, recent choices, quick favorites, result reuse, safe exhaustion and current possibilities reduce repeated navigation.
- Large libraries render a bounded accessible page of 120 cards rather than an unbounded DOM. All seed cards fit the first page; page/query/filter controls allow access to every owned discovery. No full pair matrix is introduced. Live card state remains safe and follows the existing information preference.
- Calm navy/gold table sigil, drag ghost and patterned collision cue use existing art placeholders and result motion tiers. High contrast, forced colors, reduced motion and opt-in audio semantics are preserved.

## Verification

`npm ci`, `npm run dev`, `npm run check`, `npm run validate:pwa`, `npm run profile:catalog`, `npm run profile:map`, `npm run test:e2e`, `npm run test:production`.

202 unit/component tests (16 files), typecheck/lint/content validation/build pass. Canonical seed remains **67/67 reachable, depth 11**, no blocked unlocks. Full E2E **23/23**, including keyboard traversal of all seed elements, known/alternate/no-reaction semantics, desktop pointer interactions, Chromium real touch events and responsive/axe matrix in both modes. Production **14/14**: existing offline and safe-update suite plus free-table keyboard discovery offline and reload. Both 1000-element profiles and PWA budgets pass (20 precached assets / 10 JS chunks). Final focused reruns cover subsequent presentation placement/pointer-cancellation corrections.

The offline/performance assertions deliberately check that known skipped attempts don't increment storage revisions; explicit retry then demonstrates a real offline zero-XP transaction. Existing regression failures for duplicated filter labels and short recent-button hit targets were corrected. Historical screenshots/reports are restored after regression generation; UX evidence lives separately.

Screenshots at 320×568, 390×844, 768×1024, 1024×768, 1440×900 and 1920×1080: `docs/screenshots/ux-1`, plus desktop/mobile committed new-discovery states. Short actual touch interaction recording: `docs/videos/ux-1/390-touch-table.webm`. Bundle report: `docs/evidence/ux-1/bundle.json`.

## Review and limits

Physical devices, hardware pen, NVDA/JAWS/VoiceOver and browser-chrome zoom have not been exercised; browser tests use real Chromium input with mobile emulation. Visual approval/playtest remain human gates. The table uses edge autoscroll for library drags on mobile; tap addition remains the simpler path. Layout is session presentation and intentionally resets on reload. Pan/zoom is deferred until needed. Optional aliases require authored localization; no taxonomy labels were invented.

CONTENT-1A/B are separate stacked branches. No Phase 8B/8C or Android work, canonical recipes, XP, unlock, save schema, secrecy, hint boundary or PWA/update semantics have changed here.
