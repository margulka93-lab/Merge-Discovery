import { regressionScreenshotPath } from './evidence';
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync, mkdirSync } from "node:fs";
async function importFixture(
  page: Page,
  file = "v1-water-cycle-near-complete",
) {
  await page.goto("/settings");
  await page
    .getByText("Salvataggio locale · importazione e recupero", { exact: true })
    .click();
  const payload = JSON.parse(
    readFileSync(`tests/fixtures/saves/${file}.json`, "utf8"),
  );
  await page.getByLabel("JSON del salvataggio (diagnostica)").fill(
    JSON.stringify({
      product: "merge_discovery",
      saveSchemaVersion: payload.saveSchemaVersion,
      contentVersionSeen: payload.contentVersionSeen,
      payload,
    }),
  );
  await page
    .getByRole("button", { name: "Verifica import", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Conferma sostituzione del progresso" })
    .click();
  await page.getByRole('button', { name: 'Laboratorio classico', exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Combina", exact: true }),
  ).toBeVisible();
}
async function accessible(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(page.viewportSize()!.width);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  const small = await page
    .locator("button:visible,select:visible")
    .evaluateAll((nodes) =>
      nodes
        .filter((n) => {
          const r = n.getBoundingClientRect();
          return r.width < 43 || r.height < 43;
        })
        .map((n) => n.textContent),
    );
  expect(small).toEqual([]);
}
async function shot(page: Page, name: string) {
  mkdirSync("docs/screenshots/phase-6", { recursive: true });
  await page.screenshot({ path: regressionScreenshotPath(`docs/screenshots/phase-6/${name}.png`) });
}
test("map gate and unknown-query safety, element/Set links and keyboard focus", async ({
  page,
}) => {
  await page.goto("/explore/map?element=mold&set=fungi");
  await expect(
    page.getByRole("heading", { name: "Non ancora disponibile" }),
  ).toBeVisible();
  await expect(page.locator("#catalog-content")).not.toContainText(
    /Funghi|Muffa/,
  );
  await importFixture(page, "v1-before-fungi");
  await page.goto("/explore/map?element=mold&mode=set&set=fungi");
  await expect(page.locator("#catalog-content")).not.toContainText(
    /Funghi|Muffa/,
  );
  await page.goto("/elements/water");
  await page
    .getByRole("link", { name: "Apri nella Mappa", exact: true })
    .click();
  await expect(page.getByLabel("Elemento al centro")).toHaveValue("water");
  const select = page
    .getByLabel("Esploratore delle relazioni")
    .getByRole("button", { name: "Cometa", exact: true })
    .first();
  // Select a recorded ingredient through the keyboard relationship view.
  await select.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Elemento al centro")).toHaveValue("comet");
  await expect(
    page
      .getByLabel("Esploratore delle relazioni")
      .getByRole("heading", { name: "Cometa", exact: true }),
  ).toBeFocused();
  await page.reload();
  await expect(page.getByLabel("Elemento al centro")).toHaveValue("comet");
  await page.goto("/explore");
  await expect(page.locator("#catalog-content")).toContainText(
    "Esplora le relazioni conosciute",
  );
  await page.getByRole("link", { name: "Mappa", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Mappa delle scoperte" }),
  ).toBeVisible();
  await page.goto("/sets/world");
  await page.getByRole("link", { name: "Apri mappa del Set" }).click();
  await expect(page.getByLabel("Set rivelato")).toHaveValue("world");
});
test("desktop ancestry and possibilities screenshots, persisted information modes", async ({
  page,
}) => {
  await importFixture(page, "v1-completed-sets");
  await page.goto("/explore/map?element=forest&mode=ancestry&depth=2");
  await accessible(page);
  await shot(page, "1440-ancestry");
  await importFixture(page);
  await page.goto("/explore/map?element=cloud&mode=possibilities");
  await expect(page.locator(".possibility-marker")).toContainText(
    "Possibilità non esplorate",
  );
  await expect(page.locator(".possibility-marker")).not.toContainText(
    "direzioni disponibili",
  );
  await accessible(page);
  await shot(page, "1440-possibilities");
  await page.goto("/settings");
  await page.getByLabel("Informazioni mostrate").selectOption("collector");
  await page.reload();
  await expect(page.getByLabel("Informazioni mostrate")).toHaveValue(
    "collector",
  );
  await page.goto("/explore/map?element=cloud&mode=possibilities");
  await expect(page.locator(".possibility-marker")).toContainText(
    "1 direzioni disponibili",
  );
  await page.goto("/settings");
  await page.getByLabel("Informazioni mostrate").selectOption("mystery");
  await page.goto("/explore/map?element=cloud&mode=possibilities");
  await expect(page.locator(".possibility-marker")).toHaveCount(0);
});
test("manual tiers never expose exact partner/result; laboratory and detail affordances", async ({
  page,
}) => {
  await importFixture(page);
  await page.getByRole("searchbox").fill("Nuvola");
  await page.getByRole("button", { name: /^Nuvola, elemento del set/ }).click();
  await page.getByRole("button", { name: "Indizio", exact: true }).click();
  await page.getByRole("button", { name: "Dammi una direzione" }).click();
  await expect(page.locator(".hint-sheet")).toContainText(
    "resta dentro il Set",
  );
  await expect(page.locator(".hint-sheet")).not.toContainText(/Nuvola|Pioggia/);
  await accessible(page);
  await shot(page, "1440-laboratory-hint-tier2");
  await page.getByRole("button", { name: "Più chiaro", exact: true }).click();
  await expect(page.locator(".hint-sheet")).toContainText("Set Mondo");
  await page.getByRole("button", { name: "Chiudi indizio" }).click();
  await expect(
    page.getByRole("button", { name: "Indizio", exact: true }),
  ).toBeFocused();
  await page.goto("/elements/cloud");
  await page.getByRole("button", { name: "Chiedi un indizio" }).click();
  await page.getByRole("button", { name: "Dammi una direzione" }).click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Chiedi un indizio" }),
  ).toBeFocused();
});
test("six responsive viewports, structured relationships, reduced motion/contrast and 200% text", async ({
  page,
}) => {
  await importFixture(page, "v1-completed-sets");
  await page.goto("/explore/map?element=water&mode=ancestry");
  for (const [width, height] of [
    [320, 568],
    [390, 844],
    [768, 1024],
    [1024, 768],
    [1440, 900],
    [1920, 1080],
  ]) {
    await page.setViewportSize({ width: width!, height: height! });
    await expect(page.getByLabel("Elemento al centro")).toHaveValue("water");
    await accessible(page);
    if (width === 390) {
      await page.locator(".map-canvas-panel").scrollIntoViewIfNeeded();
      await shot(page, "390-local-map");
      await page
        .getByLabel("Esploratore delle relazioni")
        .scrollIntoViewIfNeeded();
      await shot(page, "390-relationship-inspector");
    }
    if (width === 320) {
      await page.locator(".map-canvas-panel").scrollIntoViewIfNeeded();
      await shot(page, "320-minimum-map");
    }
  }
  await page.setViewportSize({ width: 320, height: 568 });
  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  await page.goto("/settings");
  await page.getByLabel("Dimensione del testo").selectOption("extra_large");
  await expect(page.getByLabel("Dimensione del testo")).toHaveAttribute(
    "aria-disabled",
    "false",
  );
  await page.getByLabel("Contrasto elevato", { exact: true }).click();
  await expect(
    page.getByLabel("Contrasto elevato", { exact: true }),
  ).toBeChecked();
  await expect(
    page.getByLabel("Contrasto elevato", { exact: true }),
  ).toHaveAttribute("aria-disabled", "false");
  await page.goto("/explore/map?element=water&mode=ancestry");
  await page
    .locator(".discovery-map")
    .evaluate((e) => ((e as HTMLElement).style.fontSize = "200%"));
  await accessible(page);
  await page.getByRole("button", { name: "Ingrandisci", exact: true }).click();
  await page.getByRole("button", { name: "Riduci", exact: true }).click();
  await page.getByRole("button", { name: "Centra e ripristina" }).click();
});

test("session proactive hints are nonblocking, respect decline and reset on progress", async ({
  page,
}) => {
  await importFixture(page);
  await page.goto("/settings");
  await page.getByLabel("Indizi proattivi").selectOption("normal");
  await expect(page.getByLabel("Indizi proattivi")).toHaveAttribute(
    "aria-disabled",
    "false",
  );
  await page
    .getByRole("button", { name: "Torna al laboratorio", exact: true })
    .click();
  async function combine(a: string, b: string) {
    await page.getByRole('button', { name: 'Laboratorio classico', exact: true }).click();
    const aSlot = page.getByRole("button", {
      name: /^Rimuovi .* dallo slot A/,
    });
    if (await aSlot.count()) await aSlot.click();
    const bSlot = page.getByRole("button", {
      name: /^Rimuovi .* dallo slot B/,
    });
    if (await bSlot.count()) await bSlot.click();
    for (const name of [a, b]) {
      await page.getByRole("searchbox").fill(name);
      await page
        .getByRole("button", { name: new RegExp(`^${name}, elemento del set`) })
        .click();
    }
    await page.getByRole("button", { name: "Combina", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Combina", exact: true }),
    ).toBeEnabled();
  }
  // Cloud+Void has no authored reaction; Cloud still has a legitimate missing direction.
  for (let n = 0; n < 3; n++) await combine("Nuvola", "Vuoto");
  await expect(page.locator(".hint-offer")).toContainText("Vuoi un indizio?");
  await page.getByRole("button", { name: "Non ora", exact: true }).click();
  await expect(page.locator(".hint-offer")).toHaveCount(0);
  for (let n = 0; n < 2; n++) {
    await combine("Nuvola", "Vuoto");
    await expect(page.locator(".hint-offer")).toHaveCount(0);
  }
  await combine("Nuvola", "Vuoto");
  await expect(page.locator(".hint-offer")).toBeVisible();
  await combine("Nuvola", "Nuvola"); // Real new discovery, not an assisted-save flag.
  await expect(page.locator(".hint-offer")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".hint-offer")).toHaveCount(0);
});
