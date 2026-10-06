# Copy, Naming & Localization

Status: **implementation-ready content rule v1**

Primary launch language for design/content: **Italian**.

Internal IDs remain English snake_case and never appear in player-facing copy.

## Voice

The game voice is:

- concise;
- curious;
- intelligent;
- warm;
- occasionally poetic;
- never childish;
- never corporate;
- never overexplaining.

## Element names

Prefer the clearest common Italian name.

Examples:

- Acqua
- Stella
- Muschio
- Micelio

Avoid ornate synonyms merely to sound fantasy-like.

Fantasy content can become more evocative once the concept itself warrants it.

## Descriptions

Target:
one or two short sentences.

A description may:

- explain the association;
- provide a curious fact;
- create atmosphere.

It should not pretend a symbolic recipe is literal science.

Example tone:

> L’acqua trova sempre un modo di muoversi. Sul pianeta giusto può diventare oceano, pioggia, palude o vita.

## Recipe copy

Recipes use display names and plus/arrow visually.

Do not write long explanatory equations in normal UI.

## Failure

Preferred:

> Nessuna reazione.

Avoid:

- “Errore”
- “Combinazione sbagliata”
- mocking copy.

Experimentation is not failure.

## Anomaly

Preferred early phrase:

> Qualcosa ha reagito, ma non riesci ancora a stabilizzarlo.

The archive can later use:

- Reazione instabile
- Qualcosa è cambiato
- Può essere riesaminata
- Risolta

Never name hidden result before discovery.

## Hints

Hint language points toward relationships.

Weak:
> Prova Acqua + Calore.

Preferred lower tier:
> L’Acqua sembra avere ancora qualcosa da fare con il calore.

Strong tier may become explicit only when requested.

## Celebration copy

Keep short.

- Nuova scoperta
- Nuovo set
- Nuova possibilità
- Ricetta alternativa
- Anomalia risolta

Major Era reveal may add one thematic sentence.

## Capitalization

Italian sentence case by default.

Element and Set names capitalized as proper interface labels.

Avoid ALL CAPS except very brief dramatic reveal treatment in art/animation; semantic text remains normally cased.

## Localization keys

Canonical data references keys.

Suggested namespaces:

- `element.<id>.name`
- `element.<id>.description`
- `set.<id>.name`
- `set.<id>.description`
- `collection.<id>.name`
- `ui.lab.combine`
- `outcome.no_reaction`
- `anomaly.<id>.message`

## Interpolation

Do not concatenate translated fragments when grammar differs.

Use full-message localization strings with named variables.

## Pluralization

Use i18n plural rules.

Do not hard-code Italian plural assumptions into domain code.

## Hidden-content safety

Localization bundles may technically contain future strings, but UI/search/index code must never expose them before visibility rules permit.

If public data extraction becomes a concern later, hidden content can be split into gated packages, but gameplay secrecy should not depend on security through obscurity for MVP.

## Accessibility copy

Accessible names must communicate current state without leaking answers.

Example:

> Luna, elemento di Cosmo, già provato con Vita: reazione instabile.

Not:

> Luna, combina con Vita per ottenere Licantropo.

## Terminology lock

Preferred player-facing terms:

- Scoperta
- Set
- Collezione
- Laboratorio
- Anomalia
- Mappa delle scoperte
- Livello di Scoperta
- Intuizione — provisional hint resource/name, only if resource survives playtest

Avoid using `merge` as the primary in-game verb if Italian copy feels mechanical.

Preferred action:
**Combina**.
