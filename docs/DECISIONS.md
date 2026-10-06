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
