import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
const route = JSON.parse(readFileSync('docs/evidence/isolario-architecture/canonical-path.json','utf8')) as { steps: { inputs: string[]; result: string }[] };
const evidence = 'docs/evidence/isolario-proof';
test.use({ video: 'on' });
const anchors: Record<string,string> = { light:'sky',heat:'ridge',lava:'ridge',rock:'ridge',soil:'patch',water:'basin',ocean:'coast',seed:'patch',sprout:'patch',tree:'patch',creature:'inhabitant' };
async function combine(page: Page, a: string, b: string, keyboard = false, touch = false) {
  await page.getByRole('button',{name:'Essenze',exact:true}).click();
  for (const id of [a,b]) { const button = page.locator(`[data-essence="${id}"]`); if (keyboard) { await button.focus(); await page.keyboard.press('Enter'); } else if (touch) await button.tap(); else await button.click(); }
  await page.getByRole('button',{name:'Combina essenze',exact:true}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0); await expect(page.getByRole('complementary',{name:'Risultato esperimento'})).toBeVisible();
}
async function capture(page: Page, name: string) {
  await page.locator('.proof-base').evaluate(async img => (img as HTMLImageElement).decode());
  await page.locator('.proof-prop img').evaluateAll(async imgs=>{await Promise.all(imgs.map(i=>(i as HTMLImageElement).decode()));});
  await page.screenshot({path:`${evidence}/${name}.png`,animations:'disabled'});
}
async function readStores(page: Page) {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>(resolve => {const r=indexedDB.open('merge_discovery');r.onsuccess=()=>resolve(r.result);});
    const read = (store:string,id:string) => new Promise<unknown>(resolve => {const r=db.transaction(store).objectStore(store).get(id);r.onsuccess=()=>resolve(r.result);});
    const [save,world] = await Promise.all([read('snapshots','single_player'),read('world_snapshots','first_island')]);db.close();return {save,world};
  });
}
for (const [width,height] of [[1440,900],[390,844]] as const) {
  test.describe(`device ${width}`, () => {
  test.use({hasTouch:width===390});
  test(`playable concept loop ${width}x${height}`, async ({page}) => {
    mkdirSync(evidence,{recursive:true});await page.setViewportSize({width,height});await page.goto('/island');
    await expect(page.getByRole('button',{name:'Essenze',exact:true})).toBeVisible();
    await expect(page.getByRole('button',{name:'Atlante',exact:true})).toHaveCount(0);
    await capture(page,`initial-${width}x${height}`);
    if (width === 1440) { await page.setViewportSize({width:320,height:568}); await capture(page,'initial-320x568'); await page.setViewportSize({width,height}); }
    for (const [i,step] of route.steps.entries()) {
      await combine(page,step.inputs[0]!,step.inputs[1]!,width===1440,width===390);
      if (anchors[step.result]) {
        await page.getByRole('button',{name:'Manifesta',exact:true}).click();
        const target = page.locator('.proof-scene-actions button').filter({hasText:'Riva occidentale'});
        if (width===390) await target.tap(); else { await target.focus(); await page.keyboard.press('Enter'); }
        await expect(page.locator(`[data-entity="${step.result}"]`)).toHaveCount(1);
      } else await page.getByRole('button',{name:'Chiudi risultato'}).click();
      if (i===13) await capture(page,`intermediate-${width}x${height}`);
    }
    const before = await readStores(page); await capture(page,`transformed-${width}x${height}`);
    const aa = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze(); expect(aa.violations).toEqual([]);
    if (width === 1440) { await page.setViewportSize({width:320,height:568}); await capture(page,'transformed-320x568'); expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]); await page.setViewportSize({width,height}); }
    await page.getByRole('button',{name:'Atlante',exact:true}).click();await expect(page.getByRole('dialog').getByText('Una creatura ha trovato un habitat.')).toBeVisible();
    await capture(page,`atlas-${width}x${height}`);expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
    if (width === 1440) { await page.setViewportSize({width:320,height:568}); await capture(page,'atlas-320x568'); await page.setViewportSize({width,height}); }
    await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Atlante',exact:true})).toBeFocused();
    await combine(page,'void','energy');await page.getByRole('button',{name:'Chiudi risultato'}).click();expect(await readStores(page)).toEqual(before);
    await page.reload();await expect(page.locator('[data-entity="tree"]')).toHaveCount(1);expect(await readStores(page)).toEqual(before);
    await page.getByRole('link',{name:'Laboratorio',exact:true}).click();await expect(page.getByRole('button',{name:'Combina',exact:true})).toBeVisible();
    writeFileSync(`${evidence}/loop-${width}.json`,JSON.stringify({desktopKeyboard:width===1440,mobileEmulation:width===390,physicalPhone:false,canonicalDiscoveries:20,worldCommits:11,mutationKinds:3,replayNoWrite:true,reload:true,atlasFocusReturn:true,axeAA:true,legacyLab:true,stores:before},null,2));
    const video = page.video(); await page.close(); await video?.saveAs(`${evidence}/capture-${width}.webm`);
  });
  });
}
test('small screen, landscape, text, forced colors, no spoilers and explicit east placement', async ({page}) => {
  await page.goto('/island');await combine(page,'void','energy');await page.getByRole('button',{name:'Manifesta',exact:true}).click();
  await page.locator('.proof-scene-actions button').filter({hasText:'Riva orientale'}).click();await expect(page.locator('[data-entity="light"]')).toHaveCount(1);
  for (const [width,height] of [[320,568],[844,390],[768,1024],[1024,768],[1920,1080]]) {
    await page.setViewportSize({width:width!,height:height!});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
    for (const button of await page.locator('.proof-dock button').all()) {const b=await button.boundingBox();expect(b!.height).toBeGreaterThanOrEqual(44);expect(b!.y+b!.height).toBeLessThanOrEqual(height!);}
  }
  await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});await page.getByRole('button',{name:'Essenze',exact:true}).click();
  expect(await page.locator('[data-essence]').count()).toBe(5);await expect(page.getByRole('dialog')).not.toContainText('Creatura');
  await page.keyboard.press('Escape');await page.evaluate(()=>document.querySelector<HTMLElement>('.island-proof')!.style.fontSize='200%');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(1920);
  await page.setViewportSize({width:320,height:568});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(320);
  await page.getByRole('button',{name:'Essenze',exact:true}).click();
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  await page.getByRole('searchbox').fill('Luce');await expect(page.locator('[data-essence]')).toHaveCount(1);
  await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Essenze',exact:true})).toBeFocused();
});
test('UI world failure keeps discovery, explicit retry and waiting update guards the commit', async ({page}) => {
  await page.goto('/island'); await combine(page,'void','energy');
  await page.evaluate(async()=>{const url='/src/app/islandRuntime.ts';const {islandRuntime}=await import(url);const app=islandRuntime().session.world;
    const original=app.repository.commit.bind(app.repository);app.repository.commit=async()=>{throw new Error('quota-test');};
    Object.assign(window,{restoreWorldCommit:()=>{app.repository.commit=original;}});
    const updatesUrl='/src/platform/pwa/updates.ts';const {updates}=await import(updatesUrl);updates.offer({postMessage:()=>{}});
  });
  await expect(page.getByRole('button',{name:'Aggiorna ora'})).toHaveCount(0);
  await page.getByRole('button',{name:'Manifesta',exact:true}).click(); await page.locator('.proof-scene-actions button').filter({hasText:'Riva occidentale'}).click();
  await expect(page.getByRole('alert')).toBeVisible(); await expect(page.locator('[data-entity="light"]')).toHaveCount(0);
  await page.evaluate(()=>{(window as unknown as {restoreWorldCommit:()=>void}).restoreWorldCommit();});
  await page.getByRole('button',{name:'Ricarica progresso'}).click();await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByRole('button',{name:'Luoghi',exact:true}).click();await page.getByRole('button',{name:'Illumina il cielo',exact:true}).click();
  await page.locator('.proof-scene-actions button').filter({hasText:'Riva occidentale'}).click();await expect(page.locator('[data-entity="light"]')).toHaveCount(1);
  const row=(await readStores(page)).save as {current:{xp:number}};expect(row.current.xp).toBe(100);
});
