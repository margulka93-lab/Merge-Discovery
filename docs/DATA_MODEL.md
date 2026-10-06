# Data Model

Status: **implementation-ready design specification v1**

This document defines the canonical domain model. Runtime/UI code must consume these structures rather than hard-coding gameplay knowledge.

## ID convention

All durable internal IDs use lowercase English `snake_case`.

Examples:

- `cosmic_dust`
- `water_lily`
- `fantastic_creatures`

Display names are localized separately.

IDs are permanent once shipped. Renaming a display label never changes the ID.

## Content package

A content version contains:

- elements
- sets
- collections
- recipes
- tag rules
- anomalies
- unlock rules
- XP/level curve
- localization keys
- content migrations/aliases

Suggested source layout:

```text
content/
  manifest.json
  elements.json
  sets.json
  collections.json
  recipes.json
  rules.json
  anomalies.json
  unlocks.json
  progression.json
  migrations.json
  locales/
    it.json
```

Implementation may split files by Era later without changing the logical schema.

## Content manifest

Required fields:

```ts
type ContentManifest = {
  contentVersion: string;        // semantic content version, e.g. "0.1.0"
  minimumSaveSchemaVersion: number;
  localeFallback: "it";
};
```

## Element

```ts
type ElementDefinition = {
  id: ElementId;
  nameKey: string;
  descriptionKey: string;
  setId: SetId;
  rarity: "common" | "uncommon" | "rare" | "extraordinary" | "secret";
  tags: TagId[];
  starter?: boolean;
  completion: "required" | "bonus" | "secret";
  visibility: "announced" | "glimpsed" | "hidden" | "secret";
  sortOrder?: number;
  artKey: string;
};
```

Rules:

- exactly one `setId`;
- tags may be empty;
- starter elements must be reachable at save creation without recipes;
- secret elements never count in visible required completion before reveal;
- `artKey` is stable and independent from file extension.

## Set

```ts
type SetDefinition = {
  id: SetId;
  nameKey: string;
  descriptionKey: string;
  eraId: EraId;
  visibility: "announced" | "discovery" | "hidden" | "secret";
  completionMode: "required_elements";
  accentToken: string;
  iconKey: string;
  sortOrder: number;
};
```

Set completion denominator consists only of active elements where:

- `setId` matches;
- `completion === "required"`;
- content is active in the current version;
- the element is not an unrevealed secret.

## Collection

```ts
type CollectionDefinition = {
  id: CollectionId;
  nameKey: string;
  descriptionKey: string;
  visibility: "visible" | "hidden" | "secret";
  memberElementIds: ElementId[];
  chapters?: {
    id: string;
    nameKey: string;
    memberElementIds: ElementId[];
  }[];
  reward?: CollectionReward;
};
```

Collections do not gate required progression.

## Recipe

Base recipes are unordered.

```ts
type RecipeDefinition = {
  id: RecipeId;
  inputs: readonly [ElementId, ElementId];
  resultElementId: ElementId;
  kind: "explicit";
  discovery: "normal" | "alternate" | "secret";
  requirements?: Requirement[];
  gateBehavior?: "normal" | "dormant" | "anomaly" | "unlock_trigger";
  priority?: number;
};
```

Canonical pair key:

```text
min(inputA,inputB) + "::" + max(inputA,inputB)
```

This also handles A+A.

Rules:

- input order never changes the base recipe;
- multiple recipes may produce the same result;
- one input pair must never resolve to two simultaneously valid results;
- conditional variants require non-overlapping requirements or explicit priority validated at build time;
- `alternate` describes an additional discovery path to an already valid element, not a weaker result.

## Tag rule

Tag rules reduce authoring repetition.

```ts
type TagRuleDefinition = {
  id: RuleId;
  inputSelectors: readonly [TagSelector, TagSelector];
  resultElementId: ElementId;
  priority: number;
  requirements?: Requirement[];
  exclusions?: ElementId[];
};
```

```ts
type TagSelector = {
  all?: TagId[];
  any?: TagId[];
  none?: TagId[];
};
```

Explicit recipes always beat tag rules.

Two simultaneously valid tag rules with equal specificity/priority are a content validation error.

## Anomaly

