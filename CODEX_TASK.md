# CODEX_TASK.md — PLAYFEEL V3 (blocking feedback on PR #16)

## Current task

The player **tested PLAYFEEL V2 and rejected its game feel**.

Do not request another generic playtest of the unchanged V2 build. Instead, implement the specific corrections in **`docs/tasks/PLAYFEEL_V3.md`**.

### Direct feedback

> Il tavolo è ancora troppo meccanico. Una combinazione fallita riporta la figura nella sua posizione iniziale; la tavola è troppo piccola; la lista a destra è troppo ingombrante e richiede troppo scorrimento. Avvicinati molto di più alla fluidità di Little Alchemy 2.

### Required changes

1. Failed combos **must not snap figures back**. Both figures stay on table near drop site with gentle local separation if overlapping; canceled gestures are separate.
2. Remove 16–84% canvas positional clamp; table figures move freely across nearly all usable canvas.
3. Greatly enlarge visible desktop/table play surface and suppress oversized shell chrome while playing.
4. Rebuild desktop library as compact dense vertical icon+name list (not big 3-column cards), narrower and easier to search and scan.
5. Mobile: full-height-first canvas, compact collapsed quick-item dock; expand library as overlay/sheet **without shrinking or shifting the board**. Touch drag from library directly to target must work.
6. Make figures look like free-floating collectible images rather than big buttons; microfeedback for successful/failed merges must be non-blocking.
7. Keep immediate reusable known results, no XP on replay, new alternate discovery and revisitable anomalies, keyboard/touch accessibility and classic Lab regression.
8. Run specific post-drop coordinate, canvas-size and 30-step E2E tests, record failed-merge video and new screenshots at progressed save state.

### Sources and constraints

Read `AGENTS.md`, `docs/tasks/PLAYFEEL_V3.md`, prior `docs/tasks/PLAYFEEL_V2.md`, `docs/VISUAL_BIBLE_REFERENCE.md`, `docs/RESPONSIVE_AND_UI_STATES.md`, `docs/MOTION_AUDIO.md`, `docs/ACCESSIBILITY.md`, and current `src/ui/lab/FreeTable.tsx` / `playfeel.css`.

Use Little Alchemy 2 as an **interaction and information-density benchmark**, not as an art/branding asset source.

**Update existing draft PR #16** on `codex/playfeel-v2`, base `codex/ux-1`. Do **not** open a new PR, merge, modify #13–15, start Android or add new content.

Passing tests does not constitute playfeel approval; require another user playtest **after the corrections are implemented**.
