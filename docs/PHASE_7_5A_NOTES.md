# Phase 7.5A — Shell and Laboratory visual alignment

Scope is the user's **Phase 7.5A** tranche of the broader Phase 7.5 task: AppShell, desktop rail/mobile navigation, brand/Discovery Level, shared visual tokens and ElementCard/ElementArt, slots, Combine, reaction presentation, Lab search/favorites and desktop/mobile Laboratory. **Phase 7.5B and Phase 8 have not started.**

The Collection Home, Set index/detail, Element Detail, thematic Collections, Map, Anomaly Archive and Settings keep their existing composition and behavior. Their use of the allowed shared shell/art/card components is intentional; their page CSS and JSX were not redesigned. Canonical content, Domain, Application projections, persistence, resolver, XP, unlocks, visibility, hint boundaries, save schema and PWA/update implementation are unchanged.

## References and interpretation

Read before implementation: AGENTS; VISUAL_UX_ALIGNMENT; VISUAL_BIBLE_REFERENCE; VISUAL_DIRECTION; DESIGN_SYSTEM; SCREEN_SPECS; UX_SCREEN_ARCHITECTURE; RESPONSIVE_AND_UI_STATES; MOTION_AUDIO; ACCESSIBILITY; PHASE_7_NOTES, plus architecture/validation guidance. Inspected the Phase 7 desktop Laboratory, mobile production shell and new-discovery screenshots before changing the UI.

The newer canonical alignment/Bible reference explicitly supersedes the older light-Catalog language in VISUAL_DIRECTION/DESIGN_SYSTEM. This tranche uses midnight/black-blue, thin brass/gold framing and celestial geometry. It does not reinterpret the game as an ivory field guide. The user-mentioned attached poster was not available in the current conversation/tool input; the implementation follows the repository's canonical translation of that reference. **Direct human comparison to the original poster and visual approval are pending.** No unresolved gameplay-spec contradiction was found.

## Deliberately replaced composition

- The large rounded active navigation block becomes a restrained gold leading rule and subdued gradient, with smaller rail/wordmark and integrated level progress. Mobile uses a lighter safe-area-aware bar and an active gold line. Visible “Lab”/“Opzioni” labels prevent broken words at 320px, while accessible names remain the full “Laboratorio”/“Impostazioni”; existing disclosure and max-five grouping are unchanged.
- The tall centered Lab heading becomes a compact editorial introduction. The experiment takes the center: two substantial glass specimen plates, warm corner framing, large silhouette studies, fine orbital/crosshair linework and an explicit warm-gold Combine button.
- Result presentation no longer stacks a large illustration, title, tags and prose vertically. An art/readout composition sits below the instrument; all existing use/view/repeat/reset actions remain. Tier 3 has larger art and stronger discovery type than known results. Anomaly uses its own violet incomplete-orbit readout and no invented result.
- Library cards prioritize art/name. Repeated visible Set metadata is removed **in the Lab only**, while accessible labels retain the Set and full tested-pair context. A selected card shows one visual state cue; context stays in its accessible name. Favorites remain separate 44px controls. Search and the existing favorites filter use quieter brass framing; no new filter semantics were added.
- Symbolic line icons become local SVG silhouette studies with gradients, clipped fine texture, rim light, grounding shadows and a restrained orbit. Stable `artKey`, decorative semantics and unique SVG paint-server IDs remain. Semantic art categories plus a stable generic fallback avoid authoring 67 final illustrations. No remote fonts/assets, image generation or external artwork.

## Visual architecture and boundaries

`src/styles/observatory.css` is the scoped shell/Lab alignment layer, imported eagerly after the legacy base/shared-callout CSS. It leaves secondary-page styles intact. New semantic tokens cover display type, brass lines, glass/night surfaces, gold and specimen depth. Existing Phase 7 motion tokens and presentation mapping are reused without changing event/acknowledgement timing.

`ObservatoryMarks.tsx` holds purely decorative brand/instrument SVGs. `LabComponents.tsx` receives the same safe DTOs/callbacks; the new result-copy and specimen wrappers are presentation only. `ElementArt.tsx` interprets art keys solely for silhouettes, never recipe partners or hidden metadata. `AppShell.tsx` still renders only the destinations supplied by the existing disclosure projection. Laboratory selection, focus restoration, search/filter state and durable actions use their unchanged handlers.

