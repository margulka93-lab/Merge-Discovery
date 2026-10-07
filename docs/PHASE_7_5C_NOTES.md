# Phase 7.5C — Observatory exploration and coherence

Draft stacked on Phase 7.5B / PR #10. Both parents and this design remain visually unapproved. No merge has been performed. Scope is presentation of Map, observed Anomaly Archive and Settings; no content, resolver, save, XP, unlock, visibility, hints or PWA/update behavior changes.

Required reading completed: AGENTS, CODEX_LONG_RUN, the original poster (project copy from main), Phase 7.5A/B notes, VISUAL_UX_ALIGNMENT, SCREEN_SPECS, ACCESSIBILITY, MOTION_AUDIO and RESPONSIVE_AND_UI_STATES. Existing newer canonical dark interpretation supersedes historical pale catalog text.

## Reference and implementation

The poster's constellation uses illustrated circular discoveries and fine brass junctions, with a selected specimen prominent in a midnight canvas. Map now arranges the **same safe disclosed nodes** on concentric orbits around the selected element. Fit/centering accounts for the viewport; the selected target is larger, with a warm ring. Static instrumental linework is decorative. Every authored A+B→C retains its three legs and junction; alternate and observed anomaly edges retain their distinct patterns. The accessible relationship list, mode/depth/query controls and pan/zoom handlers remain authoritative and functional. Legacy graph path/circle rules are scoped to the graph SVG so they no longer flatten the ElementArt illustrations inside nodes.

`ExploreNavigation` receives existing Map/Archive disclosure booleans. It adds visual family navigation without exposing unavailable features. Anomaly panels emphasize the two known illustrated inputs, an incomplete violet mark, recorded status/time and explicit retry. No future resolution/result is added. Settings gives information, accessibility, sound and advanced local data quiet editorial groups with thin rules; controls and persistence handlers are unchanged. Existing global update notice remains available through the shared shell with its safe acknowledgement behavior.

`exploration.css` scopes navy/glass/brass typography and surfaces above the legacy lazy styles. It adds no remote assets, animation dependency or final art. High contrast, forced colors, 320px/extra-large text, accessible button hit areas and reduced motion retain the earlier contracts. The new static constellation needs no motion exception. Lab and knowledge compositions remain unchanged; two fresh production captures demonstrate cross-screen continuity.

## Evidence

Production captures in `screenshots/phase-7-5c`: 1440×900 Map, Archive, Settings, Lab and Collection; 390×844 Map, Archive and Settings; 320×568 Map. Mobile Map has an additional overview capture; the primary capture shows the canvas after normal page scroll so its central specimen and controls can be assessed. Earlier Phase 5/6 screenshots remain the BEFORE baseline. All SVG imagery remains a project-owned placeholder rather than approved final illustration.

The new production audit covers Map/Archive/Settings at all six supported test viewports, asserts selected-node containment and the accessible list, checks axe AA/overflow and captures real DOM screens. Full Phase 0–7 regression suites continue to check route guards, hidden queries, hint boundaries, keyboard/focus, 44px controls, saved/OS reduced motion, forced colors, large text, equivalent 200% reflow, offline save/export and real waiting-worker update acknowledgement.

```sh
npm ci
npm run dev
npm run check
npm run validate:pwa
npm run profile:catalog
npm run profile:map
npm run test:e2e
npm run test:production
```

Final counts, reachability and results are in `evidence/phase-7-5c/verification.json`. Manual screen-reader and physical device checks are NOT RUN. Visual approval is PENDING. No gameplay contradiction was encountered in this visual stage. Content expansion and Android are subsequent, separately reviewed branches.
