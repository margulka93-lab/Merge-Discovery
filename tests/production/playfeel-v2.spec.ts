import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
test('production table: offline commits/replays/reload, drag-safe waiting update and nonmodal reveal',async({page,context,request})=>{
  await page.goto('/'); await expect(page.getByRole('button',{name:'Tavolo libero',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.evaluate(async()=>{await navigator.serviceWorker.ready; if(!navigator.serviceWorker.controller) await new Promise<void>(resolve=>navigator.serviceWorker.addEventListener('controllerchange',()=>resolve(),{once:true}));});
  const stored=()=>page.evaluate(async()=>{
    const db=await new Promise<IDBDatabase>((resolve,reject)=>{const q=indexedDB.open('merge_discovery');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});
    const value=await new Promise<{revision:number;current:{xp:number;discoveredElements:Record<string,unknown>}}>((resolve,reject)=>{const q=db.transaction('snapshots').objectStore('snapshots').get('single_player');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});db.close();return value;
  });
  const energy=page.getByRole('button',{name:/^Energia, elemento del set/});
  await context.setOffline(true); await energy.click(); await energy.click(); await page.getByRole('button',{name:'Combina figure',exact:true}).click();
  const figure=page.locator('.table-figure[data-element="heat"]'); await expect(figure).toHaveCount(1); const committed=await stored();
  mkdirSync('docs/screenshots/playfeel-v2',{recursive:true});
  for(const [width,height] of [[1440,900],[390,844],[320,568]]) { await page.setViewportSize({width:width!,height:height!}); await page.screenshot({path:`docs/screenshots/playfeel-v2/${width}-production-new-discovery.png`}); }
  await page.setViewportSize({width:1440,height:900});
  await energy.click(); await energy.click(); await page.getByRole('button',{name:'Combina figure',exact:true}).click(); await expect(figure).toHaveCount(2); expect(await stored()).toEqual(committed);
  mkdirSync('docs/screenshots/playfeel-v2',{recursive:true}); await page.screenshot({path:'docs/screenshots/playfeel-v2/1440-production-known-replay.png'});
  await page.reload(); await expect(page.getByRole('button',{name:/^Calore, elemento del set/})).toBeVisible(); expect(await stored()).toEqual(committed); await context.setOffline(false);
  await energy.click(); const a=await page.locator('.table-figure').boundingBox(); await page.mouse.move(a!.x+35,a!.y+35); await page.mouse.down();
  await request.post('/__test/release'); await page.evaluate(async()=>{await(await navigator.serviceWorker.getRegistration())!.update();});
  await expect(page.getByRole('complementary',{name:'Aggiornamento disponibile'})).toBeVisible(); await expect(page.getByRole('button',{name:'Aggiorna ora'})).toHaveCount(0);
  await page.mouse.up(); await expect(page.getByRole('button',{name:'Aggiorna ora'})).toBeVisible();
  await page.getByRole('button',{name:'Più tardi'}).click();
  // Releasing a stationary press toggles the first figure off; select it again.
  await page.locator('.table-figure[data-element="energy"]').click();
  await energy.click(); await page.getByRole('button',{name:'Combina figure',exact:true}).click(); await expect(page.locator('.table-figure[data-element="heat"]')).toHaveCount(1);
  // A table discovery never needs a Continue/reset popup. Its short reveal becomes update-safe automatically.
  await expect(page.getByRole('button',{name:'Nuovo esperimento',exact:true})).toHaveCount(0);
  await page.reload(); await expect(page.getByRole('button',{name:'Aggiorna ora'})).toBeVisible();
  const beforeUpdate=await stored(); await page.getByRole('button',{name:'Aggiorna ora'}).click(); await expect(page.getByRole('button',{name:'Tavolo libero',exact:true})).toBeVisible(); expect(await stored()).toEqual(beforeUpdate);
  mkdirSync('docs/evidence/playfeel-v2',{recursive:true}); writeFileSync('docs/evidence/playfeel-v2/production-offline-update.json',JSON.stringify({production:true,offline:true,knownReplaySaveUnchanged:true,discoveryPersistsOnReload:true,realWaitingWorker:true,blockedDuringDrag:true,explicitUpdateSaveUnchanged:true,tableLayoutLocal:true,humanApproval:'PENDING'},null,2));
});
