import type { SaveApplication } from '../save/SaveApplication';
import { engineState } from '../save/projection';
import { resolve } from '../../domain/resolver/resolve';
/** Selective neutral extraction of #13 attempt.ts (2267a444).
 * No world eligibility participates in canonical resolution. No nested lease. */
export async function experiment(application: SaveApplication, a: string, b: string) {
  const snapshot = await application.load();
  const result = resolve(a, b, engineState(snapshot.save, application.index), application.index);
  if (result.type === 'success' && !result.isNewElement && !result.isNewRecipe && result.events.every(e => ['pair_tested', 'known_recipe_repeated'].includes(e.type))) return { resolution: result, snapshot, replay: true };
  return { ...await application.combine(a, b), replay: false };
}
