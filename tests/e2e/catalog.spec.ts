import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync, readFileSync } from "node:fs";
async function importFixture(page: Page, file = "v1-completed-sets") {
  await page.goto("/settings");
  await page
    .getByText("Salvataggio locale · importazione e recupero", { exact: true })
    .click();
  const save = JSON.parse(
    readFileSync(`tests/fixtures/saves/${file}.json`, "utf8"),
  );
  await page.getByLabel("JSON del salvataggio (diagnostica)").fill(
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
  const layout = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    offenders: [...document.querySelectorAll("*")]
      .filter((e) => {
        const r = e.getBoundingClientRect();
        return r.width && r.right > innerWidth + 1;
      })
      .map((e) => ({
        tag: e.tagName,
        cls: String(e.className),
        width: e.getBoundingClientRect().width,
      })),
  }));
  expect(layout.width, page.url() + JSON.stringify(layout)).toBeLessThanOrEqual(
    page.viewportSize()?.width ?? 0,
  );
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
test("successful result opens its owned sheet explicitly and returns without losing inputs", async ({
  page,
}) => {
  await page.goto("/");
  const energy = page.getByRole("button", {
    name: /^Energia, elemento del set/,
  });
  await energy.click();
  await energy.click();
  await page.getByRole("button", { name: "Combina", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Calore", exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole("button", { name: "Vedi scheda", exact: true }).click();
  await expect(page).toHaveURL(/\/elements\/heat$/);
  await expect(
    page.getByRole("heading", { name: "Calore", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Torna al Laboratorio", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Rimuovi Energia dallo slot A" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Rimuovi Energia dallo slot B" }),
  ).toBeVisible();
});
test("fresh knowledge boundary, search and identical unknown deep-link guards", async ({
  page,
}) => {
  await page.goto("/collection");
  await expect(
    page.getByRole("heading", { name: "Collezione", exact: true }),
  ).toBeVisible();
  await expect(page.locator("#catalog-content")).not.toContainText("Funghi");
  await expect(page.locator("#catalog-content")).not.toContainText("67");
  await page.getByRole("searchbox").fill("Funghi");
  await expect(
    page.getByText("Nessun elemento trovato tra le tue scoperte."),
  ).toBeVisible();
  await page.goto("/sets");
  await expect(
    page.getByRole("heading", { name: "Set", exact: true }),
  ).toBeVisible();
  await expect(page.locator("#catalog-content")).not.toContainText("Funghi");
  for (const route of [
    "/elements/mold",
    "/elements/does-not-exist",
    "/sets/fungi",
    "/sets/does-not-exist",
  ]) {
    await page.goto(route);
    await expect(
      page.getByRole("heading", { name: "Non ancora scoperto" }),
    ).toBeVisible();
    await expect(page.locator("#catalog-content")).not.toContainText("Funghi");
    await expect(page.locator("#catalog-content")).not.toContainText("Muffa");
  }
  await page.goto("/elements/void");
  await expect(
    page.getByRole("heading", { name: "Vuoto", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Concetto iniziale").first()).toBeVisible();
});
test("real routes, shared durable favorites, Laboratory state, known recipes and grouped history", async ({
  page,
}) => {
  await importFixture(page, "v1-anomaly-observed");
  await page.getByRole("searchbox").fill("Acqua");
  await page.getByRole("button", { name: /^Acqua, elemento del set/ }).click();
  await page.getByRole("button", { name: /Collezione/ }).click();
  await expect(page).toHaveURL(/\/collection$/);
  await page.getByRole("link", { name: "Tutti i Set visibili" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/sets$/);
  await page.getByRole("link", { name: /^Mondo/ }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/sets\/world$/);
  await page
    .getByRole("link", { name: "Scheda di Acqua", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/elements\/water$/);
  await expect(page.locator("#catalog-content")).toBeFocused();
  const recipes = page
    .getByRole("heading", { name: "Ricette conosciute" })
    .locator("..")
    .locator("li");
  await expect(recipes).toHaveCount(2);
  await expect(recipes.nth(0)).toContainText("Cometa");
  await expect(recipes.nth(1)).toContainText("Cometa");
  await page
    .getByRole("button", { name: "☆ Aggiungi ai preferiti", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "★ Rimuovi dai preferiti", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("link", { name: "Torna al Laboratorio", exact: true })
    .click();
  await expect(page.getByRole("searchbox")).toHaveValue("Acqua");
  await expect(
    page.getByRole("button", { name: "Rimuovi Acqua dallo slot A" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Rimuovi Acqua dai preferiti" }),
  ).toBeVisible();
  await page.goto("/elements/water");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "★ Rimuovi dai preferiti", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.goto("/sets/world");
  await page
    .getByRole("button", { name: "Rimuovi Acqua dai preferiti" })
    .click();
  await page.goto("/collection");
  await expect(
    page.getByText(
      "Nessun preferito. Usa la stella sulle carte per aggiungerne uno.",
    ),
  ).toBeVisible();
  await page.getByRole("searchbox").fill("Acqua");
  await page
    .getByRole("button", { name: "Aggiungi Acqua ai preferiti" })
    .last()
    .click();
  await page.goto("/elements/water");
  await expect(
    page.getByRole("button", { name: "★ Rimuovi dai preferiti", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.goto("/elements/moon");
  await expect(page.getByText("Instabile · già osservata")).toBeVisible();
  for (const heading of ["Successi", "Anomalie", "Nessuna reazione"])
    await expect(
      page.getByRole("heading", { name: heading, exact: true }),
    ).toBeVisible();
});
test("all six viewports, filter focus/resize retention, accessibility, text zoom and five screenshots", async ({
  page,
}) => {
  mkdirSync("docs/evidence", { recursive: true });
  await importFixture(page);
  for (const [width, height] of [
    [320, 568],
    [390, 844],
    [768, 1024],
    [1024, 768],
    [1440, 900],
    [1920, 1080],
  ]) {
    await page.setViewportSize({ width: width!, height: height! });
    for (const route of [
      "/collection",
      "/sets",
      "/sets/world",
      "/elements/water",
    ]) {
      await page.goto(route);
      await expect(page.locator("#catalog-content h2")).toBeVisible();
      await noOverflow(page);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/sets/world");
  await page.getByRole("button", { name: "Filtri e ordinamento" }).click();
  await expect(page.getByLabel("Rarità", { exact: true })).toBeFocused();
  await page.getByLabel("Mostra").selectOption("exhausted");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Filtri e ordinamento" }),
  ).toBeFocused();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.getByLabel("Mostra")).toHaveValue("exhausted");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Filtri e ordinamento" }).click();
  await expect(page.getByLabel("Mostra")).toHaveValue("exhausted");
  await page.getByRole("button", { name: "Chiudi filtri" }).click();
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const route of ["/collection", "/elements/water"]) {
    await page.goto(route);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
  await page.goto("/settings");
  await page.getByRole("checkbox", { name: "Contrasto elevato" }).click();
  await expect(
    page.getByRole("checkbox", { name: "Contrasto elevato" }),
  ).toBeChecked();
  await page.getByLabel("Dimensione del testo").selectOption("extra_large");
  await expect(page.getByLabel("Dimensione del testo")).toHaveValue(
    "extra_large",
  );
  await page.setViewportSize({ width: 320, height: 568 });
  for (const route of ["/collection", "/elements/water"]) {
    await page.goto(route);
    await expect(page.locator("#catalog-content h2")).toBeVisible();
    await noOverflow(page);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
  await page.goto("/settings");
  await page.getByRole("checkbox", { name: "Contrasto elevato" }).click();
  await expect(
    page.getByRole("checkbox", { name: "Contrasto elevato" }),
  ).not.toBeChecked();
  await page.getByLabel("Dimensione del testo").selectOption("default");
  await expect(page.getByLabel("Dimensione del testo")).toHaveValue("default");
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/collection", "/sets/world", "/elements/water"]) {
      await page.goto(route);
      await expect(page.locator("#catalog-content h2")).toBeVisible();
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
      await noOverflow(page);
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/collection");
  await expect(page.locator("#catalog-content h2")).toBeVisible();
  await page.screenshot({
    path: "docs/evidence/phase-4-collection-1440x900.png",
  });
  await page.goto("/elements/water");
  await expect(
    page.getByRole("heading", { name: "Acqua", exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: "docs/evidence/phase-4-element-1440x900.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/sets/world");
  await expect(page.locator("#catalog-content h2")).toBeVisible();
  await page.screenshot({ path: "docs/evidence/phase-4-set-390x844.png" });
  await page.goto("/elements/water");
  await expect(page.locator("#catalog-content h2")).toBeVisible();
  await page.screenshot({ path: "docs/evidence/phase-4-element-390x844.png" });
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/collection");
  await expect(page.locator("#catalog-content h2")).toBeVisible();
  await page.screenshot({
    path: "docs/evidence/phase-4-collection-320x568.png",
  });
});
