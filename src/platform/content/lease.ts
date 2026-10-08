import type { CommandLease } from '../../application/save/SaveApplication';
import type { ContentPackRepository } from '../../persistence/ContentPackRepository';
import { SaveError } from '../../domain/model/saveErrors';
/** One exclusive browser-wide lease covers the entire save/content command, across tabs.
 * Older tabs cannot reconcile a newer composition using their stale index. */
export const browserContentLease: CommandLease = async action => {
  if (!navigator.locks) return action();
  return await navigator.locks.request('merge_discovery_content_and_save', action);
};
export function epochLease(repository: ContentPackRepository, revision: number): CommandLease {
  return action => browserContentLease(async () => {
    if ((await repository.load()).revision !== revision) throw new SaveError('conflict', 'Content epoch changed: reload the browser before continuing');
    return action();
  });
}
