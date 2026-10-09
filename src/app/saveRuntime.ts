import { loadSeed } from '../content/load';
import { SaveApplication } from '../application/save/SaveApplication';
import { IndexedDbSaveRepository } from '../persistence/indexeddb/IndexedDbSaveRepository';

let runtime: { application: SaveApplication; repository: IndexedDbSaveRepository; boot: ReturnType<SaveApplication['start']> } | undefined;
/** One boot promise avoids duplicate new-game creation under React StrictMode. */
export function saveRuntime() {
  if (!runtime) {
    const repository = new IndexedDbSaveRepository();
    const application = new SaveApplication(repository, loadSeed());
    runtime = { application, repository, boot: application.start() };
  }
  return runtime;
}
/** A boundary retry reads the latest committed progress instead of reusing the first boot snapshot. */
export function refreshRuntimeBootForRetry() {
  if (runtime) runtime.boot = runtime.application.load();
  return runtime?.boot;
}
