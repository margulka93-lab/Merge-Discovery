import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
const baseline = process.env.KNOWLEDGE_BASELINE === '1';
const shots = `docs/screenshots/phase-7-5b/${baseline ? 'before' : 'after'}`;
const cases = [
  ['/collection', 'collection', 'Collezione'], ['/sets', 'sets', 'Set'],
  ['/sets/world', 'set-detail', 'Mondo'], ['/elements/water', 'element-detail', 'Acqua'],
  ['/collections', 'collections', 'Collezioni tematiche'], ['/collections/water_cycle', 'thematic', "Ciclo dell'acqua"],
] as const;
test('Phase 7.5B knowledge-family production visual evidence and safe navigation', async ({ page }) => {
  test.setTimeout(240000);
  await page.goto('/settings');
  await page.getByText('Salvataggio locale · importazione e recupero', { exact: true }).click();
  const payload = JSON.parse(readFileSync('tests/fixtures/saves/v1-anomaly-observed.json', 'utf8'));
  await page.getByLabel('JSON del salvataggio (diagnostica)').fill(JSON.stringify({ product: 'merge_discovery', saveSchemaVersion: payload.saveSchemaVersion, contentVersionSeen: payload.contentVersionSeen, payload }));
  await page.getByRole('button', { name: 'Verifica import', exact: true }).click();
  await page.getByRole('button', { name: 'Conferma sostituzione del progresso' }).click();
  await expect(page.getByRole('button', { name: 'Combina', exact: true })).toBeVisible();
  mkdirSync(shots, { recursive: true });
  const audits = [];
  for (const [width, height] of [[1440,900],[390,844],[320,568],[768,1024],[1024,768],[1920,1080]] as const) {
    await page.setViewportSize({ width, height });
    for (const [url, name, heading] of cases) {
      await page.goto(url);
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
      if (!baseline) {
        await expect(page.getByRole('navigation', { name: 'Taccuino delle scoperte' })).toBeVisible();
        expect(await page.locator('.catalog-page').evaluate(n => getComputedStyle(n).getPropertyValue('--color-paper').trim())).toBe('#080f1c');
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
      expect(axe.violations).toEqual([]);
      audits.push({ width, height, url, axeViolations: 0, overflow: false });
      if (width === 1440 || (width === 390 && ['collection','element-detail','set-detail'].includes(name)) || (width === 320 && name === 'collection')) {
        await page.locator('#catalog-content').evaluate(n => n.scrollTop = 0);
        await page.screenshot({ path: `${shots}/${width}-${name}.png`, animations: 'disabled' });
      }
    }
  }
  if (!baseline) {
    mkdirSync('docs/evidence/phase-7-5b', { recursive: true });
    writeFileSync('docs/evidence/phase-7-5b/knowledge-responsive.json', JSON.stringify({ production: true, audits, originalPosterInspected: true, visualApproval: 'PENDING', manualScreenReader: 'NOT RUN' }, null, 2));
  }
});
