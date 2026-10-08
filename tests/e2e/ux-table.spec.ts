import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync } from 'node:fs';
const library = (page: Page, name: string) => page.getByRole('button', { name: new RegExp(`^${name}, elemento del set`) });
const figures = (page: Page) => page.locator('.table-canvas:visible .table-figure');
async function table(page: Page) { await page.goto('/'); await page.getByRole('button', { name: 'Tavolo libero', exact: true }).click(); }
async function move(page: Page, from: import('@playwright/test').Locator, to: import('@playwright/test').Locator) {
  const a = await from.boundingBox(), b = await to.boundingBox();
  await page.mouse.move(a!.x + a!.width / 2, a!.y + a!.height / 2); await page.mouse.down();
  await page.mouse.move(b!.x + b!.width / 2, b!.y + b!.height / 2, { steps: 12 }); await page.mouse.up();
}
test('mouse library drag, deliberate collision, duplicate without combine, memory and mode preservation', async ({ page }) => {
  await table(page);
  await move(page, library(page, 'Energia'), page.locator('.table-canvas:visible'));
  await expect(figures(page)).toHaveCount(1);
  await figures(page).first().dblclick(); await expect(figures(page)).toHaveCount(2);
  await expect(page.getByText('Nuova scoperta', { exact: true })).toHaveCount(0);
  await move(page, figures(page).nth(1), figures(page).nth(0));
  await expect(page.getByRole('heading', { name: 'Calore', exact: true })).toBeVisible();
  await expect(figures(page)).toHaveCount(3);
  mkdirSync('docs/screenshots/ux-1', { recursive: true });
  await page.screenshot({ path: 'docs/screenshots/ux-1/1440-table-new-discovery.png' });
  await page.getByRole('button', { name: 'Nuovo esperimento', exact: true }).click();
  await move(page, figures(page).nth(1), figures(page).nth(0));
  await expect(page.getByText(/Già scoperta · Nessuna nuova transazione/)).toBeVisible();
  await page.getByRole('searchbox').fill('ener');
  await page.getByRole('button', { name: 'Laboratorio classico', exact: true }).click();
  await page.getByRole('button', { name: 'Tavolo libero', exact: true }).click();
  await expect(page.getByRole('searchbox')).toHaveValue('ener'); await expect(figures(page)).toHaveCount(3);
});
test('touch/pen drag and tap/keyboard alternatives on a smartphone browser', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, recordVideo: { dir: test.info().outputPath('touch-video'), size: { width: 390, height: 844 } } });
  const page = await context.newPage(); await table(page);
  await library(page, 'Energia').tap(); await figures(page).first().tap();
  await page.getByRole('button', { name: 'Duplica', exact: true }).tap(); await expect(figures(page)).toHaveCount(2);
  const session = await context.newCDPSession(page);
  const a = await figures(page).nth(1).boundingBox(), b = await figures(page).nth(0).boundingBox();
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: a!.x + 44, y: a!.y + 30 }] });
  for (let i = 1; i <= 10; i++) await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a!.x + 44 + (b!.x - a!.x) * i / 10, y: a!.y + 30 + (b!.y - a!.y) * i / 10 }] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(page.getByRole('heading', { name: 'Calore', exact: true })).toBeVisible();
  await figures(page).last().focus(); await page.keyboard.press('ArrowRight'); await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: 'Duplica', exact: true })).toBeEnabled();
  mkdirSync('docs/screenshots/ux-1', { recursive: true }); await page.screenshot({ path: 'docs/screenshots/ux-1/390-table-new-discovery.png' });
  const video = page.video(); await context.close(); mkdirSync('docs/videos/ux-1', { recursive: true }); await video?.saveAs('docs/videos/ux-1/390-touch-table.webm');
});
test('both modes viewport/axe/reduced-motion matrix and real interaction screenshots', async ({ page }) => {
  mkdirSync('docs/screenshots/ux-1', { recursive: true });
  await table(page); await library(page, 'Vuoto').click(); await library(page, 'Energia').click();
  for (const [width, height] of [[320,568],[390,844],[768,1024],[1024,768],[1440,900],[1920,1080]]) {
    await page.setViewportSize({ width: width!, height: height! });
    for (const mode of ['Laboratorio classico', 'Tavolo libero']) {
      await page.getByRole('button', { name: mode, exact: true }).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
      expect(axe.violations).toEqual([]);
      await page.screenshot({ path: `docs/screenshots/ux-1/${width}-${mode === 'Tavolo libero' ? 'table' : 'classic'}.png` });
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test('touch library handle drags across edge autoscroll without consuming its source', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage(); await table(page);
  const handle = page.getByRole('button', { name: 'Trascina Energia sul tavolo', exact: true });
  await handle.scrollIntoViewIfNeeded(); const start = await handle.boundingBox();
  const session = await context.newCDPSession(page);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: start!.x + 30, y: start!.y + 20 }] });
  for (let i = 0; i < 20; i++) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 180, y: 60 }] });
    await page.waitForTimeout(50); // User holds at the edge while the actual autoscroll runs.
  }
  const canvas = await page.locator('.table-canvas:visible').boundingBox();
  await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: canvas!.x + canvas!.width / 2, y: canvas!.y + canvas!.height / 2 }] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(figures(page)).toHaveCount(1); await expect(library(page, 'Energia')).toHaveCount(1);
  await context.close();
});
