import { loadSeed } from '../content/load';

/** Composition root only: no save, transactions or playable Lab in Phase 0/1. */
export function engineStatus(): { ready: boolean; version?: string; error?: string } {
  try { return { ready: true, version: loadSeed().content.manifest.contentVersion }; }
  catch (error) { return { ready: false, error: error instanceof Error ? error.message : 'Contenuto non valido' }; }
}
