import { loadSeed } from '../content/load';
import { SaveApplication } from '../application/save/SaveApplication';
import { IndexedDbSaveRepository } from '../persistence/indexeddb/IndexedDbSaveRepository';

let runtime: { application: SaveApplication; boot: ReturnType<SaveApplication['start']> } | undefined;
/** One boot promise avoids duplicate new-game creation under React StrictMode. */
export function saveRuntime() {
  if (!runtime) {
    const application = new SaveApplication(new IndexedDbSaveRepository(), loadSeed());
    runtime = { application, boot: application.start() };
  }
  return runtime;
}
/** A boundary retry reads the latest committed progress instead of reusing the first boot snapshot. */
export function refreshRuntimeBootForRetry() {
  if (runtime) runtime.boot = runtime.application.load();
  return runtime?.boot;
}
