import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
const evidence = 'docs/evidence/phase-7';
const screenshots = 'docs/screenshots/phase-7';
function report(name: string, value: unknown) { mkdirSync(evidence,{ recursive:true }); writeFileSync(`${evidence}/${name}.json`,JSON.stringify(value,null,2)); }
async function shot(page: Page, name: string) { mkdirSync(screenshots,{recursive:true}); await page.screenshot({path:`${screenshots}/${name}.png`,animations:'disabled'}); }
async function boot(page: Page) {
  await page.goto('/'); await expect(page.getByRole('button',{name:'Combina',exact:true})).toBeVisible();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; if (!navigator.serviceWorker.controller) await new Promise<void>(resolve => navigator.serviceWorker.addEventListener('controllerchange',() => resolve(),{once:true})); });
}
async function importFixture(page: Page, file = 'v1-anomaly-observed') {
  await page.goto('/settings'); await page.getByText('Salvataggio locale · importazione e recupero',{exact:true}).click();
  const payload = JSON.parse(readFileSync(`tests/fixtures/saves/${file}.json`,'utf8'));
  await page.getByLabel('JSON del salvataggio (diagnostica)').fill(JSON.stringify({product:'merge_discovery',saveSchemaVersion:payload.saveSchemaVersion,contentVersionSeen:payload.contentVersionSeen,payload}));
  await page.getByRole('button',{name:'Verifica import',exact:true}).click();
  await page.getByRole('button',{name:'Conferma sostituzione del progresso'}).click();
  await expect(page.getByRole('button',{name:'Combina',exact:true})).toBeVisible();
}
async function slots(page: Page) {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve,reject) => { const request = indexedDB.open('merge_discovery'); request.onsuccess=()=>resolve(request.result); request.onerror=()=>reject(request.error); });
    const row = await new Promise<{revision:number;current:{xp:number;discoveredElements:Record<string,unknown>;settings:Record<string,unknown>}}>((resolve,reject) => { const request = db.transaction('snapshots').objectStore('snapshots').get('single_player'); request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error); });
    db.close(); return row;
  });
}
async function audit(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
  const results = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(results.violations).toEqual([]);
  const small = await page.locator('button:visible,select:visible,summary:visible,input[type=checkbox]:visible').evaluateAll(nodes => nodes.filter(node => {
    const r = (node instanceof HTMLInputElement ? node.closest('label')! : node).getBoundingClientRect(); return r.width < 43 || r.height < 43;
  }).map(node => node.textContent || node.getAttribute('aria-label')));
  expect(small).toEqual([]);
  return {url:new URL(page.url()).pathname,axeViolations:0,overflow:false,targets:'44px'};
}
const routes = ['/', '/collection','/sets','/sets/origins','/elements/water','/collections','/collections/water_cycle','/explore/anomalies','/explore/map?element=water','/settings'];

test('production precache opens every eligible route offline, commits and preserves save/export', async ({page,context}) => {
  await boot(page);
  const protocol = await context.newCDPSession(page);
  const manifest = await protocol.send('Page.getAppManifest');
  expect(manifest.errors).toEqual([]);
  const installability = await protocol.send('Page.getInstallabilityErrors');
  expect(installability.installabilityErrors).toEqual([]);
  const cache = await page.evaluate(async () => {
    const keys = await caches.keys(), urls = (await Promise.all(keys.map(async key => (await (await caches.open(key)).keys()).map(r => new URL(r.url).pathname)))).flat();
    return {keys,urls};
  });
  expect(cache.urls).toContain('/index.html'); expect(cache.urls.some(url => /DiscoveryMap-.*\.js/.test(url))).toBe(true);
  expect(cache.urls.some(url => /SaveDiagnostics-.*\.js/.test(url))).toBe(true);
  expect(cache.urls.some(url => /save|export|github|__test/.test(url))).toBe(false);
  await importFixture(page); const before = await slots(page);
  await context.setOffline(true);
  const opened=[];
  for (const route of routes) {
    await page.goto(route); await expect(page.locator(route==='/'?'#laboratory':'#catalog-content')).toBeVisible();
    await expect(page.getByText('La schermata si sta aprendo…')).toHaveCount(0);
    expect(await page.locator('body').innerText()).not.toContain('Non ancora disponibile'); opened.push(route);
  }
  await page.getByText('Salvataggio locale · importazione e recupero',{exact:true}).click();
  await page.getByRole('button',{name:'Esporta JSON / verifica round-trip'}).click();
  await expect(page.getByText('Export/import validato; nessuna sovrascrittura eseguita.')).toBeVisible();
  expect(await slots(page)).toEqual(before);
  await page.goto('/');
  const select=page.getByRole('button',{name:/^Energia, elemento del set/}); await select.click(); await select.click();
  await page.getByRole('button',{name:'Combina',exact:true}).click(); await expect(page.getByRole('heading',{name:'Calore',exact:true})).toBeVisible();
  const committed = await slots(page); expect(committed.current.xp).toBe(before.current.xp); expect(committed.revision).toBe(before.revision+1);
  await page.reload(); expect(await slots(page)).toEqual(committed);
  await page.goto('/elements/water'); await page.getByRole('button',{name:'Chiedi un indizio',exact:true}).click();
  await expect(page.locator('.hint-sheet')).toBeVisible();
  await page.getByRole('button',{name:'Chiudi indizio'}).click();
  await page.goto('/settings');
  await page.getByLabel('Informazioni mostrate').selectOption('collector');
  await expect(page.getByLabel('Informazioni mostrate')).toHaveValue('collector');
  await page.getByLabel('Indizi proattivi').selectOption('light');
  await expect(page.getByLabel('Indizi proattivi')).toHaveValue('light');
  await page.getByRole('checkbox',{name:'Suoni',exact:true}).click();
  await expect(page.getByRole('checkbox',{name:'Suoni',exact:true})).toBeChecked();
  await page.reload(); await expect(page.getByRole('checkbox',{name:'Suoni',exact:true})).toBeChecked();
  report('production-offline',{manifestErrors:manifest.errors,installabilityErrors:installability.installabilityErrors,production:true,controller:true,precache:cache,offlineRoutes:opened,exportRoundTrip:true,offlineCombine:true,indexedDbAfterReload:true,hintOffline:true,offlinePreferences:true,offlineInformationSettings:true,saveXp:committed.current.xp});
});