All CSS/SVG is local and bundled. The unchanged PWA builder precaches the new eager CSS/JS through the same asset strategy. No service-worker, cache, update controller, audio or safe-point code was modified. Route lazy boundaries and guards remain intact.

## Responsive and accessibility

The production visual test audits 320×568, 390×844, 768×1024, 1024×768, 1440×900 and 1920×1080, while retaining the selected Acqua/Terra pair across all resizes. It asserts no horizontal document overflow, 44px targets, WCAG 2.2 AA axe tags, max-five mobile navigation and Combine within the initial viewport above the mobile navigation.

At 390px, illustrated slots are side by side; at 320px, they become two compact horizontal specimen rows with art beside the name, keeping Combine reachable. Desktop preserves independent central/library scrolling; tablet uses the existing lower-library arrangement. Large/extra-large text keeps the stacked-slot escape hatch. All controls remain real labeled buttons; no information lives in SVG. Focus, saved/OS reduced motion, high contrast, forced colors, landscape, 200% text enlargement/equivalent zoom reflow and soft-keyboard viewport smoke are covered by the unchanged Phase 0–7 suites.

Manual NVDA/JAWS/VoiceOver, physical-device keyboard/notch and actual browser-chrome zoom checks remain **NOT EXECUTED**, as documented in the Phase 7 release checklist. Automated checks are not visual approval or an assistive-technology certification.

## Production evidence and review

New AFTER screenshots (all real production build; no fabricated UI result):

| File | Viewport / state |
| --- | --- |
| [1440-laboratory](screenshots/phase-7-5a/1440-laboratory.png) | 1440×900, owned Acqua + Terra before explicit Combine |
| [1024-laboratory](screenshots/phase-7-5a/1024-laboratory.png) | 1024×768, same experiment |
| [390-laboratory](screenshots/phase-7-5a/390-laboratory.png) | 390×844, paired mobile instrument |
| [320-laboratory](screenshots/phase-7-5a/320-laboratory.png) | 320×568, compact stacked instrument |
| [1440-new-discovery](screenshots/phase-7-5a/1440-new-discovery.png) | fresh save: authored Energia + Energia → Calore, Tier 3 |
| [1440-anomaly](screenshots/phase-7-5a/1440-anomaly.png) | canonical Vita + Luna, unresolved observed anomaly |
| [390-new-discovery](screenshots/phase-7-5a/390-new-discovery.png) | mobile Tier 3 and all four result actions |

BEFORE references: [desktop Laboratory](screenshots/phase-7/1440-laboratory.png), [mobile shell](screenshots/phase-7/390-production-shell.png), [new discovery](screenshots/phase-7/1440-new-discovery.png). The populated AFTER fixtures have selected inputs for evaluating the instrument; the old neutral baseline has empty slots. The two new-discovery captures use the same authored A+A path and are directly comparable.

The new browser test imports the existing `v1-anomaly-observed` save through normal strict import UI; new discovery uses a separate fresh browser context. Anomaly capture uses **Vita + Luna**, as authored in the seed, not the future illustrative Lupo + Luna example in the Bible. Historical Phase 7 evidence is preserved: rerunning its production suite now writes to ignored test-output directories. New Phase 7.5A evidence is published separately.

## Commands and acceptance

```sh
npm ci
npm run dev
npm run check
npm run validate:pwa
npm run profile:catalog
npm run profile:map
npx playwright install chromium
npm run test:e2e
npm run test:production
npm run preview -- --host 127.0.0.1
```

`test:production` serves the actual `dist` build at isolated port 5179; build first. It includes every Phase 7 PWA/offline/update/responsive test and the new visual-composition test. The existing CI invokes it automatically. No application fixture backdoor was added.

Final local gates passed: **195 unit/component tests in 13 files, 20 regression E2E and 11 production E2E**. Typecheck, lint, production build, content/PWA validators and both 1,000-element profiles passed. Canonical reachability remains **67/67, depth 11, no blocked unlocks, four Collections and one unresolved anomaly**. The seven PNG dimensions and offline/update JSON were checked automatically; all seven final images were inspected. Results are recorded in `evidence/phase-7-5a/verification.json`; Phase 7 production regression reports are copied under its `regression` directory.

Review the screenshots against the original Design Bible **before merging**. Passing tests is necessary and is not sufficient for visual acceptance.
