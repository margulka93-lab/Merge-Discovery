import type { ContentIndex } from '../domain/model/types';
import { resolve } from '../domain/resolver/resolve';
import { engineState } from './save/projection';
import type { ApplicationSnapshot } from './save/SaveApplication';
import { laboratoryReaction, type LabReaction } from './laboratory';
import { isFailureAuthoritative } from './updates/reconcile';

/** Redundancy is evaluated against the CURRENT resolver, never just historical pair/result IDs.
 * Only previously observed outcomes can be projected; new outcomes remain private until commit. */
export function rememberedAttempt(a: string, b: string, snapshot: ApplicationSnapshot, index: ContentIndex): LabReaction | undefined {
  const result = resolve(a, b, engineState(snapshot.save, index), index);
  if (result.events.some(e => !["pair_tested", "known_recipe_repeated", "no_reaction"].includes(e.type))) return undefined;
  const remembered = result.type === 'success' ? !result.isNewRecipe && !result.isNewElement
    : result.type === 'anomaly' ? !result.isNewAnomaly
    : isFailureAuthoritative(snapshot.save, result.pairKey, index);
  if (!remembered) return undefined;
  const reaction = laboratoryReaction(result, snapshot, index);
  return { ...reaction, remembered: true,
    announcement: result.type === 'success' ? `Già scoperta: ${reaction.element?.name}.` : reaction.announcement };
}
