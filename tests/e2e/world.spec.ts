import { regressionScreenshotPath } from './evidence';
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync, mkdirSync } from "node:fs";
async function importFixture(page: Page, file: string) {
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
  await expect(
    page.getByRole("button", { name: "Combina", exact: true }),
  ).toBeVisible();
}
async function combine(page: Page, a: string, b: string) {
  for (const name of [a, b]) {
    await page.getByRole("searchbox").fill(name);
    await page
      .getByRole("button", { name: new RegExp(`^${name}, elemento del set`) })
      .click();
  }
  await page.getByRole("button", { name: "Combina", exact: true }).click();
}
async function usable(page: Page) {
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
        text: e.textContent?.slice(0, 50),
        right: e.getBoundingClientRect().right,
      })),
  }));
  expect(layout.width, JSON.stringify(layout)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
  const small = await page.locator("button:visible").evaluateAll((nodes) =>
    nodes
      .filter((node) => {
        const rect = node.getBoundingClientRect();
        return rect.width < 44 || rect.height < 44;
      })
      .map((n) => n.textContent),
  );
  expect(small).toEqual([]);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
}
test("feature deep-link guards and owned starter sheets without Set browser links", async ({
  page,
}) => {
  for (const route of [
    "/collection",
    "/sets/fungi",
    "/collections/water_cycle",
    "/explore/anomalies",
    "/explore/map",
  ]) {
    await page.goto(route);
    await expect(
      page.getByRole("heading", { name: "Non ancora disponibile" }),
    ).toBeVisible();
    await expect(page.locator("#catalog-content")).not.toContainText(
      /Funghi|Ciclo|Luna|Vita/,
    );
  }
  await page.goto("/elements/void");
  await expect(
    page.getByRole("heading", { name: "Vuoto", exact: true }),
  ).toBeVisible();
  await expect(page.locator('a[href^="/sets"]')).toHaveCount(0);
  await expect(
    page.getByRole("navigation", { name: "Navigazione principale desktop" }),
  ).not.toContainText("Anomalie");
});
test("normal Set and Collection reveal compose once with reduced motion", async ({
  page,
}) => {
  await page.goto("/");
  for (const [a, b] of [
    ["Energia", "Materia"],
    ["Vuoto", "Tempo"],
    ["Materia", "Spazio"],
  ]) {
    await combine(page, a!, b!);
    await page
      .getByRole("button", { name: "Nuovo esperimento", exact: true })
      .click();
  }
  await combine(page, "Plasma", "Gravità");
  await expect(page.locator(".reaction-stage")).toHaveAttribute(
    "data-emphasis",
    "set",
  );
  await expect(page.locator(".set-reveal-callout.normal")).toContainText(
    "Cosmo",
  );
  await expect(page.locator(".collection-callouts")).toHaveCount(1);
  await expect(page.locator(".collection-callouts")).toContainText(
    "Figli delle stelle",
  );
  await expect(page.locator(".live-announcement")).toContainText(
    "Nuova collezione: Figli delle stelle",
  );
  await expect(page.locator('[role="dialog"]')).toHaveCount(0);
});
test("Collection completion is persistent, lighter, anonymous, searchable and shares favorites", async ({
  page,
}) => {
  await importFixture(page, "v1-water-cycle-near-complete");
  await page.goto("/collections/water_cycle");
  await expect(
    page.getByRole("progressbar", { name: "Progresso Ciclo dell'acqua" }),
  ).toHaveAttribute("aria-valuenow", "80");
  await expect(page.locator(".anonymous-member")).toHaveCount(1);
  await expect(page.locator("#catalog-content")).not.toContainText("Pioggia");
  await page
    .getByRole("button", { name: /Aggiungi Acqua ai preferiti/ })
    .click();
  await page
    .getByRole("link", { name: "Scheda di Acqua", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "★ Rimuovi dai preferiti", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.goto("/collections");
  await page.getByRole("searchbox").fill("Verde");
  await expect(page.getByRole("link", { name: /Verde ovunque/ })).toBeVisible();
  await page.goto("/");
  await combine(page, "Nuvola", "Nuvola");
  await expect(page.locator(".reaction-stage")).toHaveAttribute(
    "data-emphasis",
    "collection",
  );
  await expect(page.locator(".collection-callouts")).toContainText(
    "Collezione completata · Ciclo dell'acqua",
  );
  await page
    .getByRole("button", { name: "Nuovo esperimento", exact: true })
    .click();
  await combine(page, "Nuvola", "Nuvola");
  await expect(page.locator(".collection-callouts")).toHaveCount(0);
  await page.goto("/collections/water_cycle");
  await expect(
    page.getByText("✓ Collezione completata", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("✓ Collezione completata", { exact: true }),
  ).toBeVisible();
});
test("unrevealed thematic collections are absent from search and direct detail", async ({
  page,
}) => {
  await page.goto("/");
  for (const [a, b] of [
    ["Energia", "Materia"],
    ["Vuoto", "Tempo"],
    ["Materia", "Spazio"],
  ]) {
    await combine(page, a!, b!);
    await page
      .getByRole("button", { name: "Nuovo esperimento", exact: true })
      .click();
  }
  await page.goto("/collections");
  await page.getByRole("searchbox").fill("Ciclo");
  await expect(
    page.getByText("Nessuna collezione visibile trovata."),
  ).toBeVisible();
  await page.goto("/collections/water_cycle");
  await expect(
    page.getByRole("heading", { name: "Non ancora scoperto" }),
  ).toBeVisible();
  await expect(page.locator("#catalog-content")).not.toContainText("Ciclo");
});
test("observed anomaly retries replace both Laboratory slots without an automatic reaction", async ({
  page,
}) => {
  await importFixture(page, "v1-anomaly-observed");
  await page.getByRole("searchbox").fill("Acqua");
  await page.getByRole("button", { name: /^Acqua, elemento del set/ }).click();
  await page.getByRole("searchbox").fill("Energia");
  await page
    .getByRole("button", { name: /^Energia, elemento del set/ })
    .click();
  await page
    .getByRole("navigation", { name: "Navigazione principale desktop" })
    .getByRole("button", { name: /Anomalie/ })
    .click();
  await expect(page.locator(".anomaly-card")).toHaveCount(1);
  await expect(page.getByText("◇ Instabile", { exact: true })).toBeVisible();
  await expect(page.locator("#catalog-content")).not.toContainText(
    /mythic|Qualcosa è cambiato|Risultato scoperto/,
  );
  await page
    .getByRole("button", { name: "Riprova Luna + Vita nel Laboratorio" })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("#laboratory")).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Rimuovi Luna dallo slot A" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Rimuovi Vita dallo slot B" }),
  ).toBeVisible();
  await expect(page.locator(".reaction-stage")).toHaveClass(/idle/);
  await page.getByRole("button", { name: "Combina", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Reazione instabile" }),
  ).toBeVisible();
  await page.goto("/anomalies");
  await expect(page).toHaveURL(/\/explore\/anomalies$/);
});
test("six required Phase 5 screenshots, responsive AA and temporary hidden Set environment", async ({
  page,
}) => {
  mkdirSync("docs/evidence", { recursive: true });
  await importFixture(page, "v1-water-cycle-near-complete");
  await page.goto("/collection");
  await expect(
    page.getByRole("heading", { name: "Collezioni tematiche", exact: true }),
  ).toBeVisible();
  await usable(page);
  await page.screenshot({ path: regressionScreenshotPath("docs/evidence/phase-5-home-1440x900.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/collections/water_cycle");
  await expect(
    page.getByRole("heading", { name: "Ciclo dell'acqua", exact: true }),
  ).toBeVisible();
  await usable(page);
  await page.screenshot({
    path: regressionScreenshotPath("docs/evidence/phase-5-collection-390x844.png"),
  });
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/collections/water_cycle");
  await usable(page);
  await page.screenshot({
    path: regressionScreenshotPath("docs/evidence/phase-5-collection-320x568.png"),
  });
  await importFixture(page, "v1-anomaly-observed");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/explore/anomalies");
  await usable(page);
  await page.screenshot({ path: regressionScreenshotPath("docs/evidence/phase-5-anomaly-1440x900.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/explore/anomalies");
  await usable(page);
  await page.screenshot({ path: regressionScreenshotPath("docs/evidence/phase-5-anomaly-390x844.png") });
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/explore/anomalies");
  await usable(page);
  const navCount = await page.locator(".bottom-navigation button").count();
  expect(navCount).toBeLessThanOrEqual(5);
  await page.goto("/explore");
  await expect(
    page.getByRole("link", { name: "Archivio anomalie", exact: true }),
  ).toBeVisible();
  await importFixture(page, "v1-before-fungi");
  await page.setViewportSize({ width: 1440, height: 900 });
  await combine(page, "Vita", "Umidità");
  await expect(page.locator("#laboratory")).toHaveAttribute(
    "data-reveal-environment",
    "hidden-set",
  );
  await expect(page.locator(".set-reveal-callout.hidden")).toContainText(
    "Funghi",
  );
  await expect(page.locator(".reaction-stage")).toHaveAttribute(
    "data-emphasis",
    "hidden-set",
  );
  await usable(page);
  await page
    .locator(".reaction-stage")
    .evaluate((e) => e.scrollIntoView({ block: "start" }));
  await expect(
    page.getByRole("heading", { name: "Set: Funghi", exact: true }),
  ).toBeInViewport();
  await page.screenshot({ path: regressionScreenshotPath("docs/evidence/phase-5-fungi-1440x900.png") });
  await page
    .getByRole("button", { name: "Nuovo esperimento", exact: true })
    .click();
  await expect(page.locator("#laboratory")).not.toHaveAttribute(
    "data-reveal-environment",
  );
  await importFixture(page, "v1-anomaly-observed");
  for (const [width, height] of [
    [768, 1024],
    [1024, 768],
    [1920, 1080],
  ]) {
    await page.setViewportSize({ width: width!, height: height! });
    for (const route of ["/collections/water_cycle", "/explore/anomalies"]) {
      await page.goto(route);
      await usable(page);
    }
  }
  await page.goto("/settings");
  await page.getByRole("checkbox", { name: "Contrasto elevato" }).click();
  await page.getByLabel("Dimensione del testo").selectOption("extra_large");
  await page.setViewportSize({ width: 320, height: 568 });
  for (const route of ["/collections/water_cycle", "/explore/anomalies"]) {
    await page.goto(route);
    await usable(page);
  }
  for (const route of ["/collections/water_cycle", "/explore/anomalies"]) {
    await page.goto(route);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await usable(page);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "";
    });
  }
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "";
  });
  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  for (const route of ["/collections/water_cycle", "/explore/anomalies"]) {
    await page.goto(route);
    await usable(page);
  }
});
