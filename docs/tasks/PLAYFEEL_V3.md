# PLAYFEEL V3 — freeform, Little-Alchemy-style usability

**Status:** user playtest feedback / blocking changes requested on existing draft PR #16. This spec supersedes PLAYFEEL V2's interaction and layout choices where they conflict. This is **not** approval of PR #16.

## Problem observed by player

> "Lo trovo ancora meccanico, soprattutto per il fatto che se non si unisce torna alla posizione iniziale. Poi c'è poco spazio per la tavola, e anche nella lista a destra si occupa troppo spazio e devo scrollare parecchio. Avvicinati molto di più a Little Alchemy 2."

The goal is a natural sandbox for exploring ideas, not a form-plus-inventory interface. Refer to Little Alchemy 2 for interaction principles and density, **not** for copying its proprietary graphics, brand or exact layout.

Documented benchmark: its official help describes double-tap to duplicate workspace items, and changelog describes smaller library/items to give more workspace on small screens and retaining search/library position.

## Immediate source-code problems to fix

Baseline PR #16, `codex/playfeel-v2`:

- In `src/ui/lab/FreeTable.tsx`, drag end explicitly resets the moving figure to `drag.origin` when `b` collision target exists, *before* knowing whether the recipe succeeds. This creates the reported snap-back after failed combinations.
- `clampTable` limits positions to **16–84%** on both axes, wasting outer areas of the canvas and preventing natural placement.
- `src/ui/lab/playfeel.css` sets the desktop right library to **20rem / 320px**, while `.library-grid` uses 3-column large cards. The sidebar and Lab chrome cut into the actual experimental workspace.
- Mobile library occupies 120–180px even docked and grows to 40dvh when expanded; it **shrinks the table** instead of acting as a useful overlay/drawer.
- The figure is a fairly large framed card, making the free table feel like movable buttons instead of small discoverable objects.

These are behavioral/structural issues. Styling tweaks alone will not close the review.

## Nonnegotiable gameplay behavior

### A. Failed combination does not undo the player's movement

When A is dragged onto B and the resolver returns `no_reaction` or the pair is already a known failed pair:

- A and B **remain on the table at their new locations**.
- Do not teleport A back to where the gesture started.
- Avoid stacking them perfectly, because that creates accidental next collisions / makes them impossible to grab separately. Resolve overlap with a **small nearby separation** relative to the actual drop point; use deterministic collision avoidance that fits inside the viewport/world and animates only a few pixels.
- Show a **minimal, in-place** failed-merge cue (tiny bounce, fade or ripple) with no blocking overlay/large banner.
- Dropping A in empty space always leaves A where released, not in a predefined slot.
- An intentional `pointercancel` may restore the last stable position; that is a canceled gesture, not a completed drop.
- If an async persistence/processing error occurs, keep both figures and their stable positions, show retry affordance, and do not fake a success.

The pair test does not consume figures when no element result exists; an observed anomaly should be handled with a differentiated in-place status but should not reset their layout.

### B. Successful combination

- Replace only the two **visual copies** participating in the collision with the result **at the drop point**.
- Known recipe replay spawns the result there with no XP, no save write and minimal motion; new alternate recipe persists as a genuine discovery and uses its existing rewards.
- Never lose unrelated figures from the table.
- Immediately allow dragging/duplicating the output, without modal, forced reset or waiting for an animation.
- A+A is possible by fast duplicate and collision.
- Re-evaluate eligibility with existing safe resolver/SaveApplication rules. Do not block revisitable anomalies or now-reactive formerly stale pairs.

### C. Free movement and usable surface

- **Remove the hard 16–84% positioning clamp.**
- Use a world/canvas coordinate model with only minimal edge insets needed to keep figures reachable by pointer/touch. Coordinates must not drift after resize, rotation or opening the library.
- No snap-to-grid, no magnetic recentering, no forced slot arrangement.
- Give objects a small readable footprint relative to the free table; icons/illustrations + names, not giant framed buttons.
- Allow multiple independent figure copies to coexist; avoid hiding older figures without an explicit visible control. If dense, offer a clean-up/arrange function, not silent disappearance.
- Add simple pan of empty canvas (mouse/touch) and unobtrusive zoom/reset only if necessary to make the available canvas genuinely navigable; do not let pan steal figure dragging or library scrolling.
- Keep local position/presentation state separate from durable PlayerSave and preserve game progression on mode switch.

## Layout acceptance — desktop

- Table visually occupies about **75–85% of the Lab's usable horizontal area**; compact element library on the side about 15–25%, target width ~220–260px at 1440 (adaptively, not fixed 320px). Global nav rail should be quieter/collapsible while playing if it takes noticeable space.
- Table starts directly under a compact header/topbar. No redundant title blocks and instructional prose.
- Library becomes a **dense, scrollable vertical list**, not a 3-column grid of tall cards. Each row shows small art/icon + name; optional very small status/favorite control on hover/selection.
- User can scan **at least 10–14 element names on 1440×900 without sidebar scrolling** when enough are unlocked; expose more at tall viewports.
- Persistent one-line search at top, alphabetical ordering, optional favorites/recent quick access; no multiple equal-weight filter bars. A single clear search result should be easy to drag directly onto a figure.
- Search preserves query/scroll position through combine; keyboard shortcut `/` and immediate focus.
- Existing new-possibility/exhausted markers remain optional, subtle and spoiler safe.

