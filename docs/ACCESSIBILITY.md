# Accessibility Specification

Status: **implementation-ready product requirement v1**

Target: **WCAG 2.2 AA** for the web product where applicable.

Accessibility is part of the core interaction design, not a post-launch patch.

## Interaction

All gameplay actions must work without drag-and-drop.

Required input paths:

- pointer/touch;
- keyboard;
- assistive technology activation.

### Keyboard baseline

- Tab/Shift+Tab reaches all interactive controls in logical order.
- Enter/Space activates buttons/cards.
- Element library supports keyboard selection.
- Selected element can fill Slot A/Slot B without dragging.
- Escape closes dismissible overlays/sheets.
- Focus returns to the invoking control after modal/sheet close.

Do not require complex custom shortcuts for core play.

Optional shortcuts may be additive.

## Focus

Use clearly visible focus indicators against every surface.

Never remove browser focus outline without replacing it with an equal or stronger indicator.

After a discovery reveal:

- focus should not jump unpredictably;
- major modal-like reveal may take focus only if it actually blocks interaction;
- dismiss returns focus to a logical next action such as `Continua`.

## Touch targets

Interactive targets should aim for at least **44×44 CSS px** on touch layouts.

Compact desktop controls may be visually smaller only when their hit target remains usable.

## Color

No gameplay state may rely on color alone.

Examples:

- tested failure = icon/pattern + color;
- anomaly = symbol/label + violet treatment;
- rarity = text/icon + accent;
- completion = numeric/text status + progress graphic.

High-contrast mode must strengthen foreground/background separation without destroying Set identity.

## Text

Support browser zoom and text scaling.

Target:

- core flows remain usable at 200% browser zoom on desktop;
- mobile large/extra-large text settings do not hide Combine or navigation actions;
- no important copy baked into images.

Body copy should remain concise.

## Screen readers

Semantic landmarks:

- navigation;
- main;
- search;
- complementary panels where appropriate.

Element cards expose:

- name;
- Set;
- relevant current state;
- button semantics.

Example accessible label in selected-input mode:

> Acqua, elemento del set Mondo, non ancora provato con Terra.

Do not announce unrevealed recipe validity.

## Reaction announcements

Use an ARIA live region for concise nonvisual outcomes.

Examples:

- “Nuova scoperta: Acqua.”
- “Nessuna reazione.”
- “Reazione instabile registrata.”
- “Nuovo set scoperto: Cosmo.”

Do not repeatedly narrate decorative animation.

Major reveal copy remains available as normal readable content after the live announcement.

## Discovery graph

The visual graph cannot be the only representation.

Provide an accessible list/tree-like relationship view for the selected element:

- created from;
- known alternate recipes;
- produces;
- anomalies.

Keyboard users must be able to explore relationships without pan/zoom.

## Motion sensitivity

Global Reduced Motion setting plus `prefers-reduced-motion`.

When active:

- remove parallax;
- replace large translations/zooms with opacity/scale changes;
- reduce particle motion;
- anomaly distortion becomes static/low-motion texture;
- no flashing effects.

Gameplay timing must not depend on watching an animation.

## Flashing

Avoid content flashing more than accessibility thresholds.

No strobing anomaly effects.

## Audio

Every audio cue has a visual/state equivalent.

Game is fully playable muted.

Volume/mute controls are reachable before repeated sound becomes necessary.

## Information modes

`Mystery / Balanced / Collector` are information preferences, not accessibility barriers.

Strong hints/accessibility support must never disable achievements or brand the save as “assisted”.

## Error messages

Errors explain recovery in plain language.

Bad:

> ERR_SAVE_4

Good:

> Non siamo riusciti a salvare l’ultima modifica. Riprova oppure esporta una copia del progresso.

Developer diagnostics may exist separately.

## Forms / import

Save import, settings and future account forms require:

- labels;
- validation association;
- summary of errors;
- no placeholder-only labels.

## Responsive accessibility

Minimum supported width: **320 CSS px**.

At large text:

- Lab may switch from side-by-side slots to stacked slots;
- card columns may reduce;
- navigation labels may remain available to assistive tech even when icons are visually used.

## Testing requirement

Before a release is considered accessible enough for public testing:

- keyboard-only smoke test of full seed flow;
- screen-reader smoke test of Lab, Catalog, Element Detail and Anomalies;
- automated axe-like scan;
- 200% zoom check;
- reduced-motion check;
- high-contrast check.

Accessibility regressions are release blockers when they block core discovery.