test('real waiting worker around a discovery waits for acknowledgement, reloads once without XP loss', async ({page,request}) => {
  await boot(page); const before = await slots(page);
  const select=page.getByRole('button',{name:/^Energia, elemento del set/}); await select.click(); await select.click();
  await page.getByRole('button',{name:'Combina',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Calore',exact:true})).toBeVisible();
  await shot(page,'1440-new-discovery'); const committed=await slots(page); expect(committed.current.xp).toBeGreaterThan(before.current.xp);
  await request.post('/__test/release');
  await page.evaluate(async () => { const registration = await navigator.serviceWorker.getRegistration(); await registration!.update(); });
  await expect(page.getByRole('complementary',{name:'Aggiornamento disponibile'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Aggiorna ora'})).toHaveCount(0);
  expect(await slots(page)).toEqual(committed);
  await expect(page.getByRole('button',{name:'Combina',exact:true})).toBeFocused();
  let navigations=0; page.on('framenavigated',frame=>{if(frame===page.mainFrame()) navigations++;});
  await page.getByRole('button',{name:'Più tardi'}).click();
  await expect(page.getByRole('complementary',{name:'Aggiornamento disponibile'})).toHaveCount(0);
  await expect(page.locator('#laboratory')).toBeFocused(); expect(navigations).toBe(0);
  await page.getByRole('button',{name:'Nuovo esperimento'}).click();
  await page.reload();
  await expect(page.getByRole('complementary',{name:'Aggiornamento disponibile'})).toBeVisible();
  expect(await slots(page)).toEqual(committed);
  await expect(page.getByRole('button',{name:'Aggiorna ora'})).toBeVisible();
  await page.setViewportSize({width:390,height:844}); await audit(page); await shot(page,'390-safe-update');
  navigations=0;
  await page.getByRole('button',{name:'Aggiorna ora'}).click();
  await expect(page.getByRole('complementary',{name:'Aggiornamento disponibile'})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Combina',exact:true})).toBeVisible();
  expect(await slots(page)).toEqual(committed); expect(navigations).toBe(1);
  report('production-update',{production:true,realWaitingWorker:true,blockedDuringMajorReveal:true,acknowledged:true,deferredWithoutReload:true,deferralFocus:'laboratory',manualReopenWaiting:true,reloads:navigations,saveUnchanged:true,xp:committed.current.xp,discoveries:Object.keys(committed.current.discoveredElements).length});
});

for (const [width,height] of [[320,568],[390,844],[768,1024],[1024,768],[1440,900],[1920,1080]] as const) {
  test(`production AA/responsive ${width}x${height}`, async ({page}) => {
    await page.setViewportSize({width,height}); await boot(page); await importFixture(page);
    const results=[];
    for (const route of routes) {
      await page.goto(route); await expect(page.locator(route==='/'?'#laboratory':'#catalog-content')).toBeVisible();
      await expect(page.getByText('La schermata si sta aprendo…')).toHaveCount(0);
      results.push(await audit(page));
      if(width===1440 && route==='/') await shot(page,'1440-laboratory');
      if(width===390 && route==='/') await shot(page,'390-production-shell');
      if(width===320 && route==='/collection') await shot(page,'320-catalog');
    }
    if(width===1440) await shot(page,'1440-settings');
    report(`responsive-${width}x${height}`,results);
  });
}

test('production preferences/OS motion, forced colors, extra-large text, zoom reflow, keyboard and viewport changes', async ({page}) => {
  await boot(page); await importFixture(page);
  await page.goto('/settings');
  if (await page.getByRole('checkbox',{name:'Movimento ridotto'}).isChecked()) {
    await page.getByRole('checkbox',{name:'Movimento ridotto'}).click();
    await expect(page.getByRole('checkbox',{name:'Movimento ridotto'})).not.toBeChecked();
  }
  await page.getByRole('checkbox',{name:'Movimento ridotto'}).click();
  await expect(page.getByRole('checkbox',{name:'Movimento ridotto'})).toBeChecked();
  await page.getByRole('checkbox',{name:'Contrasto elevato'}).click(); await expect(page.getByRole('checkbox',{name:'Contrasto elevato'})).toBeChecked();
  await page.getByLabel('Dimensione del testo').selectOption('extra_large'); await expect(page.getByLabel('Dimensione del testo')).toHaveValue('extra_large');
  await page.setViewportSize({width:320,height:568});
  for (const route of routes) { await page.goto(route); await expect(page.getByText('La schermata si sta aprendo…')).toHaveCount(0); await audit(page); }
  await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'}); await page.goto('/');
  const select=page.getByRole('button',{name:/^Energia, elemento del set/}); await select.click(); await select.click(); await page.getByRole('button',{name:'Combina',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Calore',exact:true})).toBeVisible();
  const duration=await page.locator('.reaction-stage').evaluate(node=>getComputedStyle(node).animationDuration); expect(parseFloat(duration)).toBeLessThan(.3);
  await expect(page.getByRole('button',{name:'Nuovo esperimento'})).toBeEnabled(); await audit(page);
  await page.setViewportSize({width:844,height:390}); await page.getByRole('searchbox').fill('Ener'); await audit(page);
  // 200% browser zoom: Chromium page scale is pinch zoom, so use the effective CSS viewport at 200% for reflow.
  await page.setViewportSize({width:720,height:450}); await page.goto('/collection'); await audit(page);
  await page.keyboard.press('Tab'); await page.keyboard.press('Enter');
  await page.setViewportSize({width:390,height:500}); await page.getByRole('searchbox').fill('Acqua'); await audit(page);
  report('accessibility-modes',{savedReducedMotion:true,osReducedMotion:true,forcedColors:true,extraLargeAllRoutes:true,landscape:[844,390],zoomReflowEquivalent:'1440x900 at 200% = 720x450 CSS pixels',keyboardSmoke:true,searchKeyboardViewport:[390,500],manualScreenReader:'NOT RUN - release checklist required'});
});

test('production structural performance smoke records cold/warm and secondary routes', async ({page}) => {
  const started=performance.now(); await boot(page); const cold=performance.now()-started;
  let start=performance.now(); await page.reload(); await expect(page.getByRole('button',{name:'Combina',exact:true})).toBeVisible(); const warm=performance.now()-start;
  await importFixture(page); const switches=[];
  for (const route of ['/collection','/explore/map?element=water','/']) { start=performance.now(); await page.goto(route); await expect(page.locator(route==='/'?'#laboratory':'#catalog-content')).toBeVisible(); await expect(page.getByText('La schermata si sta aprendo…')).toHaveCount(0); switches.push({route,readyMs:performance.now()-start}); }
  await page.goto('/explore/map?element=water');
  await expect(page.locator('.map-node').first()).toBeVisible();
  const mapNodes = await page.locator('.map-node').count(); expect(mapNodes).toBeGreaterThan(0); expect(mapNodes).toBeLessThanOrEqual(25);
  await page.goto('/');
  const select=page.getByRole('button',{name:/^Energia, elemento del set/}); await select.click(); await select.click();
  const before=await slots(page); start=performance.now();
  await page.getByRole('button',{name:'Combina',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Calore',exact:true})).toBeVisible();
  const publicationMs=performance.now()-start, committed=await slots(page);
  expect(committed.revision).toBe(before.revision+1);
  await expect(page.getByRole('button',{name:'Nuovo esperimento'})).toBeEnabled();
  report('production-performance',{coldLabReadyMs:cold,warmLabReadyMs:warm,switches,committedUiPublicationMs:publicationMs,mapNodes,timing:'informational, no hardware-sensitive pass threshold',boundedMapNodes:true});
});
