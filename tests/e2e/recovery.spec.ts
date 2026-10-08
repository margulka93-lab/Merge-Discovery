import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('isolated fatal-content/boundary fixture is accessible and exports the actual untouched save',async({page})=>{
  await page.goto('/'); await page.getByRole('button', { name: 'Laboratorio classico', exact: true }).click();
  await expect(page.getByRole('button',{name:'Combina',exact:true})).toBeVisible();
  for(const mode of ['fatal','boundary']) {
    await page.goto(`/tests/ui-fixtures/recovery.html?mode=${mode}`);
    await expect(page.locator('main')).toBeFocused();
    expect(await page.locator('body').innerText()).not.toContain('TEST ONLY');
    expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
    await page.getByRole('button',{name:'Esporta dati originali per recupero'}).click();
    const json=await page.getByLabel('Dati originali JSON · copia e conserva').inputValue();
    expect(JSON.parse(json).recoveryData.current.xp).toBe(0);
    await page.setViewportSize({width:320,height:568});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  }
  await page.goto('/'); await page.getByRole('button', { name: 'Laboratorio classico', exact: true }).click();
  await expect(page.getByRole('button',{name:'Combina',exact:true})).toBeVisible();
  expect(await page.locator('.level-badge').count()).toBeLessThanOrEqual(2);
});
