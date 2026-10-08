import { rawSeed } from '../content/load';
import { validateContent } from '../content/validate';
import { composePacks } from '../content/packs/compose';
import { readPack, writePack } from '../content/packs/archive';
import { SaveApplication } from '../application/save/SaveApplication';
import { ContentPackApplication } from '../application/packs/ContentPackApplication';
import { artworkSources } from '../application/packs/artwork';
import { IndexedDbSaveRepository } from '../persistence/indexeddb/IndexedDbSaveRepository';
import { IndexedDbContentPackRepository } from '../persistence/indexeddb/IndexedDbContentPackRepository';
import { verifyImage } from '../platform/content/images';
import { browserContentLease, epochLease } from '../platform/content/lease';
import { PackError } from '../content/packs/model';
import { workerPreview } from '../platform/content/preview';

async function createRuntime() {
  const seed = validateContent(rawSeed), repository = new IndexedDbSaveRepository(), packsRepository = new IndexedDbContentPackRepository();
  return browserContentLease(async () => {
    const stored = await packsRepository.load();
    if (stored.packs.length && !navigator.locks) throw new PackError(['Questo browser non supporta l’attivazione sicura dei pacchetti. Usa un browser con Web Locks.']);
    // Persisted bytes remain untrusted; never silently discard damaged installed content.
    const packs = await Promise.all(stored.packs.map(async pack => readPack(await writePack(pack))));
    const { index } = composePacks(seed, packs);
    const application = new SaveApplication(repository, index, undefined, undefined, epochLease(packsRepository, stored.revision));
    const contentApplication = new ContentPackApplication(seed, packsRepository, repository, verifyImage, browserContentLease, workerPreview);
    return { application, contentApplication, artwork: artworkSources(packs) };
  }).then(value => ({ ...value, boot: value.application.start() }));
}
let runtime: ReturnType<typeof createRuntime> | undefined;
/** One composition + boot promise avoids duplicate startup under React StrictMode. */
export function saveRuntime() { return runtime ??= createRuntime(); }
export function refreshRuntimeBootForRetry() {
  return runtime?.then(value => { value.boot = value.application.load(); return value.boot; });
}
