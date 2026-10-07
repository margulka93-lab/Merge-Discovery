import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
const directory = 'docs/screenshots/phase-7-5c';
const routes = [
  ['/explore/map?element=water', 'map', 'Mappa delle scoperte'],
  ['/explore/anomalies', 'anomalies', 'Archivio anomalie'],
  ['/settings', 'settings', 'Impostazioni'],
] as const;
test('Phase 7.5C production observatory visual cohesion and accessible constellation', async ({ page }) => {
  test.setTimeout(240000);
  await page.goto('/settings');
  await page.getByText('Salvataggio locale · importazione e recupero', { exact: true }).click();
  const payload = JSON.parse(readFileSync('tests/fixtures/saves/v1-anomaly-observed.json', 'utf8'));
  await page.getByLabel('JSON del salvataggio (diagnostica)').fill(JSON.stringify({ product: 'merge_discovery', saveSchemaVersion: payload.saveSchemaVersion, contentVersionSeen: payload.contentVersionSeen, payload }));
  await page.getByRole('button', { name: 'Verifica import', exact: true }).click();
  await page.getByRole('button', { name: 'Conferma sostituzione del progresso' }).click();
  await expect(page.getByRole('button', { name: 'Combina', exact: true })).toBeVisible();
  mkdirSync(directory, { recursive: true });
  const audits = [];
  for (const [width,height] of [[1440,900],[390,844],[320,568],[768,1024],[1024,768],[1920,1080]] as const) {
    await page.setViewportSize({width,height});
    for (const [url,name,heading] of routes) {
      await page.goto(url);
      await expect(page.getByRole('heading', {name:heading,exact:true})).toBeVisible();
      if (name !== 'settings') await expect(page.getByRole('navigation', {name:'Strumenti dell’osservatorio'})).toBeVisible();
      if (name === 'map') {
        await expect(page.locator('.map-node[aria-pressed=true]')).toHaveText('Acqua');
        const selected=await page.locator('.map-node[aria-pressed=true]').boundingBox();
        const canvas=await page.locator('.map-viewport').boundingBox();
        expect(selected!.x).toBeGreaterThanOrEqual(canvas!.x);
        expect(selected!.x + selected!.width).toBeLessThanOrEqual(canvas!.x + canvas!.width);
        await expect(page.getByRole('complementary', { name:'Esploratore delle relazioni' })).toBeVisible();
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
      audits.push({url,width,height,axeViolations:0,overflow:false});
      if (width===1440 || width===390 || (width===320 && name==='map')) {
        if (name==='map' && width<768) {
          await page.screenshot({path:`${directory}/${width}-map-overview.png`,animations:'disabled'});
          await page.locator('.map-viewport').evaluate(n => n.scrollIntoView({block:'start'}));
        }
        await page.screenshot({path:`${directory}/${width}-${name}.png`,animations:'disabled'});
      }
    }
  }
  await page.setViewportSize({width:1440,height:900});
  for (const [url,name] of [['/','laboratory'],['/collection','collection']] as const) {
    await page.goto(url);
    await expect(page.getByRole('heading',{name:url==='/' ? 'Laboratorio' : 'Collezione',exact:true})).toBeVisible();
    await expect(page.getByText('La schermata si sta aprendo…')).toHaveCount(0);
    await expect(page.locator(url==='/' ? '#laboratory' : '#catalog-content')).toBeVisible();
    if (url==='/') {
      for (const element of ['Acqua','Terra']) {
        await page.getByRole('searchbox').fill(element);
        await page.getByRole('button',{name:new RegExp(`^${element}, elemento del set`)}).click();
      }
      await page.getByRole('searchbox').fill('');
    }
    await page.screenshot({path:`${directory}/1440-${name}.png`,animations:'disabled'});
  }
  mkdirSync('docs/evidence/phase-7-5c',{recursive:true});
  writeFileSync('docs/evidence/phase-7-5c/exploration-responsive.json',JSON.stringify({production:true,audits,originalPosterInspected:true,visualApproval:'PENDING',manualScreenReader:'NOT RUN'},null,2));
});
