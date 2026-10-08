import { test, expect, type Page, type Locator } from '@playwright/test';
const library=(page:Page,name:string)=>page.getByRole('button',{name:new RegExp(`^${name}, elemento del set`)});
const figures=(page:Page)=>page.locator('.table-canvas:visible .table-figure');
async function move(page:Page,from:Locator,to:Locator){
  const a=await from.boundingBox(),b=await to.boundingBox();
  await page.mouse.move(a!.x+a!.width/2,a!.y+a!.height/2); await page.mouse.down();
  await page.mouse.move(b!.x+b!.width/2,b!.y+b!.height/2,{steps:12}); await page.mouse.up();
}
test('library-to-empty copy, duplicate without reaction, direct fusion, known replay and mode preservation',async({page})=>{
  await page.goto('/'); await move(page,library(page,'Energia'),page.locator('.table-canvas'));
  await expect(figures(page)).toHaveCount(1); await figures(page).first().dblclick(); await expect(figures(page)).toHaveCount(2);
  await expect(page.locator('.table-outcome')).toHaveText('');
  await move(page,figures(page).nth(1),figures(page).nth(0)); await expect(figures(page)).toHaveCount(1); await expect(page.locator('.table-outcome strong')).toHaveText('Calore');
  await library(page,'Energia').click(); await move(page,library(page,'Energia'),figures(page).last());
  await expect(figures(page)).toHaveCount(2); await expect(page.locator('.table-outcome')).toContainText('Reazione conosciuta');
  await page.getByRole('searchbox').fill('ener');
  await page.getByRole('button',{name:'Laboratorio classico',exact:true}).click(); await page.getByRole('button',{name:'Tavolo libero',exact:true}).click();
  await expect(page.getByRole('searchbox')).toHaveValue('ener'); await expect(figures(page)).toHaveCount(2);
});
test('explicit context duplicate/remove and keyboard alternative keep focus on the usable result',async({page})=>{
  await page.goto('/'); await library(page,'Energia').focus(); await page.keyboard.press('Enter');
  await page.getByLabel('Opzioni tavolo').click(); await page.getByRole('button',{name:'Duplica',exact:true}).click(); await expect(figures(page)).toHaveCount(2);
  await page.getByLabel('Opzioni tavolo').click(); await page.getByRole('button',{name:'Combina figure',exact:true}).focus(); await page.keyboard.press('Enter');
  await expect(figures(page)).toHaveCount(1); await expect(figures(page).first()).toHaveAttribute('data-element','heat');
  await figures(page).first().focus(); await page.keyboard.press('Shift+ArrowRight'); await page.keyboard.press('Delete'); await expect(figures(page)).toHaveCount(0);
});
test('cancel/outside drops do not combine and a canceled figure move restores its origin',async({page})=>{
  await page.goto('/'); await library(page,'Energia').click(); const before=await figures(page).first().getAttribute('style');
  const a=await figures(page).first().boundingBox(); await page.mouse.move(a!.x+30,a!.y+30); await page.mouse.down(); await page.mouse.move(a!.x+90,a!.y+30);
  await page.evaluate(()=>window.dispatchEvent(new PointerEvent('pointercancel',{pointerId:1}))); await page.mouse.up();
  await expect(figures(page).first()).toHaveAttribute('style',before!); await expect(page.locator('.table-outcome')).toHaveText('');
  await move(page,library(page,'Materia'),page.getByRole('button',{name:'Laboratorio classico',exact:true})); await expect(figures(page)).toHaveCount(1);
});
