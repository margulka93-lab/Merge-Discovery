import type { PairKey } from './types';

export interface PlayerSettings {
  informationMode: 'mystery' | 'balanced' | 'collector';
  proactiveHints: 'off' | 'light' | 'normal';
  reducedMotion: boolean; highContrast: boolean;
  textScale: 'default' | 'large' | 'extra_large';
  soundEnabled: boolean; musicEnabled: boolean; dragEnabled: boolean;
}
export interface Discovery { firstDiscoveredAt: string; firstRecipeId?: string }
export interface TestedPair {
  lastOutcome: 'success' | 'no_reaction' | 'anomaly';
  testedAgainstContentVersion: string; lastTestedAt: string;
}
export interface ObservedAnomaly { firstObservedAt: string; resolvedAt?: string }
/** Retired/unknown references remain exportable, but never reach the active engine/UI. */
export interface QuarantinedReferences {
  discoveredElements: Record<string, Discovery>; discoveredRecipeIds: string[];
  testedPairs: Record<PairKey, TestedPair>; anomalies: Record<string, ObservedAnomaly>;
  revealedSetIds: string[]; completedSetIds: string[];
  completedCollectionChapterIds: string[]; favoriteElementIds: string[];
}
export interface PlayerSave extends QuarantinedReferences {
  saveSchemaVersion: number; contentVersionSeen: string;
  createdAt: string; updatedAt: string; xp: number; settings: PlayerSettings;
  quarantine?: QuarantinedReferences;
}
