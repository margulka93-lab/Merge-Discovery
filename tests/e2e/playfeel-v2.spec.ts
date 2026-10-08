import { test, expect, type Page, type Locator, type BrowserContext } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
const rawSeed = { elements: JSON.parse(readFileSync('src/content/data/elements.json','utf8')) as {id:string;nameKey:string}[], locales: {it:JSON.parse(readFileSync('src/content/localization/it.json','utf8')) as Record<string,string>}, progression: JSON.parse(readFileSync('src/content/data/progression.json','utf8')) as {rewards:{alternateRecipe:number}} };
const shots = 'docs/screenshots/playfeel-v2', evidence = 'docs/evidence/playfeel-v2';
const name = (id: string) => rawSeed.locales.it[rawSeed.elements.find(e => e.id === id)!.nameKey]!;
const owned = (page: Page, id: string) => page.getByRole('button', { name: new RegExp(`^${name(id)}, elemento del set`) });
const figure = (page: Page, id: string) => page.locator(`.table-canvas .table-figure[data-element="${id}"]`).last();
async function drag(page: Page, context: BrowserContext, from: Locator, to: Locator, touch: boolean) {
  const a = await from.boundingBox(), b = await to.boundingBox();
  if (!a || !b) throw new Error('Drag endpoints must be visible');
  const start = { x: a.x + a.width / 2, y: a.y + a.height / 2 }, end = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  if (touch) {
    const cdp = await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [start] });
    for (let i = 1; i <= 12; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start.x + (end.x-start.x)*i/12, y: start.y + (end.y-start.y)*i/12 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach();
  } else {
    await page.mouse.move(start.x,start.y); await page.mouse.down(); await page.mouse.move(end.x,end.y,{steps:12}); await page.mouse.up();
  }
  return end;
}
type FixtureSnapshot = { revision: number; save: { xp: number; discoveredRecipeIds: string[]; testedPairs: Record<string, unknown> } };
const snapshot = (page: Page) => page.evaluate<FixtureSnapshot>(() => (window as unknown as {playfeelFixture:{snapshot:()=>Promise<FixtureSnapshot>}}).playfeelFixture.snapshot());
const cycle: [string,string,string?][] = [
  ['energy','energy','heat'], ['heat','matter','gas'], ['gas','gravity','atmosphere'], ['atmosphere','energy','wind'],
  ['void','energy','light'], ['light','cosmic_dust','nebula'], ['plasma','gravity','star'], ['star','cosmic_dust','planet'],
  ['planet','comet','water'], ['water','planet','ocean'], ['ocean','energy','life'], ['life','water','cell'],
  ['cell','soil','bacterium'], ['life','soil','seed'], ['seed','water','sprout'], ['sprout','time','tree'],
  ['tree','tree','forest'], ['life','humidity','mold'], ['mold','time','fungus'], ['fungus','soil','mycelium'],
  ['cloud','cloud','rain'], ['rain','heat','humidity'], ['planet','heat','lava'], ['lava','time','rock'],
  ['rock','time','soil'], ['heat','comet','water'], ['energy','time','water'], ['void','time','space'],
  ['moon','life'], ['void','void'],
];
const known = new Set([0,4,6,22,27]);
for (const [width,height,touch] of [[1440,900,false],[390,844,true],[320,568,true]] as const) {
  test(`30 consecutive experiments ${width}: chains, five no-write replays, two authored alternatives, anomaly and no reaction`, async ({ browser }) => {
    test.setTimeout(240000);
    const context = await browser.newContext({ viewport:{width,height},isMobile:touch,hasTouch:touch,baseURL:'http://127.0.0.1:5178',recordVideo:{dir:test.info().outputPath('video'),size:{width,height}} });
    const page = await context.newPage();
    await page.goto('/tests/ui-fixtures/playfeel.html'); await expect(page.getByRole('button',{name:'Tavolo libero',exact:true})).toHaveAttribute('aria-pressed','true');
    const steps = []; let chains = 0, previous: string | undefined;
    for (let i = 0; i < cycle.length; i++) {
      const [a,b,result] = cycle[i]!; let inserted = false;
      if (previous && (previous === a || previous === b)) chains++;
      if (!await figure(page,a).count()) { await page.getByRole('searchbox').fill(name(a)); if(touch) await owned(page,a).tap(); else await owned(page,a).click(); inserted = true; await expect(figure(page,a)).toBeVisible(); }
      await page.getByRole('searchbox').fill(name(b));
      const before = await snapshot(page), started = Date.now();
      const end = await drag(page,context,touch?page.getByRole('button',{name:`Trascina ${name(b)} sul tavolo`,exact:true}):owned(page,b),figure(page,a),touch);
      if (result) {
        await expect(figure(page,result)).toBeVisible(); await expect(page.locator('.table-outcome strong')).toHaveText(name(result));
        const r = await figure(page,result).boundingBox(); expect(Math.abs(r!.x+r!.width/2-end.x)).toBeLessThan(4); expect(Math.abs(r!.y+47-end.y)).toBeLessThan(4);
      } else await expect(page.locator('.table-outcome')).toContainText(i===28?'Reazione instabile':'Nessuna reazione');
      const after = await snapshot(page);
      if (known.has(i)) { expect(after.revision).toBe(before.revision); expect(after.save).toEqual(before.save); await expect(page.locator('.table-outcome')).toContainText('Reazione conosciuta'); }
      if (i===25 || i===26) { expect(after.save.xp-before.save.xp).toBe(rawSeed.progression.rewards.alternateRecipe); await expect(page.locator('.table-outcome')).toContainText('Ricetta alternativa'); }
      expect(await page.evaluate(()=>scrollY)).toBe(0);
      expect(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1)).toBe(true);
      steps.push({n:i+1,a,b,result:result??(i===28?'anomaly':'no_reaction'),insertTap:inserted,directCombineDrags:1,confirmationButtons:0,ms:Date.now()-started,xpDelta:after.save.xp-before.save.xp,revisionDelta:after.revision-before.revision});
      previous=result;
    }
    expect(chains).toBeGreaterThanOrEqual(8);
    mkdirSync(shots,{recursive:true}); mkdirSync(evidence,{recursive:true});
    await page.screenshot({path:`${shots}/${width}-30-cycle.png`});
    writeFileSync(`${evidence}/${width}-30-cycle.json`,JSON.stringify({fixture:true,secondAlternate:'fixture_energy_time_water',canonicalChanges:false,realChromium:true,touch,physicalDevice:false,humanApproval:'PENDING',chains,steps},null,2));
    const video=page.video(); await context.close(); mkdirSync('docs/videos/playfeel-v2',{recursive:true}); await video?.saveAs(`docs/videos/playfeel-v2/${width}-30-cycle.webm`);
  });
}
test('dock/focus/search/landscape/keyboard, no document scrolling, AA and motion preferences', async ({page}) => {
  await page.goto('/'); await expect(page.getByRole('button',{name:'Tavolo libero',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('searchbox').fill('Energia'); await owned(page,'energy').click(); await owned(page,'energy').click();
  await expect(page.getByRole('button',{name:'Combina figure',exact:true})).toBeEnabled(); await page.getByRole('button',{name:'Combina figure',exact:true}).focus(); await page.keyboard.press('Enter');
  await expect(figure(page,'heat')).toBeVisible(); await expect(page.getByRole('dialog')).toHaveCount(0);
  await figure(page,'heat').focus(); const original = await figure(page,'heat').getAttribute('style'); await page.keyboard.press('ArrowRight'); expect(await figure(page,'heat').getAttribute('style')).not.toBe(original);
  for(const [width,height] of [[1440,900],[390,844],[320,568],[844,390],[320,360]]) {
    await page.setViewportSize({width:width!,height:height!}); await page.keyboard.press('/'); await expect(page.getByRole('searchbox')).toBeFocused();
    await page.getByRole('searchbox').fill('ener'); await page.keyboard.press('Escape'); await expect(page.getByRole('searchbox')).toHaveValue('ener');
    expect(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1&&document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
    mkdirSync(shots,{recursive:true}); await page.screenshot({path:`${shots}/${width}x${height}-keyboard-dock.png`});
  }
  await page.setViewportSize({width:390,height:844}); await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});
  expect(await figure(page,'heat').evaluate(e=>getComputedStyle(e).animationName)).toBe('none');
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await page.screenshot({path:`${shots}/390-forced-colors.png`});
  await page.emulateMedia({forcedColors:'none'}); await page.evaluate(()=>document.documentElement.style.fontSize='200%');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true); await page.getByRole('searchbox').fill('Materia'); await expect(owned(page,'matter')).toBeVisible();
  await page.screenshot({path:`${shots}/390-text-200.png`});
});
