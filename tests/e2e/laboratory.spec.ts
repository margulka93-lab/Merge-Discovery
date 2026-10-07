import { regressionScreenshotPath } from './evidence';
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type {
  ElementDefinition,
  RecipeDefinition,
} from "../../src/domain/model/types";
import { readFileSync, mkdirSync } from "node:fs";
const elements: ElementDefinition[] = JSON.parse(
  readFileSync("src/content/data/elements.json", "utf8"),
);
const recipes: RecipeDefinition[] = JSON.parse(
  readFileSync("src/content/data/recipes.json", "utf8"),
);
const locale: Record<string, string> = JSON.parse(
  readFileSync("src/content/localization/it.json", "utf8"),
);
const index = {
  elements: new Map(elements.map((e) => [e.id, e])),
  content: { elements, recipes, locales: { it: locale } },
};
const select = (page: Page, name: string) =>
  page.getByRole("button", { name: new RegExp(`^${name}, elemento del set`) });
const name = (id: string) =>
  index.content.locales.it[index.elements.get(id)!.nameKey]!;
async function boot(page: Page) {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Combina", exact: true }),
  ).toBeVisible();
}
async function importFixture(page: Page, file: string) {
  const save = JSON.parse(
    readFileSync(`tests/fixtures/saves/${file}.json`, "utf8"),
  );
  await page.getByRole("button", { name: /Impostazioni/ }).click();
  await page
    .getByText("Salvataggio locale · importazione e recupero", { exact: true })
    .click();
  await page
    .getByLabel("JSON del salvataggio (diagnostica)")
    .fill(
      JSON.stringify({
        product: "merge_discovery",
        saveSchemaVersion: save.saveSchemaVersion,
        contentVersionSeen: save.contentVersionSeen,
        payload: save,
      }),
    );
  await page
    .getByRole("button", { name: "Verifica import", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Conferma sostituzione del progresso" })
    .click();
  await expect(
    page.getByRole("button", { name: "Combina", exact: true }),
  ).toBeVisible();
}
async function noOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    width: innerWidth,
    scroll: document.documentElement.scrollWidth,
    elements: [...document.querySelectorAll("*")]
      .filter((e) => {
        const r = e.getBoundingClientRect();
        return r.width && (r.right > innerWidth + 1 || r.left < -1);
      })
      .map((e) => ({
        tag: e.tagName,
        cls: e.className,
        right: e.getBoundingClientRect().right,
      })),
  }));
  expect(overflow.scroll, JSON.stringify(overflow)).toBeLessThanOrEqual(
    overflow.width,
  );
}
test("all six viewports, state preservation, target sizes, keyboard and reduced-motion/contrast/text", async ({
  page,
}) => {
  await boot(page);
  await select(page, "Vuoto").click();
  await page.getByRole("searchbox").fill("Ener");
  for (const [width, height] of [
    [320, 568],
    [390, 844],
    [768, 1024],
    [1024, 768],
    [1440, 900],
    [1920, 1080],
  ]) {
    await page.setViewportSize({ width: width!, height: height! });
    await noOverflow(page);
    await expect(page.getByRole("searchbox")).toHaveValue("Ener");
    await expect(
      page.getByRole("button", { name: "Rimuovi Vuoto dallo slot A" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Combina", exact: true }),
    ).toBeVisible();
    const undersized = await page
      .locator("button:visible")
      .evaluateAll((buttons) =>
        buttons
          .filter((b) => {
            const r = b.getBoundingClientRect();
            return r.width < 44 || r.height < 44;
          })
          .map((b) => b.textContent),
      );
    expect(undersized).toEqual([]);
  }
  await page.getByRole("searchbox").clear();
  await select(page, "Energia").focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Combina", exact: true }).focus();
  await page.keyboard.press("Space");
  await expect(
    page.getByRole("heading", { name: "Luce", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Combina", exact: true }),
  ).toBeFocused();
  await expect(page.locator(".live-announcement[aria-live=polite]")).toHaveText(
    "Nuova scoperta: Luce.",
  );
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page
      .locator(".discovery-reveal")
      .evaluate((e) => getComputedStyle(e).animationName),
  ).toBe("none");
  await page.getByRole("button", { name: /Impostazioni/ }).click();
  await page.getByRole("checkbox", { name: "Contrasto elevato" }).click();
  await expect(
    page.getByRole("checkbox", { name: "Contrasto elevato" }),
  ).toBeChecked();
  await page.getByLabel("Dimensione del testo").selectOption("extra_large");
  await expect(page.getByLabel("Dimensione del testo")).toHaveValue(
    "extra_large",
  );
  await page.getByRole("button", { name: "Torna al laboratorio" }).click();
  for (const width of [320, 390, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    await noOverflow(page);
  }
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  // Browser text zoom equivalent: double the root rem size; core controls remain reachable.
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  await noOverflow(page);
  await page.getByRole("button", { name: "Usa risultato" }).click();
  await expect(
    page.getByRole("button", { name: "Rimuovi Luce dallo slot A" }),
  ).toBeVisible();
});
test("IndexedDB reload retains discovery, favorite, tested pair and XP; repeat rewards zero", async ({
  page,
}) => {
  await boot(page);
  await select(page, "Energia").click();
  await select(page, "Energia").click();
  await page.getByRole("button", { name: "Combina", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Calore" })).toBeVisible();
  await page
    .getByRole("button", { name: "Aggiungi Calore ai preferiti" })
    .click();
  await expect(
    page.getByRole("button", { name: "Rimuovi Calore dai preferiti" }),
  ).toBeVisible();
  await page.reload();
  await expect(select(page, "Calore")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Rimuovi Calore dai preferiti" }),
  ).toBeVisible();
  await select(page, "Energia").click();
  await select(page, "Energia").click();
  await expect(select(page, "Energia")).toHaveAccessibleName(
    /Reazione conosciuta/,
  );
  await page.getByRole("button", { name: "Combina", exact: true }).click();
  await expect(
    page.getByText("Reazione conosciuta", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("5 scoperte · 100 XP").first()).toBeVisible();
});
test("keyboard-only experiments traverse all 67 seed elements through the real application", async ({
  page,
}) => {
  await boot(page);
  const discovered = new Set(
    index.content.elements.filter((e) => e.starter).map((e) => e.id),
  );
  const ordered = index.content.recipes;
  let progress = true;
  while (progress) {
    progress = false;
    for (const recipe of ordered) {
      if (
        discovered.has(recipe.resultElementId) ||
        !recipe.inputs.every((id) => discovered.has(id))
      )
        continue;
      for (const id of recipe.inputs) {
        const input = page.getByRole("searchbox");
        await input.focus();
        await page.keyboard.press("ControlOrMeta+A");
        await page.keyboard.type(name(id));
        await page.keyboard.press("Tab"); // favorites filter
        await page.keyboard.press("Tab"); // first matching card (full exact name may also match other owned names)
        // Focus the specifically named card, then activate with the keyboard; no pointer experiment actions.
        await select(page, name(id)).focus();
        await page.keyboard.press("Enter");
      }
      await page.getByRole("button", { name: "Combina", exact: true }).focus();
      await page.keyboard.press("Enter");
      await expect(
        page.getByRole("heading", {
          name: name(recipe.resultElementId),
          exact: true,
        }),
      ).toBeVisible();
      await page.getByRole("button", { name: "Nuovo esperimento" }).focus();
      await page.keyboard.press("Enter");
      discovered.add(recipe.resultElementId);
      progress = true;
    }
  }
  expect(discovered.size).toBe(67);
  await expect(page.getByText(/67 scoperte/).first()).toBeVisible();
});
test("required screenshot evidence: desktop reaction and mobile playable states", async ({
  page,
}) => {
  mkdirSync("docs/evidence", { recursive: true });
  await boot(page);
  await importFixture(page, "v1-completed-sets");
  await select(page, "Acqua").click();
  await select(page, "Terra").click();
  await page.getByRole("button", { name: "Combina", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Fango" })).toBeVisible();
  await page.getByRole("searchbox").scrollIntoViewIfNeeded();
  await page.screenshot({ path: regressionScreenshotPath("docs/evidence/phase-3-1440x900.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Nuovo esperimento" }).click();
  await select(page, "Luna").click();
  await select(page, "Vita").click();
  await page.getByRole("button", { name: "Combina", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Reazione instabile" }),
  ).toBeVisible();
  await page
    .getByRole("heading", { name: "Laboratorio", exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({ path: regressionScreenshotPath("docs/evidence/phase-3-390x844.png") });
  await page.getByRole("button", { name: "Nuovo esperimento" }).click();
  await page.setViewportSize({ width: 320, height: 568 });
  await select(page, "Energia").click();
  await select(page, "Energia").click();
  await page
    .getByRole("heading", { name: "Laboratorio", exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({ path: regressionScreenshotPath("docs/evidence/phase-3-320x568.png") });
});
