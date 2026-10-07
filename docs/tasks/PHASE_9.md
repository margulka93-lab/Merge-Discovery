# Phase 9 — Android packaging (Capacitor)

Status: **implementation may be drafted; native release requires environment/device verification**

## Required reading
`AGENTS.md`, `CODEX_LONG_RUN.md`, `docs/TECH_SPEC.md`, `docs/RESPONSIVE_AND_UI_STATES.md`, `docs/SAVE_AND_VERSIONING.md`, `docs/ACCESSIBILITY.md`, `docs/PHASE_7_NOTES.md`, updated Phase 7.5 visual notes and Phase 8 content/version notes.

## Goal
Package the same playable React/Vite local-first web game for Android using Capacitor. Do not create a separate gameplay fork.

## Required
- Add compatible pinned Capacitor packages/config and Android project scaffold, with documented Node/Java/Gradle/Android SDK requirements.
- Bundle generated web assets into the native WebView; no backend dependency.
- Keep Domain, resolver, safe content projections and UI common to web/mobile.
- Define safe boot/asset loading scheme and verify service-worker registration/update is **web/PWA only** where native app resources do not support it. Native app update comes from Android distribution, not synthetic SW updates.
- Verify IndexedDB persistence on Android WebView and behavior after app background/resume/restart; do not substitute volatile memory.
- Implement appropriate Android system Back handling (modals/sheets first, then route/back-stack; confirm app exit as appropriate). Preserve active experiment/reveal.
- Verify safe areas, status/navigation bars, orientation, soft keyboard, network-off boot/combine and touch target/responsive behavior.
- Provide export/import JSON from Android with a documented working path (share sheet/Saf/document picker or equivalent). Never claim normal browser download works without testing native WebView. Preserve validation, backup and recovery.
- Add app name/id/package placeholder not tied to the user's personal identifier, icons/splash from current owned placeholder assets; document identifiers subject to final approval.
- No ads, analytics, account, notifications, IAP or permission creep.
- Keep testable platform adapters behind interfaces and add focused tests.

## Validation
- Web unit/component/E2E/production/PWA suites remain green.
- Android build compiles if SDK/toolchain exists; run `npx cap sync android` and Gradle debug assemble when possible.
- Run emulator/device smoke for startup/offline/save/import/export/Back/zoom/accessibility if environment supports it.
- State exact evidence level: scaffold only / assembleDebug succeeded / emulator tested / physical device tested.
- Never claim signed distribution APK/AAB or Play Store readiness without real signing, device testing and user authorization.
- Document prerequisites/toolchain setup and reproducible commands.

## Deliverable
Separate **draft** PR, stacked on reviewed content branch only if required. Report native build limits and manual-device checklist. Keep it ready for clean rebase onto `main` as prior PRs merge.