Anomaly records are separate from ordinary recipes so future mystery content can exist without requiring a current result element.

```ts
type AnomalyDefinition = {
  id: AnomalyId;
  inputs: readonly [ElementId, ElementId];
  requirements?: Requirement[];
  visibility: "archive";
  category: "mythic" | "spiritual" | "dimensional" | "unknown";
  resolutionRecipeId?: RecipeId;
  messageKey: string;
};
```

An anomaly may ship unresolved. A later content version can assign `resolutionRecipeId`.

## Requirement

Initial supported requirement vocabulary:

```ts
type Requirement =
  | { type: "min_level"; level: number }
  | { type: "element_discovered"; elementId: ElementId }
  | { type: "set_revealed"; setId: SetId }
  | { type: "set_completion_at_least"; setId: SetId; percent: number }
  | { type: "feature_unlocked"; featureId: FeatureId }
  | { type: "era_eligible"; eraId: EraId };
```

Requirements are ANDed within one record.

More complex OR logic should use multiple authored unlock paths rather than arbitrary nested expressions in v1.

## Unlock rule

```ts
type UnlockRule = {
  id: string;
  target:
    | { type: "set"; setId: SetId }
    | { type: "feature"; featureId: FeatureId }
    | { type: "era"; eraId: EraId };
  requirements: Requirement[];
  revealMode: "silent" | "normal" | "major";
};
```

A hidden Set may remain absent even if internally eligible until its reveal rule fires.

## XP rule

XP values live in progression data, not UI code.

```ts
type ProgressionDefinition = {
  levelThresholds: number[];
  rewards: {
    newElementBase: number;
    rarityBonus: Record<ElementRarity, number>;
    alternateRecipe: number;
    anomalyRegistered: number;
    anomalyResolved: number;
    announcedSetReveal: number;
    hiddenSetReveal: number;
    secretSetReveal: number;
  };
};
```

## Player save — durable facts

Derived state should be recomputed rather than stored whenever safe.

```ts
type PlayerSave = {
  saveSchemaVersion: number;
  contentVersionSeen: string;
  createdAt: string;
  updatedAt: string;

  xp: number;

  discoveredElements: Record<ElementId, {
    firstDiscoveredAt: string;
    firstRecipeId?: RecipeId;
  }>;

  discoveredRecipeIds: RecipeId[];

  testedPairs: Record<PairKey, {
    lastOutcome: "success" | "no_reaction" | "anomaly";
    testedAgainstContentVersion: string;
    lastTestedAt: string;
  }>;

  anomalies: Record<AnomalyId, {
    firstObservedAt: string;
    resolvedAt?: string;
  }>;

  revealedSetIds: SetId[];
  completedSetIds: SetId[];
  completedCollectionChapterIds: string[];

  favoriteElementIds: ElementId[];

  settings: PlayerSettings;
};
```

## Derived state

Do not persist as source of truth:

- player level — derive from XP;
- visible Set completion percentage;
- currently exhausted elements;
- “new possibilities” state;
- available undiscovered reactions;
- current unlock eligibility;
- filtered catalog lists.

Derived data must be recalculated after content updates.

## Settings

```ts
type PlayerSettings = {
  informationMode: "mystery" | "balanced" | "collector";
  proactiveHints: "off" | "light" | "normal";
  reducedMotion: boolean;
  highContrast: boolean;
  textScale: "default" | "large" | "extra_large";
  soundEnabled: boolean;
  musicEnabled: boolean;
  dragEnabled: boolean;
};
```

## Event model

The game engine returns domain events after actions.

Core events:

- `pair_tested`
- `recipe_discovered`
- `element_discovered`
- `known_recipe_repeated`
- `no_reaction`
- `anomaly_registered`
- `anomaly_revisitable`
- `anomaly_resolved`
- `set_revealed`
- `set_completed`
- `collection_completed`
- `level_up`
- `feature_unlocked`
- `new_possibilities_available`

UI presentation is driven by event importance rather than duplicating game logic.

## Content authoring principle

The source data must be human-readable and reviewable in pull requests.

Do not bury canonical recipes in generated binary assets or component code.

Generated indexes are allowed only as build artifacts derived from canonical source files.
