import { saveRuntime } from './saveRuntime';
import { islandContent } from '../content/world/island';
import { validateWorld } from '../content/world/validate';
import { WorldActionApplication } from '../application/island/WorldActionApplication';
import { ProofSession } from '../application/island/ProofSession';
import { IndexedDbWorldRepository } from '../persistence/indexeddb/IndexedDbWorldRepository';
import { browserWorldLease } from '../application/island/lease';
let session: ProofSession | undefined;
export function islandRuntime() {
  const runtime = saveRuntime();
  if (!session) session = new ProofSession(runtime.application, new WorldActionApplication(
    new IndexedDbWorldRepository(runtime.repository.database), validateWorld(islandContent, runtime.application.index), runtime.application.index,
    undefined, browserWorldLease()));
  return { session, boot: runtime.boot };
}
