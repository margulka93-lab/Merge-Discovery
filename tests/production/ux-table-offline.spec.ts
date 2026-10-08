import { test, expect } from '@playwright/test';
test('free table keyboard alternative commits a discovery offline and retains it on reload', async ({ page, context }) => {
  await page.goto('/'); await page.getByRole('button', { name: 'Tavolo libero', exact: true }).click();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await context.setOffline(true);
  const energy = page.getByRole('button', { name: /^Energia, elemento del set/ });
  await energy.focus(); await page.keyboard.press('Enter'); await energy.focus(); await page.keyboard.press('Enter');
  const figures = page.locator('.table-canvas:visible .table-figure');
  await page.getByRole('button', { name: 'Combina figure', exact: true }).click();
  await expect(figures).toHaveCount(1); await expect(figures.first()).toHaveAttribute('data-element','heat');
  await page.reload(); await expect(page.getByRole('button', { name: /^Calore, elemento del set/ })).toBeVisible();
});
