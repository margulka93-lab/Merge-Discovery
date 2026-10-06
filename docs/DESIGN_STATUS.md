# Design Status

## Codex readiness

**PHASE 0 + PHASE 1 + PHASE 2 MERGED · READY FOR PHASE 3**

Phase 0 + 1 were merged in PR #2. Phase 2 was merged in PR #3. Figma is not a dependency; Phase 3 is specified directly from the repository design bible and UX documents.

Legend:

- ✅ specified enough to implement
- 🟡 intentionally tunable / content-production follow-up
- ⚪ future optional layer

| Area | Status | Notes |
| --- | --- | --- |
| High concept / pillars | ✅ | Locked |
| Era / Set / Collection / Tag taxonomy | ✅ | Materia folded into Origini; Mondo consolidated |
| Data model | ✅ | DATA_MODEL.md |
| Combination resolver | ✅ | Deterministic precedence/edge cases specified |
| Hidden/secret visibility | ✅ | Projection rules specified |
| Player inventory semantics | ✅ | Infinite reusable discoveries |
| Pair order / A+A | ✅ | Locked |
| Implementation seed content | ✅ | 67 elements, exact recipes, anomaly, Collections |
| Seed reachability | ✅ | 67/67 design simulation; code must reproduce |
| Progression structure | ✅ | System locked; numbers remain data-tunable |
| XP early curve | ✅ | Seed implementation values available |
| Set unlock behavior | ✅ | Reveal modes/seed triggers specified |
| Hints / anti-brute-force | ✅ | Free tiered system, no currency |
| Catalog / discovery graph | ✅ | Information architecture + spoiler rules |
| Collections / objectives | ✅ | Optional, seed Collections locked |
| Onboarding | ✅ | First-session flow specified |
| Humanity / Culture / Technology | ✅ | Content framework and selection matrix |
| Arcano transition | ✅ | Transition logic / preferred bridge specified |
| Endgame / retention | ✅ | Meta and expansion policy specified |
| Desktop UX | ✅ | Screen specs + responsive rules |
| Mobile UX | ✅ | Portrait-first flows + exact breakpoint defaults |
| UI empty/error/offline/update states | ✅ | Responsive state spec |
| Visual identity | ✅ | Visual direction + semantic design system |
| Final production art | 🟡 | Asset production occurs after/alongside UI validation |
| Motion / VFX behavior | ✅ | Event tiers and reduced-motion mapping |
| Production audio assets | 🟡 | Logical event language locked; files not yet produced |
| Accessibility | ✅ | WCAG 2.2 AA target and interaction requirements |
| Save / migration / export | ✅ | Local-first versioned persistence spec |
| Localization / copy | ✅ | Italian-first key-based system |
| Technical architecture | ✅ | TECH_SPEC.md |
| Validation / tests | ✅ | CI/content/reachability strategy |
| PWA direction | ✅ | Offline-first requirement specified |
| Android architecture | ✅ | Later Capacitor wrapper, no gameplay fork |
| Monetization | ⚪ | Not required / no dependency |
| Analytics | ⚪ | Optional future layer |
| Codex PR breakdown | ✅ | IMPLEMENTATION_PLAN.md |
| Phase 0 + 1 implementation | ✅ | Merged via PR #2 |
| Phase 2 implementation | ✅ | Merged via PR #3 |
| Visual Phase 3 implementation spec | ✅ | VISUAL_BIBLE_REFERENCE.md + UX/design docs |
| Phase 3 implementation | ✅ | CODEX_TASK.md ready |
| Agent constraints | ✅ | AGENTS.md |

## Deliberately not frozen

These should be adjusted from playtesting/data without changing architecture:

- exact long-term XP curve;
- final launch element count within roadmap range;
- final asset polish;
- exact audio files;
- later content recipes beyond the locked seed.

## Gate criteria satisfied

For the current implementation sequence:

- gameplay rules do not need to be invented;
- content seed is deterministic;
- save semantics are defined;
- hidden-content leakage rules are defined;
- responsive/accessibility requirements exist;
- tests/validators are specified;
- architecture boundaries are specified;
- PR scope is bounded.

## Next action

Run `CODEX_TASK.md` for Phase 3. Review the playable Laboratory PR before Phase 4.
