# Motion, VFX & Audio Language

Status: **implementation-ready direction v1**

Motion communicates outcome hierarchy.

It must never be required to understand gameplay.

## Principles

- calm rather than hyperactive;
- tactile rather than casino-like;
- wonder increases with discovery importance;
- anomaly motion has its own visual grammar;
- the same event always belongs to the same intensity tier.

## Motion tiers

### Tier 0 — UI microinteraction

Examples:
hover, press, card select, slot fill.

Typical duration:
100–180 ms.

Reduced motion:
instant or short opacity change.

### Tier 1 — Known result

Inputs move/resolve quickly.

Typical duration:
250–450 ms.

No screen takeover.

### Tier 2 — Alternate recipe

Brief emphasis that the relationship is new even though result is known.

Typical duration:
450–700 ms.

### Tier 3 — New element

Inputs converge, result forms, art/name resolve.

Typical total:
900–1600 ms.

Player can continue quickly after key information appears.

### Tier 4 — Collection completion / normal Set reveal

Environment responds subtly.

Typical:
1.4–2.2 s.

### Tier 5 — Hidden Set / Era-defining discovery

Used sparingly.

Typical:
2–3 s, skippable/acceleratable after essential information is visible.

Examples:

- first Vita;
- hidden Funghi if treated strongly;
- first Magia;
- Creature fantastiche from resolved anomaly.

## Anomaly grammar

Unresolved anomaly:

- inputs approach;
- alignment destabilizes;
- geometric/particle pattern fails to close;
- result collapses into archive mark.

Avoid violent glitch aesthetics.

Preferred:
indigo/violet phase distortion, soft refraction, incomplete orbit/sigil.

Resolved anomaly:

reuse exact visual motif but let it close/stabilize.

This creates recognition and payoff.

## Set accents

Base Lab remains consistent.

Set-specific effects may influence:

- small particle motif;
- edge glow;
- reveal backdrop;
- icon treatment.

Never repaint every UI component per Set.

## Reduced motion mapping

When enabled:

- no large center-to-screen zoom;
- no parallax;
- no repeated floating particles;
- anomaly uses static refractive pattern;
- reveal uses crossfade + concise highlight;
- durations target <300 ms except intentionally user-paced text.

## Sound identity

### Selection

Soft tactile click/tap with low fatigue.

### Combine

Warm compact impact/merge sound.

### No reaction

Very soft neutral “settle” sound.

Never a harsh failure buzzer.

### New discovery

Short crystalline motif.

### Alternate recipe

Smaller variation of discovery motif.

### Set reveal

Lower, wider harmonic extension.

### Anomaly

Granular/phase shimmer with unresolved cadence.

### Anomaly resolved

Starts with same shimmer, resolves into stable harmonic interval.

### Arcano

Adds a restrained new timbre to existing motifs rather than replacing the sound world.

## Music

MVP does not require complex adaptive music.

Preferred later structure:

- low-intensity ambient Lab loop;
- subtle catalog/field-guide variation;
- anomaly layer;
- Arcano coloration.

Music must not mask UI feedback.

## Browser autoplay

No sound should attempt to play before user interaction.

If audio context is suspended, gameplay still behaves normally.

## Mix controls

Settings:

- master sound on/off;
- music on/off.

Separate detailed sliders are optional later.

## Asset strategy

All sound event IDs are stable logical keys.

Example:

- `ui_select`
- `combine_known`
- `discover_new`
- `set_reveal`
- `anomaly_unstable`
- `anomaly_resolve`

Code references keys, not file paths.

## Performance

Particles and blur effects must have low-cost fallbacks.

Do not require heavy WebGL for core UI.

Major visual effects can use DOM/CSS/canvas layers as appropriate, but the Lab must remain usable on ordinary Android hardware.

## Acceptance criteria

Every major domain event in the event model has:

- one intended visual tier;
- an audio key or explicit “no sound” decision;
- reduced-motion behavior;
- non-audio/non-motion semantic feedback.