## Layout acceptance — mobile

- Free table should dominate the usable viewport, as close to full-screen as possible. On 390×844 aim for **>=70% of space remaining after top header/bottom navigation**, before opening library.
- Docked library is a **thin handle/strip of recent elements** plus obvious search/library entry, not a tall permanently open grid. A swipe/press opens a sheet/overlay **over** the table, instead of resizing/reflowing and shifting all objects.
- The player can search the library, drag/tap an element directly onto existing canvas objects and return to playing with minimal steps.
- One gesture drag should work from the library sheet to a table target (handle closing sheet during gesture without losing pointer/target position). Tap-to-add remains an accessible fallback.
- Do not make the player dismiss and reopen the library for every subsequent combination.
- On 320×568, visible canvas remains usable; opening software keyboard keeps search/selection and target objects reachable.
- Support landscape, safe area, OS text zoom and reduced motion; no document scroll is needed for ordinary play.

## Gesture and microinteraction priorities

- Click/tap library element: puts copy in an accessible free location on table (not necessarily canvas center for every element); drag-from-library: object follows pointer naturally.
- Double click/tap an existing canvas figure: duplicates with small offset. Provide an equivalent accessible context action; no accidental unwanted combine from double gesture.
- Dragging across figures shows a modest candidate cue; if no result, release leaves figures locally separated instead of snapping back. Success: compact merge effect and real output.
- Do not add a tall `Combina figure` CTA as main flow; retain explicit keyboard/tap fallback when two figures are selected.
- Keep user focus at the object; no bottom-of-canvas result log dominating the area. Reveal should be near the actual merge and not hide further input.

## Visual direction

- Keep Merge Discovery's approved **dark navy / thin gold / cosmic** art language.
- Use element artwork/icon as the primary physical object, name below or with it, light shadow/highlight only; remove oversized pill/card frames that make items resemble UI controls.
- Restrained orbital linework in the background is fine, but the canvas is for playing: the background should not overpower tiny elements or force placements in a central circle.
- Motion tier semantics remain; no heavy particle engine or third-party proprietary assets needed. Improve real reaction feedback, not decorative looping.

## Test matrix and evidence

### Mechanic tests (non-negotiable)

1. **Failed pair A+B:** both figures remain near drop location, not at old origin. Assert post-drop coordinates differ from pre-drag; neither is deleted. Anomaly likewise preserves both, not snap back.
2. Drag to empty location persists at drop, including near edges; moving a figure near any of four edges must not clamp to 16% or recenter.
3. Real successful recipe merges the two visual copies in situ; output can be dragged again immediately.
4. Replay already-known pair spawns result without XP/save mutation; alternative new recipe still awards canonical reward exactly once.
5. Pointer cancel behaves differently from completed unsuccessful drop.
6. Test collisions across touch, mouse, pen if available, keyboard/tap alternative, duplicate.
7. Table layout and positions stable on library open/close, resize and mobile rotate.
8. Library query/search position preserved and not reset after result.
9. No hidden recipe/Set leaks, resolver/save schema/PWA untouched.

### Layout and performance tests

- Desktop 1440×900 and 1024×768: screenshot showing broad table and dense right list of **at least 10 unlocked elements**, not just five starters.
- Mobile 390×844, 320×568, landscape: screenshots with library **closed**, **open as overlay**, and during a failed drop; measure canvas rect before/after opening library and show it does **not shrink**.
- Capture real Chromium screen recording of a failing pair staying in place, then retrying with another ingredient; include mobile touch clip with library sheet drag onto table.
- A fresh save (4 starters) plus a progressed save (30+ discovered) must be used. Do not demonstrate discoverability only with an all-67-owned fixture.
- 30-step automated input regression; a **human manual 10-minute game-feel playtest** remains the approval gate.
- Visual accessibility: focus, 44px touch targets where appropriate, accessible item selection independent of drag, reduced-motion, forced colors, 200% zoom, axe.
- Keep old unit/E2E/production/PWA tests green; report updated counts and any tradeoffs.

## PR instructions

Update the **existing PR #16** (`codex/playfeel-v2`, base `codex/ux-1`), not a new stacked PR. Keep #13–15 untouched, all draft and unmerged. Only implement table/library interaction and associated presentational changes; no Phase 8 canon or Android.

**Blocking acceptance:** The player should be able to create and reposition a dozen figures freely, attempt bad pairs without the game undoing her placement, see most of the canvas, and find the next element rapidly without fighting a large scrolling sidebar.

The target is **the effortless interaction pattern** of Little Alchemy 2, while preserving Merge Discovery's independent visual identity, rules and accessibility.
