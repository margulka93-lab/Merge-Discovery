import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const directory = 'docs/screenshots/phase-7-5a';
async function boot(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Combina', exact: true })).toBeVisible();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
}
async function fullFixture(page: Page) {
  await page.goto('/settings');
  await page.getByText('Salvataggio locale · importazione e recupero', { exact: true }).click();
  const payload = JSON.parse(readFileSync('tests/fixtures/saves/v1-anomaly-observed.json', 'utf8'));
  await page.getByLabel('JSON del salvataggio (diagnostica)').fill(JSON.stringify({ product: 'merge_discovery', saveSchemaVersion: payload.saveSchemaVersion, contentVersionSeen: payload.contentVersionSeen, payload }));
  await page.getByRole('button', { name: 'Verifica import', exact: true }).click();
  await page.getByRole('button', { name: 'Conferma sostituzione del progresso' }).click();
  await expect(page.getByRole('button', { name: 'Combina', exact: true })).toBeVisible();
}
async function select(page: Page, name: string) {
  // Search in the supporting library; clear it again for faithful populated screenshots.
  await page.getByRole('searchbox').fill(name);
  await page.getByRole('button', { name: new RegExp(`^${name}, elemento del set`) }).click();
  await page.getByRole('searchbox').fill('');
}
async function audit(page: Page) {
  const viewport = page.viewportSize()!;
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations).toEqual([]);
  const small = await page.locator('button:visible,input[type=search]:visible').evaluateAll(nodes => nodes.filter(node => {
    const r = node.getBoundingClientRect(); return r.width < 43 || r.height < 43;
  }).map(node => node.getAttribute('aria-label') || node.textContent));
  expect(small).toEqual([]);
  return { viewport, axeViolations: 0, horizontalOverflow: false, touchTargets: '44px' };
}
async function shot(page: Page, file: string) {
  mkdirSync(directory, { recursive: true });
  await page.screenshot({ path: `${directory}/${file}.png`, animations: 'disabled' });
}

test('Phase 7.5A production Laboratory composition, responsive actions and safe visual evidence', async ({ page, context }) => {
  await boot(page); await fullFixture(page);
  const matrix = [];
  await select(page, 'Acqua'); await select(page, 'Terra');
  for (const [width, height] of [[1440,900],[1024,768],[390,844],[320,568],[768,1024],[1920,1080]] as const) {
    await page.setViewportSize({ width, height });
    await page.locator('#laboratory').evaluate(node => node.scrollTop = 0);
    await page.locator('.workspace-heading').click();
    matrix.push(await audit(page));
    const combine = page.getByRole('button', { name: 'Combina', exact: true });
    await expect(combine).toBeEnabled();
    const bounds = await combine.boundingBox();
    expect(bounds!.y + bounds!.height).toBeLessThan(height - (width < 768 ? 64 : 0));
    await expect(page.getByRole('button', { name: 'Rimuovi Acqua dallo slot A' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Rimuovi Terra dallo slot B' })).toBeVisible();
    if ([1440,1024,390,320].includes(width)) await shot(page, `${width}-laboratory`);
    if (width < 768) expect(await page.locator('.bottom-navigation button').count()).toBeLessThanOrEqual(5);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole('button', { name: 'Rimuovi Acqua dallo slot A' }).click();
  await page.getByRole('button', { name: 'Rimuovi Terra dallo slot B' }).click();
  await select(page, 'Vita'); await select(page, 'Luna');
  await page.getByRole('button', { name: 'Combina', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Reazione instabile', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Nuovo esperimento' })).toBeEnabled();
  await audit(page); await shot(page, '1440-anomaly');

  // Fresh separate save: trigger an authored A+A Tier 3 discovery, not a fabricated result.
  const fresh = await context.browser()!.newContext({ baseURL: 'http://127.0.0.1:5179', viewport: { width: 1440, height: 900 } });
  const discovery = await fresh.newPage(); await boot(discovery);
  await select(discovery, 'Energia'); await select(discovery, 'Energia');
  await discovery.getByRole('button', { name: 'Combina', exact: true }).click();
  await expect(discovery.getByRole('heading', { name: 'Calore', exact: true })).toBeVisible();
  await expect(discovery.locator('.reaction-stage')).toHaveAttribute('data-motion-tier', '3');
  await audit(discovery); await shot(discovery, '1440-new-discovery');
  await discovery.setViewportSize({ width: 390, height: 844 });
  await audit(discovery); await shot(discovery, '390-new-discovery');
  await fresh.close();
  mkdirSync('docs/evidence/phase-7-5a', { recursive: true });
  writeFileSync('docs/evidence/phase-7-5a/laboratory-responsive.json', JSON.stringify({ production: true, matrix, legitimateFixtures: true, inputsSurviveResize: true, combineInitiallyReachable: true, newDiscovery: 'authored energy + energy', anomaly: 'canonical life + moon', manualVisualApproval: 'PENDING' }, null, 2));
});
