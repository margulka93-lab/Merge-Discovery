# Decisions Log

This file records decisions that should remain stable unless deliberately revised.

## D-001 — Discovery, not upgrade merge

The game uses combination as an input gesture, but is not based on merging identical objects into higher-level copies.

Status: **Accepted**

## D-002 — Web-first, mobile-first

The first implementation target will be the web with responsive touch-friendly UX. Android should later reuse the same core and UI architecture wherever practical.

Status: **Accepted**

## D-003 — Design before implementation

No substantive gameplay implementation should begin until the design gate is sufficiently complete.

Status: **Accepted**

## D-004 — Curated canonical recipes

Canonical recipes are authored. Runtime generative AI will not freely invent official results.

Status: **Accepted**

## D-005 — No stamina as a core gate

The player should not be prevented from experimenting by an energy/lives timer.

Status: **Accepted**

## D-006 — Hidden future domains

Some sets/domains are intentionally absent from the player-facing roadmap until discovered.

Status: **Accepted**

## D-007 — Locked-domain recipes become anomalies

When a valid combination leads into unavailable hidden content, the game can record an unresolved reaction instead of revealing or discarding it.

Status: **Accepted**

## D-008 — Multiple valid recipes per element

An element may be discoverable through more than one authored combination.

Status: **Accepted**

## D-009 — Scalable data-driven content

Elements, tags, sets and recipes must eventually live primarily as data rather than hard-coded UI logic.

Status: **Accepted**

## D-010 — Anti brute force

Large collections must be supported by clues and discovery aids. Completion must not require blindly trying the full pairwise combination matrix.

Status: **Accepted**

## D-011 — Rarity is not power

Rarity expresses unusualness, secrecy or discovery complexity.

Status: **Accepted**

## D-012 — The catalog is a primary system

The encyclopedia/collection and discovery graph are core gameplay surfaces, not secondary menus.

Status: **Accepted**


## D-013 — Discovered elements are infinitely reusable

Discovering an element permanently adds the concept to the player's available library. Experiments do not consume elements.

Status: **Accepted**

## D-014 — Base recipes are unordered

Two-input base recipes treat A+B and B+A as the same pair. Directional behavior, if introduced later, belongs to separate mechanics.

Status: **Accepted**

## D-015 — Same-element recipes are valid when authored

The system supports explicit A+A recipes such as Energia + Energia → Calore.

Status: **Accepted**

## D-016 — Progressive feature disclosure

Catalog, Set browser, anomaly archive and discovery graph appear when the player has enough context for them, rather than all being shown at launch.

Status: **Accepted**

## D-017 — Hidden content does not damage visible completion

Undiscovered secret elements are excluded from visible normal completion totals. Finding a secret later does not revoke an already earned completion badge.

Status: **Accepted**

## D-018 — Failed pairs are remembered

Attempted unordered pairs are stored so players are not expected to remember or manually track failed experiments.

Status: **Accepted**

## D-019 — Mondo is the current early world Set

For the early content architecture, geology, waters and atmospheric phenomena are grouped in one player-facing Set called Mondo. Smaller themes remain Tags/Collections unless later scale justifies promotion.

Status: **Accepted for current design; revisit after full content mapping**
