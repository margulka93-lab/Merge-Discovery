import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
const journey = JSON.parse(readFileSync('docs/evidence/isolario-foundation/journey.json', 'utf8')) as typeof import('../../docs/evidence/isolario-foundation/journey.json');
test('production offline keeps separate world fixture across canonical combine/reload/export', async ({ page, context }) => {
  await page.goto('/'); await expect(page.getByRole('button', { name: 'Combina', exact: true })).toBeVisible();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; if (!navigator.serviceWorker.controller) await new Promise<void>(resolve => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true })); });
  await page.goto('/settings'); await page.getByText('Salvataggio locale · importazione e recupero', { exact: true }).click();
  const payload = journey.canonicalSave;
  await page.getByLabel('JSON del salvataggio (diagnostica)').fill(JSON.stringify({ product: 'merge_discovery', saveSchemaVersion: payload.saveSchemaVersion, contentVersionSeen: payload.contentVersionSeen, payload }));
  await page.getByRole('button', { name: 'Verifica import', exact: true }).click(); await page.getByRole('button', { name: 'Conferma sostituzione del progresso' }).click();
  await expect(page.getByRole('button', { name: 'Combina', exact: true })).toBeVisible();
  // Deliberately seeded application-simulation fixture, not a purported playable Island.
  const before = await page.evaluate(async state => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => { const r = indexedDB.open('merge_discovery'); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); });
    const meta = await new Promise<{ generation: string }>(resolve => { const r = db.transaction('profile_meta').objectStore('profile_meta').get('single_player'); r.onsuccess = () => resolve(r.result); });
    state.profileGeneration = meta.generation;
    const row = { id: 'first_island', generation: meta.generation, revision: 11, current: state, backup: null };
    await new Promise<void>((resolve, reject) => { const t = db.transaction('world_snapshots', 'readwrite'); t.objectStore('world_snapshots').put(row); t.oncomplete = () => resolve(); t.onerror = () => reject(t.error); }); db.close(); return row;
  }, journey.state);
  const readWorld = () => page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>(resolve => { const r = indexedDB.open('merge_discovery'); r.onsuccess = () => resolve(r.result); });
    const row = await new Promise(resolve => { const r = db.transaction('world_snapshots').objectStore('world_snapshots').get('first_island'); r.onsuccess = () => resolve(r.result); }); db.close(); return row;
  });
  await context.setOffline(true); await page.reload(); await expect(page.getByRole('button', { name: 'Combina', exact: true })).toBeVisible(); expect(await readWorld()).toEqual(before);
  const energy = page.getByRole('button', { name: /^Energia, elemento del set/ }); await energy.click(); await energy.click(); await page.getByRole('button', { name: 'Combina', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Calore', exact: true })).toBeVisible(); expect(await readWorld()).toEqual(before);
  await page.reload(); expect(await readWorld()).toEqual(before);
  await page.goto('/settings'); await page.getByText('Salvataggio locale · importazione e recupero', { exact: true }).click();
  await expect(page.getByText(/Questo JSON trasferisce soltanto le scoperte/)).toBeVisible();
  await page.getByRole('button', { name: 'Esporta JSON / verifica round-trip' }).click();
  await expect(page.getByText('Export/import validato; nessuna sovrascrittura eseguita.')).toBeVisible();
  const exported = JSON.parse(await page.getByLabel('JSON del salvataggio (diagnostica)').inputValue()); expect(exported.payload.xp).toBe(2430); expect(exported.payload).not.toHaveProperty('placements'); expect(await readWorld()).toEqual(before);
  mkdirSync('docs/evidence/isolario-foundation', { recursive: true }); writeFileSync('docs/evidence/isolario-foundation/production-world-offline.json', JSON.stringify({ production: true, realServiceWorker: true, fixtureOrigin: 'real application simulation, explicitly seeded world row', offlineCanonicalCombine: true, separateWorldRetainedAcrossReloadExport: true, xp: 2430, worldObservations: 11, portableWorldExport: false, islandUI: 'NOT IMPLEMENTED', worldSafePointUI: 'Island tranche' }, null, 2));
});
