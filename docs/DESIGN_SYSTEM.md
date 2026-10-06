# Design System

Status: **implementation-ready visual system v1**

The visual direction is documented in `VISUAL_DIRECTION.md`.

This file translates it into reusable semantic tokens and component rules.

## Core palette

Tokens are semantic. Set accents supplement them but do not replace core contrast.

### Dark Lab shell

- `--color-bg: #0B1220`
- `--color-surface: #151F2E`
- `--color-surface-elevated: #1C293A`
- `--color-text: #F7F3EA`
- `--color-text-muted: #A9B4C6`
- `--color-border: #2B3A4D`
- `--color-accent-warm: #D9B66F`
- `--color-anomaly: #A891E8`

### Field-guide surfaces

- `--color-paper: #F3EBDD`
- `--color-paper-raised: #FFF9EE`
- `--color-ink: #26313A`
- `--color-ink-muted: #5E6871`

Primary text pairings above were chosen to comfortably support AA contrast.

Exact visual tuning may adjust hues while preserving semantic contrast.

## Set accent direction

Use accent as decoration/state support, never the sole information carrier.

Working tokens:

- Origini — warm ivory/gold
- Cosmo — cobalt/indigo
- Mondo — mineral teal
- Vita — fresh green
- Piante — moss
- Funghi — earthy plum
- Animali — warm ochre
- Umanità — terracotta
- Cultura — ink/parchment
- Tecnologia — steel/cyan
- Magia — violet/gold
- Spiriti — pale blue/opal
- Sogni — lavender
- Paradossi — iridescent geometry

Do not hard-code Set colors inside components.

Content/Set definitions reference design token names.

## Typography roles

### UI Sans

Use a highly readable modern sans.

Implementation starts with a robust system stack:

`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

A bundled brand font may replace the first face later without changing sizing tokens.

### Display/editorial

Optional for:

- Set names;
- major reveal headlines;
- catalog editorial moments.

Do not use ornate fantasy type for body copy.

## Type scale

Base target:
16 px browser default.

Semantic sizes:

- xs — 12
- sm — 14
- body — 16
- md — 18
- lg — 22
- xl — 28
- 2xl — 36
- hero — responsive 42–56

Use relative/rem units in implementation.

Do not rely on pixel-fixed text when accessibility text scaling is enabled.

## Spacing

Base rhythm:
4 px.

Tokens:

- 1 — 4
- 2 — 8
- 3 — 12
- 4 — 16
- 6 — 24
- 8 — 32
- 12 — 48
- 16 — 64

Avoid arbitrary one-off margins where a token works.

## Radius

- small control: 10
- card: 16
- elevated panel: 20
- major reveal/art frame: 24
- pill: 999

## Shadows

Dark Lab:
soft depth, low-opacity, no glossy mobile-game shadow stacks.

Field guide:
very light paper elevation.

Important states use outline/glow sparingly rather than huge shadows.

## Element card

Required anatomy:

1. art area;
2. readable name;
3. subtle Set identity;
4. contextual state area.

No combat stats.

### Sizes

Mobile compact card:
minimum practical width around 88–104 px depending viewport.

Desktop:
approximately 112–140 px.

Do not lock exact width; grid determines it.

### States

- default
- hover/focus
- selected
- favorite
- new
- currently exhausted
- new possibilities
- tested success relative to Slot A
- tested no-reaction relative to Slot A
- anomaly relation

Only context-relevant state markers are visible at once.

## Element slots

Large touch/click target.

States:

- empty
- filled
- focused
- invalid/unavailable
- reacting

Slot border/state must not communicate only through color.

## Buttons

Primary:
Combine.

Secondary:
Continue / View card / Use result.

Destructive:
Reset save/import overwrite confirmation only.

No fake primary buttons for marketing-like actions.

## Navigation

Desktop rail conceptual width:
240 px, adaptable 220–260.

Right Lab library:
360 px target, adaptable 320–400.

Mobile bottom navigation:
safe-area aware, max five destinations.

## Iconography

Style:

- simple line/filled hybrid;
- rounded, intelligent rather than childish;
- consistent stroke weight.

Every icon-only button needs accessible label.

## Illustration frames

Art must support:

- tiny icon crop;
- card crop;
- hero crop.

Use CSS object positioning/art metadata rather than separate hand-authored layout code per element.

## Anomaly visual treatment

Semantic pieces:

- anomaly icon;
- label/status;
- violet/indigo distortion;
- incomplete geometry.

Never use only purple color to indicate anomaly.

## Progress

Set progress:
bar or ring plus visible text/count.

Do not expose hidden denominator.

## Skeleton/loading

Use subdued surface blocks.

Do not animate aggressively.

Respect reduced motion.

## Toasts / notices

Use for:

- save state warning;
- compact feature unlock;
- background update ready.

Do not use toast as sole carrier of a new discovery; discovery is persistent content.

## Z-index layers

Define semantic layers rather than random numbers:

1. base
2. sticky
3. dropdown
4. sheet
5. dialog
6. reveal
7. critical recovery

## Theming

v1 has one main theme with contextual surfaces.

Do not build separate light/dark theme product variants unless later requested.

Catalog paper surfaces are part of the same art direction, not “light mode”.

## Asset placeholders

Codex may use neutral placeholder illustrations during initial implementation.

Placeholder assets must preserve expected aspect ratios and art keys.

Codex must not generate or lock final production art without design review.
