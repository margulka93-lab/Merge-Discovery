export type ElementId = string;
export type SetId = string;
export type RecipeId = string;
export type PairKey = `${string}::${string}`;
export type Rarity = 'common' | 'uncommon' | 'rare' | 'extraordinary' | 'secret';

export type Requirement =
  | { type: 'min_level'; level: number }
  | { type: 'element_discovered'; elementId: ElementId }
  | { type: 'set_revealed'; setId: SetId }
  | { type: 'set_completion_at_least'; setId: SetId; percent: number }
  | { type: 'feature_unlocked'; featureId: string }
  | { type: 'era_eligible'; eraId: string };

export interface ElementDefinition {
  id: ElementId; nameKey: string; descriptionKey: string; setId: SetId;
  rarity: Rarity; tags: string[]; starter?: boolean;
  completion: 'required' | 'bonus' | 'secret';
  visibility: 'announced' | 'glimpsed' | 'hidden' | 'secret';
  sortOrder?: number; artKey: string;
}
export interface SetDefinition {
  id: SetId; nameKey: string; descriptionKey: string; eraId: string;
  visibility: 'announced' | 'discovery' | 'hidden' | 'secret';
  completionMode: 'required_elements'; accentToken: string; iconKey: string; sortOrder: number;
}
export interface CollectionDefinition {
  id: string; nameKey: string; descriptionKey: string;
  visibility: 'visible' | 'hidden' | 'secret'; memberElementIds: ElementId[];
  chapters?: { id: string; nameKey: string; memberElementIds: ElementId[] }[];
}
export interface RecipeDefinition {
  id: RecipeId; inputs: [ElementId, ElementId]; resultElementId: ElementId;
  kind: 'explicit'; discovery: 'normal' | 'alternate' | 'secret';
  requirements?: Requirement[];
  gateBehavior?: 'normal' | 'dormant' | 'anomaly' | 'unlock_trigger';
  /** Required for future gated unlock triggers; never inferred by the engine. */
  gateFallback?: 'dormant' | 'anomaly';
  priority?: number;
}
export interface TagSelector { all?: string[]; any?: string[]; none?: string[] }
export interface TagRuleDefinition {
  id: string; inputSelectors: [TagSelector, TagSelector]; resultElementId: ElementId;
  priority: number; requirements?: Requirement[]; exclusions?: ElementId[];
}
export interface AnomalyDefinition {
  id: string; inputs: [ElementId, ElementId]; requirements?: Requirement[];
  visibility: 'archive'; category: 'mythic' | 'spiritual' | 'dimensional' | 'unknown';
  resolutionRecipeId?: RecipeId; messageKey: string;
}
export interface UnlockRule {
  id: string;
  target: { type: 'set'; setId: SetId } | { type: 'feature'; featureId: string } | { type: 'era'; eraId: string };
  requirements: Requirement[]; revealMode: 'silent' | 'normal' | 'major';
}
export interface ProgressionDefinition {
  levelThresholds: number[];
  rewards: {
    newElementBase: number; rarityBonus: Record<Rarity, number>; alternateRecipe: number;
    anomalyRegistered: number; anomalyResolved: number; announcedSetReveal: number;
    hiddenSetReveal: number; secretSetReveal: number;
    setCompletionBase: number; setCompletionPerElement: number; setCompletionCap: number;
  };
}
/** OR is represented by multiple paths, each containing ANDed requirements. */
export interface VisibilityPolicy {
  initialRevealedSetIds: SetId[];
  setAnnouncements: { setId: SetId; paths: Requirement[][] }[];
  collectionReveals: { collectionId: string; paths: Requirement[][] }[];
}
export interface ContentPackage {
  manifest: { contentVersion: string; minimumSaveSchemaVersion: number; localeFallback: 'it' };
  elements: ElementDefinition[]; sets: SetDefinition[]; collections: CollectionDefinition[];
  recipes: RecipeDefinition[]; rules: TagRuleDefinition[]; anomalies: AnomalyDefinition[];
  unlocks: UnlockRule[]; progression: ProgressionDefinition; visibility: VisibilityPolicy;
  locales: { it: Record<string, string> };
  registries: { tags: string[]; features: string[]; eras: string[] };
  migrations: { aliases: Record<string, string> };
}
export interface ContentIndex {
  content: ContentPackage;
  elements: ReadonlyMap<ElementId, ElementDefinition>;
  recipesByPair: ReadonlyMap<PairKey, readonly RecipeDefinition[]>;
  anomaliesByPair: ReadonlyMap<PairKey, readonly AnomalyDefinition[]>;
  membersBySet: ReadonlyMap<SetId, readonly ElementDefinition[]>;
  rules: readonly TagRuleDefinition[];
}
/** Minimal engine facts, not a durable save schema or persistence implementation. */
export interface PlayerState {
  xp: number; discoveredElementIds: ElementId[]; discoveredRecipeIds: RecipeId[];
  observedAnomalyIds: string[]; resolvedAnomalyIds: string[];
  revealedSetIds: SetId[]; completedSetIds: SetId[]; completedCollectionChapterIds: string[];
  unlockedFeatureIds: string[]; eligibleEraIds: string[];
  testedPairs: Record<PairKey, { lastOutcome: 'success' | 'no_reaction' | 'anomaly'; testedAgainstContentVersion: string }>;
}
export type DomainEvent =
  | { type: 'pair_tested'; pairKey: PairKey; outcome: 'success' | 'no_reaction' | 'anomaly'; contentVersion: string }
  | { type: 'recipe_discovered' | 'known_recipe_repeated'; recipeId: RecipeId }
  | { type: 'element_discovered'; elementId: ElementId }
  | { type: 'xp_granted'; amount: number }
  | { type: 'anomaly_registered' | 'anomaly_resolved'; anomalyId: string }
  | { type: 'set_revealed' | 'set_completed'; setId: SetId }
  | { type: 'collection_completed'; collectionId: string; completionId: string }
  | { type: 'feature_unlocked'; featureId: string }
  | { type: 'era_eligible'; eraId: string }
  | { type: 'level_up'; level: number }
  | { type: 'no_reaction' | 'new_possibilities_available' };
export type ResolutionResult =
  | { type: 'success'; pairKey: PairKey; recipeId: RecipeId; resultElementId: ElementId; isNewElement: boolean; isNewRecipe: boolean; events: DomainEvent[] }
  | { type: 'anomaly'; pairKey: PairKey; anomalyId: string; isNewAnomaly: boolean; events: DomainEvent[] }
  | { type: 'no_reaction'; pairKey: PairKey; events: DomainEvent[] };
