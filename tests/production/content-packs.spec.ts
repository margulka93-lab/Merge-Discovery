import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { performancePack } from '../fixtures/performance-pack';
import { writePack } from '../../src/content/packs/archive';
async function boot(page: Page) {
  await page.goto('/'); await expect(page.getByRole('button',{name:'Combina',exact:true})).toBeVisible();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; if (!navigator.serviceWorker.controller) await new Promise<void>(resolve => navigator.serviceWorker.addEventListener('controllerchange',() => resolve(),{once:true})); });
}
async function author(page: Page) {
  await page.goto('/settings'); await page.getByLabel('Attiva modalità autore locale').check();
  await expect(page.getByLabel('Pacchetto ZIP')).toBeVisible();
}
async function slots(page: Page) {
  return page.evaluate(async () => {
    const request = indexedDB.open('merge_discovery'); const db = await new Promise<IDBDatabase>(resolve => { request.onsuccess = () => resolve(request.result); });
    const row = await new Promise<{ revision:number; current:{xp:number;discoveredElements:Record<string,unknown>;discoveredRecipeIds:string[];contentVersionSeen:string} }>(resolve => { const r = db.transaction('snapshots').objectStore('snapshots').get('single_player'); r.onsuccess = () => resolve(r.result); }); db.close(); return row;
  });
}
async function install(page: Page, file: string, count: string) {
  await author(page); await page.getByLabel('Pacchetto ZIP').setInputFiles(file);
  await expect(page.getByText(`${count} raggiungibili`,{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Installa pacchetto e riavvia'}).click();
  await expect(page.getByLabel('Attiva modalità autore locale')).not.toBeChecked();
}
async function shot(page: Page, name: string) { mkdirSync('docs/screenshots/content-1a',{recursive:true}); await page.screenshot({path:`docs/screenshots/content-1a/${name}.png`,animations:'disabled'}); }
async function audit(page: Page) { expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width); expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]); }
test('production ZIP offline preview/install/reload/render/export keeps canonical save and prevents unsafe rollback', async ({page,context}) => {
  await boot(page); const before = await slots(page); await author(page);
  await context.setOffline(true); await page.getByLabel('Pacchetto ZIP').setInputFiles('tests/fixtures/studio-sample.zip');
  await expect(page.getByText('68/68 raggiungibili',{exact:true})).toBeVisible(); await audit(page); await shot(page,'1440-preview');
  const download = page.waitForEvent('download'); await page.getByRole('button',{name:'Esporta report'}).click(); expect((await download).suggestedFilename()).toBe('studio_sample-report.json');
  await page.getByRole('button',{name:'Installa pacchetto e riavvia'}).click(); await expect(page.getByLabel('Attiva modalità autore locale')).not.toBeChecked();
  const after = await slots(page); expect(after.current.xp).toBe(before.current.xp); expect(after.current.discoveredElements).toEqual(before.current.discoveredElements); expect(after.current.discoveredRecipeIds).toEqual(before.current.discoveredRecipeIds); expect(after.current.contentVersionSeen).toBe('0.3.0');
  await page.goto('/'); const voidButton = page.getByRole('button',{name:/^Vuoto, elemento del set/}); await voidButton.click(); await voidButton.click(); await page.getByRole('button',{name:'Combina',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Scintilla di prova',exact:true})).toBeVisible();
  const image = page.locator('img[data-art-key="studio_sample.spark"]').first(); await expect(image).toBeVisible(); expect(await image.evaluate(n => (n as HTMLImageElement).naturalWidth)).toBe(192);
  await shot(page,'1440-new-element-art'); await page.getByRole('button',{name:'Nuovo esperimento',exact:true}).click();
  const committed = await slots(page); await page.reload(); expect((await slots(page)).current).toEqual(committed.current);
  await author(page); await page.getByRole('button',{name:'Disattiva studio_sample'}).click(); await expect(page.getByRole('alert')).toContainText('salvataggio usa'); expect((await slots(page)).current).toEqual(committed.current);
  const zip = page.waitForEvent('download'); await page.getByRole('button',{name:'Esporta studio_sample',exact:true}).click(); expect((await zip).suggestedFilename()).toBe('studio_sample.zip');
  await page.goto('/sets/studio_sample'); await expect(page.getByRole('heading',{name:'Studio di prova',exact:true})).toBeVisible(); await shot(page,'1440-imported-set');
  // Keep the canonical first-session disclosure: Collections require three non-starter discoveries.
  await page.goto('/');
  for (const pair of [['Energia','Energia'],['Vuoto','Energia']]) {
    for (const name of pair) await page.getByRole('button',{name:new RegExp(`^${name}, elemento del set`)}).click();
    await page.getByRole('button',{name:'Combina',exact:true}).click(); await page.getByRole('button',{name:'Nuovo esperimento',exact:true}).click();
  }
  await page.goto('/collections/studio_sample_collection'); await expect(page.getByRole('heading',{name:'Taccuino di prova',exact:true})).toBeVisible(); await shot(page,'1440-imported-collection');
  mkdirSync('docs/evidence/content-1a',{recursive:true}); writeFileSync('docs/evidence/content-1a/offline.json',JSON.stringify({production:true,offlinePreviewWorker:true,atomicInstall:true,reload:true,imageDecoded192:true,newSet:true,newCollection:true,export:true,unsafeRollbackBlocked:true,noAutomaticDiscovery:true,seed:67},null,2));
});
test('stale tab cannot commit with an older ContentIndex after another tab activates a pack', async ({page,context}) => {
  await boot(page); const older = await context.newPage(); await boot(older); const before = await slots(page);
  await install(page,'tests/fixtures/studio-sample.zip','68/68');
  const energy = older.getByRole('button',{name:/^Energia, elemento del set/}); await energy.click(); await energy.click(); await older.getByRole('button',{name:'Combina',exact:true}).click();
  await expect(older.getByRole('alert')).toContainText('salvataggio è cambiato');
  expect((await slots(page)).current.xp).toBe(before.current.xp);
  await older.getByRole('button',{name:'Ricarica l’osservatorio'}).click(); await expect(older.getByRole('button',{name:'Combina',exact:true})).toBeVisible();
});
test('Phase 8A proposals install only in a test browser; imported content stays hidden until discovered, mobile responsive', async ({page,context}) => {
  await page.setViewportSize({width:390,height:844}); await boot(page); await author(page);
  await page.getByText('Salvataggio locale · importazione e recupero',{exact:true}).click();
  const payload = JSON.parse(readFileSync('tests/fixtures/saves/v1-anomaly-observed.json','utf8'));
  await page.getByLabel('JSON del salvataggio (diagnostica)').fill(JSON.stringify({product:'merge_discovery',saveSchemaVersion:payload.saveSchemaVersion,contentVersionSeen:payload.contentVersionSeen,payload}));
  await page.getByRole('button',{name:'Verifica import',exact:true}).click(); await page.getByRole('button',{name:'Conferma sostituzione del progresso'}).click(); await expect(page.getByRole('button',{name:'Combina',exact:true})).toBeVisible();
  await author(page); await page.getByLabel('Pacchetto ZIP').setInputFiles('tests/fixtures/phase-8a-proposed.zip'); await expect(page.getByText('118/118 raggiungibili',{exact:true})).toBeVisible();
  await page.getByText('Percorso, colli di bottiglia e terminali',{exact:true}).click(); await audit(page); await shot(page,'390-phase-8a-preview');
  const before = await slots(page); await page.getByRole('button',{name:'Installa pacchetto e riavvia'}).click(); await expect(page.getByLabel('Attiva modalità autore locale')).not.toBeChecked();
  expect((await slots(page)).current.discoveredElements).toEqual(before.current.discoveredElements);
  await context.setOffline(true); await page.goto('/'); expect(await page.locator('body').innerText()).not.toContain('Pesce');
  await page.getByRole('button',{name:/^Creatura, elemento del set/}).click(); await page.getByRole('button',{name:/^Oceano, elemento del set/}).click(); await page.getByRole('button',{name:'Combina',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Pesce',exact:true})).toBeVisible(); await shot(page,'390-phase-8a-first-discovery');
  await page.getByRole('button',{name:'Nuovo esperimento',exact:true}).click(); await page.goto('/sets/animals'); await expect(page.getByRole('heading',{name:'Animali',exact:true})).toBeVisible(); await audit(page); await shot(page,'390-phase-8a-animals');
  await page.setViewportSize({width:320,height:568}); await author(page); await page.getByLabel('Pacchetto ZIP').setInputFiles({name:'bad.zip',mimeType:'application/zip',buffer:Buffer.from('invalid')}); await expect(page.getByRole('alert')).toContainText('ZIP'); await audit(page); await shot(page,'320-error-preserves-content');
});
test('1,000-element runtime preview runs in a worker while the production UI remains responsive', async ({page}) => {
  await boot(page); await author(page);
  await page.evaluate(() => { const meter = {frames:0,running:true}; Object.assign(window,{packMeter:meter}); const tick = () => { if (meter.running) { meter.frames++; requestAnimationFrame(tick); } }; requestAnimationFrame(tick); });
  const start = Date.now(); await page.getByLabel('Pacchetto ZIP').setInputFiles({name:'performance.zip',mimeType:'application/zip',buffer:Buffer.from(await writePack(await performancePack()))});
  await expect(page.getByText('1000/1000 raggiungibili',{exact:true})).toBeVisible({timeout:90_000});
  const meter = await page.evaluate(() => { const m = (window as unknown as {packMeter:{frames:number;running:boolean}}).packMeter; m.running=false; return m.frames; });
  expect(meter).toBeGreaterThan(30); expect((await slots(page)).current.contentVersionSeen).toBe('0.1.0');
  mkdirSync('docs/evidence/content-1a',{recursive:true}); writeFileSync('docs/evidence/content-1a/worker-1000.json',JSON.stringify({production:true,total:1000,reachable:1000,previewMs:Date.now()-start,animationFrames:meter,installed:false},null,2));
});
