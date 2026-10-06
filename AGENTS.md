# AGENTS.md — Merge Discovery

This repository is specification-led.

## Before changing code

Read, as applicable:

- `docs/GAME_VISION.md`
- `docs/DECISIONS.md`
- `docs/DATA_MODEL.md`
- `docs/RESOLUTION_ENGINE.md`
- `docs/TECH_SPEC.md`
- `docs/VALIDATION_AND_TESTING.md`
- `docs/IMPLEMENTATION_SEED_CONTENT.md`
- relevant UX/visual docs.

## Non-negotiable product rules

- This is discovery combination, not upgrade merge.
- Elements are infinitely reusable.
- Base pair order is irrelevant.
- A+A works only when authored.
- Canonical recipes are data-driven and curated.
- Repeat recipes do not farm XP.
- Hidden/secret content must not leak through counts/search/graph/hints.
- Failed pairs are remembered.
- No stamina/wait timers.
- Tap/click is sufficient; drag is never required.
- Domain engine is pure and platform independent.
- No backend is required for v1.
- Accessibility is a core requirement.

## Scope discipline

Do not extend a task beyond its requested phase.

Do not refactor unrelated files for convenience.

Do not add gameplay mechanics not specified in docs.

Do not replace provisional content with “better ideas” without design approval.

## Architecture

Respect layer direction in `docs/TECH_SPEC.md`.

Gameplay rules do not belong in React components.

Persistence does not belong in domain code.

Canonical content does not belong hard-coded in UI.

## Content changes

Any new/changed content must pass:

- schema validation;
- referential integrity;
- ambiguity checks;
- reachability where applicable;
- hidden-content safety.

Do not silently alter canonical seed recipes.

## Tests

A change is incomplete if required tests fail or relevant behavior is untested.

Prefer pure unit tests for domain logic and focused UI tests for interaction.

## UI

Follow:

- `docs/SCREEN_SPECS.md`
- `docs/RESPONSIVE_AND_UI_STATES.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/ACCESSIBILITY.md`
- `docs/MOTION_AUDIO.md`

Use placeholder assets rather than inventing final art.

## Ambiguity

If two design documents appear to conflict:

1. check `docs/DECISIONS.md`;
2. prefer newer implementation-ready specifications over historical drafts;
3. report unresolved conflict instead of guessing.

## Delivery

Every PR should state:

- exact scope;
- design docs used;
- tests/validators run;
- screenshots for UI;
- remaining non-scope follow-ups.
