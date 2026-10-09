import { test, expect, type Page } from '@playwright/test';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
const evidence='docs/evidence/discovery-first';
const journey=JSON.parse(readFileSync('docs/evidence/isolario-foundation/journey.json','utf8')) as typeof import('../../docs/evidence/isolario-foundation/journey.json');
async function ready(page:Page) {
  await page.goto('/island');await expect(page.getByRole('button',{name:'Esperimento',exact:true})).toBeVisible();
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise<void>(r=>navigator.serviceWorker.addEventListener('controllerchange',()=>r(),{once:true}));});
}
async function stores(page:Page){return page.evaluate(async()=>{const db=await new Promise<IDBDatabase>(r=>{const q=indexedDB.open('merge_discovery');q.onsuccess=()=>r(q.result);});const read=(s:string,k:string)=>new Promise<unknown>(r=>{const q=db.transaction(s).objectStore(s).get(k);q.onsuccess=()=>r(q.result);});const [save,world]=await Promise.all([read('snapshots','single_player'),read('world_snapshots','first_island')]);db.close();return{save,world};});}
test('real production offline lazy scene, separate world commits, atlas and reload',async({page,context})=>{
  await ready(page);await page.goto('/settings');await page.getByText('Salvataggio locale · importazione e recupero',{exact:true}).click();
  const payload=journey.canonicalSave;
  await page.getByLabel('JSON del salvataggio (diagnostica)').fill(JSON.stringify({product:'merge_discovery',saveSchemaVersion:payload.saveSchemaVersion,contentVersionSeen:payload.contentVersionSeen,payload}));
  await page.getByRole('button',{name:'Verifica import',exact:true}).click();await page.getByRole('button',{name:'Conferma sostituzione del progresso'}).click();
  await expect(page.getByRole('button',{name:'Combina',exact:true})).toBeVisible();
  await context.setOffline(true);await page.locator('.world-entry:visible').click();await expect(page.getByRole('button',{name:'Esperimento',exact:true})).toBeVisible();
  const canonicalBefore=(await stores(page)).save;
  for(const [name,element] of [['Prepara il terreno','soil'],['Riempi il bacino','water'],['Colloca il seme','seed'],['Fai germogliare','sprout'],['Fai crescere l’albero','tree'],['Accogli una creatura','creature']]){
    await page.getByRole('button',{name:'Luoghi',exact:true}).click();await page.getByRole('button',{name,exact:true}).click();
    await page.locator('.proof-scene-actions button').filter({hasText:'Riva occidentale'}).click();
    await expect(page.locator(`[data-entity="${element}"]`)).toHaveCount(1);
  }
  const before=await stores(page);expect(before.save).toEqual(canonicalBefore);await page.getByRole('button',{name:'Atlante',exact:true}).click();
  await expect(page.getByRole('dialog').getByText('Una creatura ha trovato un habitat.')).toBeVisible();await page.keyboard.press('Escape');
  await page.reload();await expect(page.locator('[data-entity="tree"]')).toHaveCount(1);expect(await stores(page)).toEqual(before);
  await page.locator('.proof-prop img').evaluateAll(async imgs=>{await Promise.all(imgs.map(i=>(i as HTMLImageElement).decode()));});
  expect(await page.locator('.proof-prop img').evaluateAll(imgs=>imgs.every(i=>(i as HTMLImageElement).complete&&(i as HTMLImageElement).naturalWidth>0))).toBe(true);
  mkdirSync(evidence,{recursive:true});writeFileSync(`${evidence}/production-offline.json`,JSON.stringify({production:true,serviceWorker:true,offlineLazyRoute:true,offlineArt:true,canonicalFixture:'real application route, explicitly imported via UI',worldMutations:6,saveUnchanged:true,atlas:true,reload:true},null,2));
});
test('production waiting worker is blocked by primary discovery, then explicit update preserves world',async({page,request})=>{
  await ready(page);await page.getByRole('link',{name:'Scopri',exact:true}).click();
  await page.getByRole('button',{name:/^Vuoto, elemento del set/}).click();await page.getByRole('button',{name:/^Energia, elemento del set/}).click();await page.getByRole('button',{name:'Combina',exact:true}).click();
  await expect(page.locator('.reaction-stage h2')).toHaveText('Luce');await request.post('/__test/release');
  await page.evaluate(async()=>{await(await navigator.serviceWorker.getRegistration())!.update();});
  await expect(page.getByRole('complementary',{name:'Aggiornamento disponibile'})).toBeVisible();await expect(page.getByRole('button',{name:'Aggiorna ora'})).toHaveCount(0);
  await page.locator('.world-entry:visible').click();await page.getByRole('button',{name:'Luoghi',exact:true}).click();await page.getByRole('button',{name:'Illumina il cielo',exact:true}).click();await page.locator('.proof-scene-actions button').filter({hasText:'Riva occidentale'}).click();
  await expect(page.locator('[data-entity="light"]')).toHaveCount(1);const before=await stores(page);
  await expect(page.getByRole('button',{name:'Aggiorna ora'})).toBeVisible();let reloads=0;page.on('framenavigated',f=>{if(f===page.mainFrame())reloads++;});await page.getByRole('button',{name:'Aggiorna ora'}).click();
  await expect(page.locator('[data-entity="light"]')).toHaveCount(1);await expect(page.getByRole('complementary',{name:'Aggiornamento disponibile'})).toHaveCount(0);
  expect(reloads).toBe(1);expect(await stores(page)).toEqual(before);mkdirSync(evidence,{recursive:true});writeFileSync(`${evidence}/production-update.json`,JSON.stringify({realWaitingWorker:true,blockedDuringNewDiscovery:true,explicitUpdate:true,reloads,worldAndSaveUnchanged:true,primaryDiscovery:true},null,2));
});
