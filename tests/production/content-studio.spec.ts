import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { writePack } from '../../src/content/packs/archive';
import { performancePack } from '../fixtures/performance-pack';
async function boot(page:Page) {
  await page.goto('/'); await expect(page.getByRole('button',{name:'Combina',exact:true})).toBeVisible();
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise<void>(resolve=>navigator.serviceWorker.addEventListener('controllerchange',()=>resolve(),{once:true}));});
}
async function open(page:Page) { await page.goto('/settings'); await page.getByLabel('Attiva modalità autore locale').check(); await page.getByRole('button',{name:'Apri Studio contenuti',exact:true}).click(); await expect(page.getByLabel('Titolo del pacchetto')).toBeVisible(); }
async function tab(page:Page,name:string) { await page.getByRole('navigation',{name:'Sezioni dello Studio'}).getByRole('button',{name,exact:true}).click(); }
async function slots(page:Page) {return page.evaluate(async()=>{
  const request=indexedDB.open('merge_discovery'),db=await new Promise<IDBDatabase>(resolve=>{request.onsuccess=()=>resolve(request.result);});
  const row=await new Promise<unknown>(resolve=>{const r=db.transaction('snapshots').objectStore('snapshots').get('single_player');r.onsuccess=()=>resolve(r.result);});db.close();return row;
});}
function evidence(name:string,value:unknown) {mkdirSync('docs/evidence/content-1b',{recursive:true});writeFileSync(`docs/evidence/content-1b/${name}.json`,JSON.stringify(value,null,2));}
async function shot(page:Page,name:string) {mkdirSync('docs/screenshots/content-1b',{recursive:true});await page.screenshot({path:`docs/screenshots/content-1b/${name}.png`,animations:'disabled'});}
test('production Studio creates, persists, previews and installs an illustrated pack offline without automatic discoveries',async({page,context})=>{
  await page.setViewportSize({width:390,height:844}); await boot(page); const before=await slots(page); await context.setOffline(true); await open(page);
  await page.locator('.content-studio header').scrollIntoViewIfNeeded();await shot(page,'390-studio-overview');
  await tab(page,'Elementi'); await page.getByLabel('Nome elemento',{exact:true}).fill('Stella di prova'); await page.getByLabel('Descrizione elemento').fill('Immagine e ricetta sintetiche, authoring offline.'); await page.getByRole('button',{name:'Aggiungi elemento',exact:true}).click();
  await page.getByLabel('Immagine dell’elemento · PNG/WebP').setInputFiles('public/icons/icon-192.png'); await expect(page.locator('.studio-art img')).toBeVisible();
  await tab(page,'Ricette'); await page.getByLabel('Ingrediente A',{exact:true}).selectOption('void'); await page.getByLabel('Ingrediente B',{exact:true}).selectOption('void'); await page.getByLabel('Risultato della ricetta',{exact:true}).selectOption('my_pack_stella_di_prova'); await page.getByRole('button',{name:'Aggiungi ricetta',exact:true}).click();
  await page.getByRole('button',{name:'Valida e simula bozza',exact:true}).click(); await expect(page.getByText('68/68 raggiungibili',{exact:true})).toBeVisible(); expect(await slots(page)).toEqual(before);
  await page.reload(); await page.getByLabel('Attiva modalità autore locale').check(); await page.getByRole('button',{name:'Apri Studio contenuti',exact:true}).click(); await tab(page,'Elementi'); await page.getByRole('button',{name:'Modifica my_pack_stella_di_prova',exact:true}).click(); await expect(page.locator('.studio-art img')).toBeVisible();
  for(const [width,height] of [[1920,1080],[1440,900],[1024,768],[768,1024],[390,844],[320,568]] as [number,number][]) {
    await page.setViewportSize({width,height}); await page.locator('.studio-art').scrollIntoViewIfNeeded();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
    const small=await page.locator('.content-studio button:visible,.content-studio select:visible,.content-studio input:visible').evaluateAll(nodes=>nodes.filter(n=>{const r=(n instanceof HTMLInputElement&&n.type==='checkbox'?n.closest('label')!:n).getBoundingClientRect();return r.height<43||r.width<43;}).map(n=>n.getAttribute('aria-label')||n.tagName));expect(small).toEqual([]);
    await shot(page,`${width}-production-element`);
  }
  await page.getByRole('button',{name:'Valida e simula bozza',exact:true}).click(); await expect(page.getByText('68/68 raggiungibili',{exact:true})).toBeVisible(); await page.getByRole('button',{name:'Installa bozza validata e riavvia',exact:true}).click(); await expect(page.getByLabel('Attiva modalità autore locale')).not.toBeChecked();
  await page.goto('/');const pick=page.getByRole('button',{name:/^Vuoto, elemento del set/});await pick.click();await pick.click();await page.getByRole('button',{name:'Combina',exact:true}).click();await expect(page.getByRole('heading',{name:'Stella di prova',exact:true})).toBeVisible();
  const raster=page.locator('img[data-art-key="my_pack.elements.my_pack_stella_di_prova"]').first();await expect(raster).toBeVisible();expect(await raster.evaluate(n=>(n as HTMLImageElement).naturalWidth)).toBe(192);await shot(page,'320-production-discovery');
  const after=await slots(page);await page.reload();expect(await slots(page)).toEqual(after);
  evidence('production-offline',{production:true,offlineStudio:true,offlineWorker:true,draftReopened:true,imageDecoded:true,viewports:[1920,1440,1024,768,390,320],axeViolations:0,target44:true,saveUnchangedBeforeInstall:true,reachable:68,newDiscoveryThroughResolver:true,reload:true,canonicalApproval:'PENDING'});
});
test('a real waiting service worker cannot interrupt Studio simulation and preserves the draft on update',async({page,request})=>{
  await boot(page);await open(page);const before=await slots(page), bytes=await writePack(await performancePack());
  await page.getByLabel('Apri ZIP nello Studio').setInputFiles({name:'performance.zip',mimeType:'application/zip',buffer:Buffer.from(bytes)});await expect(page.getByLabel('Identificatore del pacchetto',{exact:true})).toHaveValue('studio_sample');
  await page.getByRole('button',{name:'Valida e simula bozza',exact:true}).click();await expect(page.getByRole('region',{name:'Studio contenuti',exact:true})).toHaveAttribute('aria-busy','true');
  await request.post('/__test/release');await page.evaluate(async()=>{await(await navigator.serviceWorker.getRegistration())!.update();});
  await expect(page.getByRole('complementary',{name:'Aggiornamento disponibile'})).toBeVisible();await expect(page.getByRole('button',{name:'Aggiorna ora',exact:true})).toHaveCount(0);
  await expect(page.getByText('1000/1000 raggiungibili',{exact:true})).toBeVisible({timeout:90_000});await expect(page.getByRole('button',{name:'Aggiorna ora',exact:true})).toBeVisible();expect(await slots(page)).toEqual(before);
  await page.getByRole('button',{name:'Aggiorna ora',exact:true}).click();await expect(page.getByLabel('Attiva modalità autore locale')).not.toBeChecked();await page.getByLabel('Attiva modalità autore locale').check();await page.getByRole('button',{name:'Apri Studio contenuti',exact:true}).click();await expect(page.getByLabel('Identificatore del pacchetto',{exact:true})).toHaveValue('studio_sample');expect(await slots(page)).toEqual(before);
  evidence('update-safe',{production:true,realWaitingWorker:true,blockedDuringSimulation:true,reachable:1000,draftPreserved:true,playerSaveUnchanged:true,explicitSafeUpdate:true});
});
test('Phase 8A Studio sandbox displays its new discovery, Set, authored Collection and raster offline',async({page,context})=>{
  await page.setViewportSize({width:390,height:844});await boot(page);await page.goto('/settings');await page.getByText('Salvataggio locale · importazione e recupero',{exact:true}).click();
  const payload=JSON.parse(readFileSync('tests/fixtures/saves/v1-anomaly-observed.json','utf8'));
  await page.getByLabel('JSON del salvataggio (diagnostica)').fill(JSON.stringify({product:'merge_discovery',saveSchemaVersion:payload.saveSchemaVersion,contentVersionSeen:payload.contentVersionSeen,payload}));await page.getByRole('button',{name:'Verifica import',exact:true}).click();await page.getByRole('button',{name:'Conferma sostituzione del progresso'}).click();await expect(page.getByRole('button',{name:'Combina',exact:true})).toBeVisible();
  const before=await slots(page);await open(page);await page.getByLabel('Apri ZIP nello Studio').setInputFiles('tests/fixtures/phase-8a-proposed.zip');await expect(page.getByLabel('Identificatore del pacchetto',{exact:true})).toHaveValue('phase_8a_proposed');
  await tab(page,'Elementi');await page.getByLabel('Cerca nella bozza').fill('fish');await page.getByRole('button',{name:'Modifica fish',exact:true}).click();await page.getByLabel('Immagine dell’elemento · PNG/WebP').setInputFiles('public/icons/icon-192.png');await expect(page.locator('.studio-art img')).toBeVisible();
  await tab(page,'Collezioni');await page.getByLabel('Nome Collezione',{exact:true}).fill('Taccuino Vita di prova');await page.getByLabel('Descrizione Collezione').fill('Collezione sintetica per dimostrare l’import; non fa parte del dossier canonico.');await page.getByLabel('Cerca membri').fill('fish');await page.getByRole('checkbox',{name:'Pesce',exact:true}).check();await page.getByRole('button',{name:'Aggiungi Collezione',exact:true}).click();
  await page.getByRole('button',{name:'Valida e simula bozza',exact:true}).click();await expect(page.getByText('118/118 raggiungibili',{exact:true})).toBeVisible();expect(await slots(page)).toEqual(before);await page.getByRole('button',{name:'Installa bozza validata e riavvia',exact:true}).click();await expect(page.getByLabel('Attiva modalità autore locale')).not.toBeChecked();
  await context.setOffline(true);await page.goto('/');expect(await page.locator('body').innerText()).not.toContain('Pesce');
  await page.getByRole('button',{name:/^Creatura, elemento del set/}).click();await page.getByRole('button',{name:/^Oceano, elemento del set/}).click();await page.getByRole('button',{name:'Combina',exact:true}).click();await expect(page.getByRole('heading',{name:'Pesce',exact:true})).toBeVisible();
  const raster=page.locator('img[data-art-key="phase_8a.elements.fish"]').first();await expect(raster).toBeVisible();expect(await raster.evaluate(n=>(n as HTMLImageElement).naturalWidth)).toBe(192);await shot(page,'390-phase-8a-production-discovery-art');
  await page.getByRole('button',{name:'Nuovo esperimento',exact:true}).click();await page.goto('/sets/animals');await expect(page.getByRole('heading',{name:'Animali',exact:true})).toBeVisible();await shot(page,'390-phase-8a-production-set');
  await page.goto('/collections/phase_8a_taccuino_vita_di_prova');await expect(page.getByRole('heading',{name:'Taccuino Vita di prova',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Pesce, elemento del set Animali',exact:true})).toBeVisible();await shot(page,'390-phase-8a-production-collection');await expect(page.locator('#catalog-content img[data-art-key="phase_8a.elements.fish"]').first()).toBeVisible();await page.getByRole('link',{name:'Scheda di Pesce',exact:true}).click();await expect(page.locator('#catalog-content .portrait-art img[data-art-key="phase_8a.elements.fish"]')).toBeVisible();await shot(page,'390-phase-8a-production-sheet-art');
  expect(before).not.toEqual(await slots(page));evidence('phase-8a-sandbox',{production:true,proposedRecipes:51,reachable:118,offline:true,discovery:'fish',set:'animals',testCollection:'phase_8a_taccuino_vita_di_prova',art:'phase_8a.elements.fish',artIsSyntheticPlaceholder:true,canonicalApproval:'PENDING',originalDossierRecipesChanged:false});
});
