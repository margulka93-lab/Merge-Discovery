# CODEX_TASK.md — Extended execution queue

## Current instruction

Read **`CODEX_LONG_RUN.md`** and execute its ordered stages with stage-specific scopes and separate reviewable PRs.

1. Phase 7.5B — dark Collection/Set/Element/Collections screens: `docs/tasks/PHASE_7_5_B.md`
2. Phase 7.5C — Map/Anomalies/Settings and visual cohesion: `docs/tasks/PHASE_7_5_C.md`
3. Phase 8A — Life/Animals: `docs/tasks/PHASE_8_A.md`
4. Phase 8B — Humanity/Culture/Technology: `docs/tasks/PHASE_8_B.md`
5. Phase 8C — first Arcano bridge/payoff: `docs/tasks/PHASE_8_C.md`
6. Phase 9 — Android/Capacitor: `docs/tasks/PHASE_9.md`

## Starting state

- Phases 0–7 are merged into `main`.
- PR #9 / branch `codex/phase-7-5a` is open. Treat it as **visually unapproved** and do not merge it.
- Begin Phase 7.5B from the latest PR #9 branch head.
- Queue/task files live on current `main`; bring those specifications to the work branch before implementation.
- The **original Merge Discovery Design Bible image attached to the Codex invocation** must be visually inspected before redesign. If available, commit a copy under `docs/references/`.
- Do not replace the predominantly dark navy/gold in-game aesthetic with light/ivory catalog screens.

## Autonomy and gates

Work through successive **draft stacked PRs** as far as possible during the session. Never merge unapproved PRs automatically.

Green CI is not visual approval of 7.5A/B/C. New recipes and Arcano choices from Phase 8 are **proposals until canon review**. Phase 9 may be scaffolded and debug-built but is not Play Store authorization.

Do not claim unattended/background operation beyond the current Codex execution session.

## Non-negotiables

Read `AGENTS.md`; preserve gameplay/save/visibility/PWA semantics; no spoiler leaks; no unreviewed rewrite of the 67-element seed; tests, validator, reachability and appropriate production/browser checks per stage.

Read `CODEX_LONG_RUN.md` fully before starting any stage. The older combined Phase 7.5 brief is archived in `docs/tasks/PHASE_7_5.md`.
