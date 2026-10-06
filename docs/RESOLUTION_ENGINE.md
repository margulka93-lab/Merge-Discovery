# Resolution Engine Specification

Status: **implementation-ready design specification v1**

The resolver is a pure deterministic domain service.

Given:

- input A;
- input B;
- current player durable state;
- current validated content package;

it returns one ResolutionResult plus ordered domain events.

No UI state, animation, random roll or network access is permitted inside the resolver.

## Canonicalization

1. Verify both element IDs exist.
2. Verify both elements are currently discovered/usable by the player.
3. Canonicalize the unordered pair into a stable `PairKey`.
4. A+A remains valid and canonicalizes normally.

## Resolution order

### Step 1 — explicit recipes

Find explicit recipes matching PairKey.

Filter by currently satisfied requirements.

If one valid recipe remains:
resolve it.

If more than one valid recipe remains:
choose the highest explicit `priority` only if priorities are unique.

Otherwise:
throw a content-definition error in development/test builds.

Runtime production content should never contain unresolved ambiguity.

### Step 2 — gated explicit pair

If the pair has an explicit recipe whose requirements are not yet satisfied, inspect its authored `gateBehavior`.

#### normal

Unavailable recipe behaves as no reaction.

#### dormant

Behaves exactly as no reaction to the player.

It is not archived and does not leak that future content exists.

#### anomaly

If the corresponding anomaly is eligible, return anomaly.

#### unlock_trigger

If its eligibility requirements are met, resolve and emit the target reveal events.

If not eligible, its authored fallback must be explicit: dormant or anomaly. Do not infer.

### Step 3 — tag rules

If no explicit recipe resolves, evaluate tag rules.

Rules are unordered with respect to the two inputs: selector assignment may match either orientation.

Filter by:

- selector match;
- exclusions;
- requirements.

Rank by:

1. priority;
2. selector specificity.

Equal top-ranked ambiguity is invalid content.

### Step 4 — standalone anomaly records

If no recipe/rule resolves, check an anomaly definition matching the pair whose requirements are satisfied.

If found:
return anomaly.

### Step 5 — no reaction

Return no reaction.

## Result type

```ts
type ResolutionResult =
  | {
      type: "success";
      pairKey: PairKey;
      recipeId: RecipeId;
      resultElementId: ElementId;
      isNewElement: boolean;
      isNewRecipe: boolean;
      events: DomainEvent[];
    }
  | {
      type: "anomaly";
      pairKey: PairKey;
      anomalyId: AnomalyId;
      isNewAnomaly: boolean;
      events: DomainEvent[];
    }
  | {
      type: "no_reaction";
      pairKey: PairKey;
      events: DomainEvent[];
    };
```

## Success event ordering

Recommended domain ordering:

1. `pair_tested`
2. `recipe_discovered`, if new
3. `element_discovered`, if new
4. XP grant event(s)
5. set/feature/era unlock checks
6. `set_revealed` etc.
7. completion checks
8. level-up checks
9. new-possibility recalculation notification

Presentation may combine simultaneous events into one celebration.

## Repeat recipe

Repeating a known recipe:

- returns success;
- creates the result for presentation;
- updates tested-pair timestamp;
- grants 0 XP;
- does not replay major discovery reveal.

## Alternate recipe

If the result element is already known but the recipe is new:

- mark recipe discovered;
- grant alternate-recipe XP;
- use alternate-recipe presentation tier.

## Anomaly resolution

When a previously observed anomaly gains a valid resolution recipe:

- catalog marks it `revisitable`;
- merely becoming revisitable does not auto-discover the result;
- player must perform the pair again;
- successful performance emits `anomaly_resolved` plus normal discovery events.

## Same pair changing over time

Base pair semantics are intentionally conservative.

A pair may move:

`no reaction/dormant → anomaly → success`

only when authored content/gates allow it.

A pair should not normally move:

`success result A → success result B`

inside the same base two-slot experiment mode.

If a future modifier changes outcomes, modifier context forms a distinct experiment signature.

This prevents players from feeling that previously learned recipes were rewritten arbitrarily.

## Tested-pair freshness

A `no_reaction` record is only authoritative for the content version under which it was tested.

After a content update:

- recompute whether a previously failed pair now has a valid path;
- if yes, do not present it as exhausted;
- surface `new possibilities` without revealing the answer.

Successful historical recipes remain historical facts unless a migration explicitly retires one.

## Exhaustion calculation

An element is `currently exhausted` only if no currently discoverable non-secret recipe/rule/anomaly path exists between it and any known usable element.

Ignore:

- unrevealed secrets;
- dormant future content;
- inaccessible modifier modes.

Recalculate after:

- new element discovery;
- set/era unlock;
- anomaly state change;
- content update.

## Hidden-content protection

Resolver output may contain internal IDs, but player-facing selectors must never use unrevealed hidden targets to generate:

- counts;
- silhouettes;
- search entries;
- graph nodes;
- exact hints.

A separate visibility policy layer filters domain knowledge for presentation.

## Generic-rule precedence example

Given:

`[plant] + fire → ash`

and explicit:

`phoenix_flower + fire → phoenix_seed`

the explicit recipe always wins.

## No random recipes

The resolver never randomly chooses a result.

Randomness may be used only for cosmetic presentation, never canonical discovery.

## Future modifiers

Environmental/third-slot mechanics must extend the experiment signature:

```text
mode + inputA + inputB + optionalModifier
```

Do not retrofit directionality into base PairKey.

## Error handling

Invalid player input:
return typed domain error without mutating save.

Invalid content ambiguity:
fail validation/build/CI.

Unknown shipped ID after migration:
quarantine the broken reference, log telemetry only if later analytics exists, and keep the rest of the save loadable.

## Purity requirement

Unit tests must be able to call resolver functions with plain objects and no browser APIs.

This is a hard architectural requirement.
