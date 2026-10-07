# Visual & UX Alignment — Phase 7.5

Status: **canonical redesign brief before content expansion**

Phase 0–7 proved the systems, data model, progressive disclosure, offline product behavior and accessibility.

They did **not** freeze the current screen composition as final design.

The current UI is implementation-complete but still too often reads as:

- a functional web dashboard;
- collections of equal-weight cards;
- technical panels stacked because the data exists;
- separate feature pages that do not yet feel like one illustrated discovery product.

Phase 7.5 is allowed to redesign layout and presentation aggressively while preserving gameplay semantics and safe projections.

## North star

The product should feel like:

**a modern magical observatory that opens into an illustrated field guide as the player understands the world.**

Not:

- a SaaS dashboard;
- an admin console;
- a generic card-grid app;
- a mobile F2P game;
- a medieval alchemist room.

The visual bible remains canonical:

- midnight observatory shell;
- warm amber/gold discovery focus;
- painterly/symbolic element imagery;
- celestial/orbital linework;
- ivory field-guide reading surfaces;
- violet anomaly language;
- calm premium spacing;
- editorial hierarchy.

## Product-level visual transition

### Laboratory / Explore

Stay predominantly dark.

They represent experimentation, uncertainty and relationships.

### Collection / Sets / Element detail

Use the field-guide language much more strongly.

They represent knowledge the player has already made legible.

The ivory surfaces should therefore feel like pages/plates inside the same observatory shell, not like white dashboard cards.

## Navigation architecture

Keep routes and feature disclosure rules.

Visually reorganize them into coherent families.

### Knowledge family

Create a shared Catalog/Field Guide shell for:

- /collection
- /sets
- /collections

Use tabs or segmented secondary navigation:

- Panoramica
- Set
- Collezioni

Only expose tabs whose feature is currently available.

Direct routes remain stable.

### Explore family

Map and Anomalies should feel like related discovery-analysis tools.

Mobile keeps the existing Esplora grouping.

Desktop may keep separate nav destinations, but both should use one visual family and share a clear Explore context.

## Desktop shell

The left rail should become quieter and more atmospheric.

Avoid large SaaS-style nav blocks.

Preferred:

- compact wordmark/symbol;
- discovery level/progress integrated near brand;
- icon + label navigation;
- warm accent for active destination;
- less boxed chrome;
- contextual progress/objective near bottom only when useful.

The shell should leave visual authority to the current page.

## Mobile shell

Bottom navigation remains maximum five destinations.

It should:

- feel integrated with the midnight shell;
- respect safe areas;
- not occupy excessive vertical space;
- use icon + text or strong accessible labels;
- preserve Lab/Collection/Explore distinction.

## Laboratory redesign target

The Lab is the emotional center of the game.

### Desktop

The experiment itself must dominate.

Preferred hierarchy:

1. atmospheric experiment stage;
2. two substantial element slots/cards;
3. explicit Combine;
4. reaction/result surface;
5. library.

The right library is supporting material, not equal visual weight with the experiment.

Reduce panel-on-panel feeling.

Use:

- orbital/sigil lines;
- soft depth;
- warm active focus;
- element art larger than labels;
- minimal metadata.

A selected pair should feel like objects placed into an observatory instrument, not form inputs.

### Element library

Cards should be compact, collectible and visual.

Avoid repeating full metadata on every card.

Default card priority:

1. art;
2. name;
3. one small state cue when necessary.

Set/status markers should not turn every card into a mini dashboard.

## Collection Home redesign target

This screen currently has the highest risk of feeling managerial.

It must become the **field-guide landing page**.

It should answer the same gameplay questions while looking editorial.

### Desktop hierarchy

Recommended:

#### Hero / latest knowledge

A visually strong “Ultime scoperte” strip or plate.

Use 3–5 larger recent discovery tiles, not a dense KPI section.

#### Active domains / Sets

Make Sets the main body of the page.

Set cards should feel like illustrated domain plates:

- atmospheric art/motif;
- Set name;
- concise progress;
- one safe state such as “nuove possibilità” when relevant.

Avoid progress bars repeated everywhere if a ring/fraction/quiet meter works better.

#### Thematic Collections

Secondary, more object-like/bookmark treatment.

They are curated goals, not another identical card grid.

#### Favorites

Compact shelf/strip, not another hero section.

#### New possibilities

Treat as a contextual prompt/shelf, not an analytics widget.

No global dashboard metrics beyond the discovery count already allowed.

### Mobile

Use one flowing editorial page.

Recommended order:

- recent discoveries;
- domains/Sets;
- new possibilities;
- thematic Collections;
- favorites.

Allow horizontal shelves where it helps density.

Do not force every section into stacked full-width bordered boxes.

## Sets index redesign target

The Set index should feel like choosing a chapter/domain of the field guide.

Use larger illustrated cards/plates than ordinary elements.

