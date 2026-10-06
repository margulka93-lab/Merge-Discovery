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


## D-020 — Collections do not gate the main path

Collections are optional thematic goals. Their rewards may support discovery but cannot contain mandatory progression gates.

Status: **Accepted**

## D-021 — Set completion survives later secret discoveries

A completed normal Set remains completed when optional secret content is discovered later. Secrets become bonus completion rather than retroactively reducing earned progress.

Status: **Accepted**

## D-022 — Arcano should pay off old anomalies

The first major supernatural transition should reactivate previously archived intuitive anomalies and old elements instead of behaving as an isolated new content island.

Status: **Accepted**

## D-023 — Level makes Arcano eligible; discovery reveals it

The supernatural transition should not occur through a level-up notification alone. A meaningful player-performed discovery reveals the first Arcano Set.

Status: **Accepted**


## D-024 — Humanity is the bridge from nature to ideas

The Humanity Era should introduce intentional creation, social organization and symbolic concepts that later enable myths and Arcano.

Status: **Accepted**

## D-025 — Professions are not a primary Set

Most professions belong to Collections or optional content. Profession elements are authored only when they remain useful as ingredients.

Status: **Accepted**

## D-026 — Technology is selective, not encyclopedic

Technology progression uses a compact set of reusable conceptual milestones rather than reproducing every historical invention.

Status: **Accepted**

## D-027 — No combat-tech dependency

Weapons and warfare are not required for the core progression path. Technology should not become a combat tree.

Status: **Accepted**

## D-028 — Tap-select is the baseline combine interaction

Drag-and-drop may be supported, but all core laboratory actions must be fully usable through taps/clicks.

Status: **Accepted**

## D-029 — Explicit Combine action

After selecting two inputs, the player confirms with a Combine action rather than triggering automatically on second selection.

Status: **Accepted**

## D-030 — One responsive information architecture

Desktop and mobile share the same game model and navigation. Layout adapts, but features are not designed as separate games.

Status: **Accepted**

## D-031 — Visual direction uses a hybrid system

The current art direction combines a dark modern observatory/laboratory shell, brighter illustrated field-guide catalog surfaces, and restrained magical/cosmic effects for major discoveries.

Status: **Accepted for concept phase**
