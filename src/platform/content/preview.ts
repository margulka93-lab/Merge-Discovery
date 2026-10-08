import type { PreviewRequest, PreviewResponse } from './preview.worker';
import type { previewPack } from '../../application/packs/preview';
import { PackError } from '../../content/packs/model';
/** Run the same CLI/application simulator off the UI thread, with a bounded lifetime. */
export const workerPreview = (...args: PreviewRequest): Promise<ReturnType<typeof previewPack>> => new Promise((resolve,reject) => {
  const worker = new Worker(new URL('./preview.worker.ts', import.meta.url), { type: 'module' });
  const timeout = setTimeout(() => { worker.terminate(); reject(new PackError(['Simulazione oltre 90 secondi: riduci il pacchetto o usa il CLI per il report.'])); },90_000);
  const finish = () => { clearTimeout(timeout); worker.terminate(); };
  worker.onmessage = (event: MessageEvent<PreviewResponse>) => { finish(); if ('error' in event.data) reject(new PackError([event.data.error])); else resolve(event.data.preview); };
  worker.onerror = () => { finish(); reject(new PackError(['Simulatore non disponibile: nessuna installazione eseguita.'])); };
  worker.postMessage(args);
});