Revealed Set card should communicate:

- identity first;
- progress second;
- completion/new-possibility state third.

Announced locked Sets remain restrained.

Hidden Sets leave no visual gap.

## Set detail redesign target

Treat each Set as a **chapter opening**.

### Header

Large domain plate with:

- Set name;
- thematic line;
- restrained completion;
- accent motif.

Then transition into an ivory discovery field/grid.

### Element grid

Use calm field-guide spacing.

Discovered cards should feel like specimens/entries, not buttons in an admin grid.

Controls/search/filter should be present but visually secondary.

## Element detail redesign target

This is the **illustrated field-guide page**.

### Desktop

Prefer an editorial two-column composition.

Left / hero:

- large element illustration;
- name;
- Set;
- rarity;
- favorite.

Right / reading area:

- one concise description;
- first discovery;
- known recipes;
- possibilities;
- relationships.

Experiments/history can sit lower as a secondary section.

Avoid displaying every section as a separate equal card.

Use typography, whitespace and subtle rules to create hierarchy.

### Mobile

Single reading column.

Hero art remains strong.

Sections flow naturally without a stack of boxed panels.

## Recipe presentation

Known recipes should read visually as relationships:

Element A + Element B → Result

Use element tokens/art where useful.

Avoid database-table aesthetics.

Alternate routes can be visually grouped.

Unknown recipes remain protected by current spoiler rules.

## Collections detail redesign target

Thematic Collections should feel curated and slightly more playful than Sets.

Use:

- title/description;
- progress;
- discovered member specimens;
- anonymous missing positions only when canonically allowed.

Do not make it look like a Set page with different text.

## Anomaly Archive redesign target

Keep dark glass and violet.

Entries should feel like recorded unstable phenomena:

- paired input imagery;
- incomplete orbit/sigil;
- status;
- date/context;
- retry action.

Avoid list rows that resemble settings/history logs.

## Discovery Map redesign target

Keep current safe local graph logic.

Improve composition only:

- stronger constellation field;
- clearer central focus node;
- lighter peripheral nodes;
- recipe junctions visually readable;
- inspector as part of the observatory rather than a generic panel.

Do not change the graph knowledge boundary.

## Settings redesign target

Settings may remain the most utilitarian screen.

Still:

- use grouped sections;
- avoid diagnostic-feeling chrome for ordinary preferences;
- keep save/import recovery clearly separated as advanced/local-data tools.

## Shared component language

Audit/rework:

- ElementCard
- SetCard
- CollectionCard
- ElementToken
- progress indicators
- chips/status labels
- buttons
- filter controls
- search
- inline notices
- page headers
- section headers
- paper/field-guide surfaces
- dark glass surfaces

The same concept should not be represented by three unrelated visual patterns across screens.

## Typography

Use an editorial display face **from local/system fonts only** unless a font is already project-owned and bundled.

No remote font dependency.

Suggested system approach:

- display/brand/major field-guide headings: serif/editorial stack;
- UI/body: current readable sans-serif stack.

Keep accessibility and Italian diacritics correct.

## Density

### Desktop

Atmospheric, but not empty.

Use larger hierarchy changes rather than huge unused space.

### Mobile

Readable without tiny cards.

3 element cards/row only where names remain legible.

At 320 px or large text, 2 columns is acceptable and preferred over cramped 3-column cards.

## Art placeholders

Final production art is still deferred.

Phase 7.5 may improve the placeholder system substantially:

- more illustrative SVG composition;
- stronger per-Set motifs;
- better background plates;
- better silhouettes;
- consistent art framing.

But it must preserve the stable `artKey` contract.

Do not hand-author 67 bespoke final illustrations in this phase.

## Motion

Keep Phase 7 semantic tiers.

Visual redesign may change how tiers look, not their gameplay timing or acknowledgement semantics.

Reduced-motion variants remain mandatory.

## What may change

Allowed:

- JSX composition;
- page hierarchy;
- shared shells;
- navigation presentation;
- CSS architecture;
- visual components;
- responsive composition;
- placeholder SVG treatment;
- copy hierarchy/labels where semantics remain unchanged;
- grouping of existing routes into shared visual shells.

## What may NOT change

Do not change:

- recipes;
- elements;
- Sets;
- Collections;
- visibility;
- XP;
- unlock rules;
- resolver behavior;
- save schema;
- completion rules;
- hint information boundary;
- route availability rules;
- PWA/cache/update semantics;
- current accessibility guarantees.

## Visual acceptance rule

Passing tests is necessary but not sufficient.

Phase 7.5 is not considered complete until the screenshots visually demonstrate the concept.

The PR must therefore be reviewed visually before merge.

A screen that is technically correct but still reads as a generic dashboard is a failed Phase 7.5 outcome.

## No Figma dependency

The repository specifications and Visual Bible are sufficient.

Do not make Figma, remote design tools or paid design software a prerequisite.
