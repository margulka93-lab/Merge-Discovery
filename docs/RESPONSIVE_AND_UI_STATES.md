# Responsive Layout & UI State Specification

Status: **implementation-ready UX requirement v1**

The product uses one responsive information architecture.

## Supported range

Minimum: 320 CSS px wide.

No fixed maximum.

The central content receives a readable max-width where appropriate while atmospheric backgrounds may fill viewport.

## Breakpoints

These are implementation defaults and may move slightly after real-device testing.

### Mobile — 0–767 px

- bottom navigation;
- single primary column;
- Lab library below reaction stage;
- 2–3 element cards per row depending width/text scale;
- modal content prefers full-screen sheet/bottom sheet.

### Compact — 768–1023 px

- persistent/collapsible side navigation;
- central Lab workspace;
- element library as drawer or lower/side panel depending aspect ratio;
- 3–4 card columns.

### Desktop — 1024–1439 px

- persistent left rail;
- center experiment stage;
- persistent right library;
- 4–5 catalog cards depending container.

### Wide — 1440 px+

- same three-zone hierarchy;
- increased whitespace and library density;
- do not enlarge controls indefinitely;
- optional right detail preview in collection views.

## Height constraints

Design for short desktop/laptop viewports such as 768 px tall.

Combine action and both slots must remain above or easily reachable without scrolling the entire page.

Library can scroll independently on desktop.

## Mobile Lab layout

Order:

1. status header;
2. experiment slots;
3. Combine action;
4. result/reaction surface;
5. favorites/search;
6. element library;
7. bottom nav.

At <=360 px or large text:
slots stack vertically.

At wider phones:
slots may sit side by side if labels remain readable.

## Desktop Lab scroll model

App shell uses viewport height.

- left nav: fixed/persistent;
- center: main content, limited scrolling;
- right library: independent scroll.

Avoid page scroll fighting library scroll.

## Catalog

Mobile:
- one page scroll;
- 2–3 card columns;
- filter opens sheet.

Desktop:
- search/filter header sticky inside content;
- 4–6 columns;
- optional inspector pane.

Virtualization becomes mandatory when measured rendering shows need; architecture must allow it.

## Element detail

Mobile:
dedicated route/page, not a tiny modal.

Desktop:
can render in route with two columns or inspector panel.

URL/state should remain shareable/bookmarkable for discovered content without exposing hidden content.

## Graph

Mobile:
local neighborhood only by default.

Desktop:
larger graph canvas.

At any breakpoint:
accessible textual relationship list exists.

## Sheets and modals

Use:

- bottom sheet on mobile for quick filter/hint actions;
- centered dialog for destructive confirmations;
- full route for deep content.

Do not put long Element Detail or graph inside a tiny dialog.

## UI states every primary screen must specify

### Loading

Local-first data should load quickly, but initial boot still needs a quiet skeleton/brand state.

Never show a fake spinner for normal combine resolution.

### Empty

Examples:

- no favorites;
- no anomalies yet — archive is not navigable before first anomaly;
- no search results.

Empty state should explain next action without filler illustration overload.

### Error

Examples:

- save failure;
- content validation failure in development;
- corrupted import.

Errors must preserve recoverable player state.

### Offline

Normal local gameplay does not need an offline warning.

Show connectivity state only when the user invokes a feature that actually needs network.

### Updating

When a new cached web version is available, avoid refreshing during a combine/reveal.

Offer non-destructive update at a safe point.

## Navigation behavior

Mobile bottom nav target maximum:
5 visible destinations.

Before feature unlock, do not show dead disabled nav icons.

After Anomalies/Map both exist, organize without exceeding five items, e.g.:

- Lab
- Collection
- Sets
- Explore (Map + Anomalies)
- Settings

Desktop may show them separately.

## Deep links

Known/discovered element routes may use stable IDs.

If a user opens a route to content their save has not discovered:

- do not reveal it;
- redirect to Catalog or show “Non ancora scoperto” without metadata.

## Android safe areas

Respect CSS environment safe-area insets for:

- bottom navigation;
- top controls;
- sheets.

Do not place critical touch controls behind gesture/navigation areas.

## Orientation

Portrait is primary on phone.

Landscape:
- must remain functional;
- may adopt compact/tablet arrangement;
- no separate content features.

## Visual viewport / mobile keyboard

Search fields and future forms must not be obscured by soft keyboard.

Sheets should respond to visual viewport height where supported.

## State preservation

Changing breakpoint/orientation must preserve:

- selected Slot A/B;
- current search query;
- current filter;
- focused/selected catalog element when possible;
- unsaved settings changes.

Do not reset the experiment just because layout changes.
