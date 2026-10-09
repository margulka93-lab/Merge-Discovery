import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import type { WorldContext } from '../../src/persistence/WorldRepository';
const evidence = 'docs/evidence/isolario-foundation';
test('Foundation real Chromium v1 upgrade, atomic generations and stale second tab', async ({ page, context }) => {
  await page.goto('/');
  const migration = await page.evaluate(async () => {
    const dbName = 'foundation-browser-contract';
    const raw = await (await fetch('/tests/fixtures/saves/v1-fresh.json')).json();
    const old = await new Promise<IDBDatabase>((resolve, reject) => {
      // Dexie logical v1 is native IndexedDB version 10.
      const r = indexedDB.open(dbName, 10); r.onupgradeneeded = () => r.result.createObjectStore('snapshots', { keyPath: 'id' }); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error);
    });
    const original = { id: 'single_player', revision: 7, current: raw, backup: raw };
    await new Promise<void>((resolve, reject) => { const t = old.transaction('snapshots', 'readwrite'); t.objectStore('snapshots').put(original); t.oncomplete = () => resolve(); t.onerror = () => reject(t.error); });
    let versionchange = false; old.onversionchange = () => { versionchange = true; old.close(); };
    const saveUrl = '/src/persistence/indexeddb/IndexedDbSaveRepository.ts', worldUrl = '/src/persistence/indexeddb/IndexedDbWorldRepository.ts';
    const { SaveDatabase } = await import(saveUrl), { IndexedDbWorldRepository } = await import(worldUrl);
    const db = new SaveDatabase(dbName), worlds = new IndexedDbWorldRepository(db);
    const c = await worlds.context('first_island'), current = await db.snapshots.get('single_player'); db.close();
    return { versionchange, canonicalBytesUnchanged: JSON.stringify(original) === JSON.stringify(current), context: c };
  });
  expect(migration.versionchange).toBe(true); expect(migration.canonicalBytesUnchanged).toBe(true);
  const other = await context.newPage(); await other.goto('/');
  // This is an adapter/command harness in real browser storage, not an implemented Island UI.
  const discover = await page.evaluate(async () => {
    const saveUrl = '/src/persistence/indexeddb/IndexedDbSaveRepository.ts', appUrl = '/src/application/save/SaveApplication.ts', contentUrl = '/src/content/load.ts', worldUrl = '/src/persistence/indexeddb/IndexedDbWorldRepository.ts';
    const { SaveDatabase, IndexedDbSaveRepository } = await import(saveUrl), { SaveApplication } = await import(appUrl), { loadSeed } = await import(contentUrl), { IndexedDbWorldRepository } = await import(worldUrl);
    const db = new SaveDatabase('foundation-browser-contract'), saves = new IndexedDbSaveRepository(db), app = new SaveApplication(saves, loadSeed());
    await app.load(); await app.combine('void', 'energy'); const c = await new IndexedDbWorldRepository(db).context('first_island'); db.close(); return c;
  });
  const attempt = async (target: typeof page, captured: WorldContext, id: string) => target.evaluate(async ({ captured, id }) => {
    const paths = ['/src/persistence/indexeddb/IndexedDbSaveRepository.ts', '/src/persistence/indexeddb/IndexedDbWorldRepository.ts', '/src/application/island/WorldActionApplication.ts', '/src/content/world/validate.ts', '/src/content/world/island.ts', '/src/content/load.ts'];
    const [dbModule, worldModule, appModule, validator, data, content] = await Promise.all(paths.map(p => import(p)));
    const canonical = content.loadSeed(), index = validator.validateWorld(data.islandContent, canonical), db = new dbModule.SaveDatabase('foundation-browser-contract');
    const app = new appModule.WorldActionApplication(new worldModule.IndexedDbWorldRepository(db), index, canonical);
    try {
      const result = await app.manifest({ commandId: id, manifestationId: 'light', anchorId: 'west_sky' }, { generation: captured.generation, saveRevision: captured.save.revision, worldRevision: captured.world.revision, definitionVersion: index.content.definition.version, contentVersion: canonical.content.manifest.contentVersion });
      return { changed: result.changed, code: 'ok' };
    } catch (e) { return { changed: false, code: (e as { code: string }).code }; } finally { db.close(); }
  }, { captured, id });
  expect(await attempt(other, migration.context, 'stale_save')).toMatchObject({ code: 'conflict' });
  expect(await attempt(page, discover, 'light')).toMatchObject({ changed: true });
  expect(await attempt(other, discover, 'stale_world')).toMatchObject({ code: 'conflict' });
  const imported = await other.evaluate(async () => {
    const saveUrl = '/src/persistence/indexeddb/IndexedDbSaveRepository.ts', worldUrl = '/src/persistence/indexeddb/IndexedDbWorldRepository.ts';
    const { SaveDatabase, IndexedDbSaveRepository } = await import(saveUrl), { IndexedDbWorldRepository } = await import(worldUrl);
    const db = new SaveDatabase('foundation-browser-contract'), saves = new IndexedDbSaveRepository(db), prior = await saves.load();
    await saves.import(prior.current, prior.revision); const c = await new IndexedDbWorldRepository(db).context('first_island'); db.close(); return c;
  });
  expect(imported.generation).not.toBe(discover.generation); expect(imported.world.current).toBeNull();
  expect(await attempt(page, discover, 'foreign_generation')).toMatchObject({ code: 'conflict' });
  mkdirSync(evidence, { recursive: true }); writeFileSync(`${evidence}/browser-migration.json`, JSON.stringify({ browser: 'Chromium desktop automated, real IndexedDB', canonicalBytesUnchanged: true, versionchangeClosesOldConnection: true, staleSaveRejected: true, staleWorldRejected: true, importRotatesGeneration: true, staleGenerationRejected: true, islandUI: 'NOT IMPLEMENTED' }, null, 2));
});

for (const [width, height] of [[1440,900],[390,844],[320,568]] as const) for (const state of ['initial', 'developed']) {
  test(`composition sample ${state} ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height }); await page.goto(`/docs/evidence/isolario-foundation/sample/index.html?state=${state}`);
    await page.locator(`img.${state}`).evaluate(async node => { await (node as HTMLImageElement).decode(); });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(height);
    expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
    await page.screenshot({ path: `${evidence}/sample/${state}-${width}x${height}.png`, animations: 'disabled' });
  });
}
