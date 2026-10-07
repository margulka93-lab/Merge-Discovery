// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { LaboratoryApplication } from "../src/app/App";
import { SaveApplication } from "../src/application/save/SaveApplication";
import {
  laboratoryModel,
  laboratoryReaction,
} from "../src/application/laboratory";
import { MemorySaveRepository } from "../src/persistence/memory/MemorySaveRepository";
import { loadSeed } from "../src/content/load";
import { createSave } from "../src/application/save/projection";
import { simulateReachability } from "../src/domain/simulation/reachability";
import { SaveError } from "../src/application/save/errors";
const index = loadSeed(),
  timestamp = "2026-10-06T12:00:00.000Z";
afterEach(cleanup);
async function setup(full = false) {
  const repo = new MemorySaveRepository();
  const app = new SaveApplication(repo, index, () => timestamp);
  if (full) {
    const save = createSave(index, timestamp),
      state = simulateReachability(index).state;
    save.discoveredElements = Object.fromEntries(
      state.discoveredElementIds.map((id) => [
        id,
        { firstDiscoveredAt: timestamp },
      ]),
    );
    save.revealedSetIds = state.revealedSetIds;
    save.completedSetIds = state.completedSetIds;
    save.xp = state.xp;
    await repo.createNew(save, 0);
  }
  const rendered = render(
    <LaboratoryApplication application={app} boot={app.start()} />,
  );
  await screen.findByRole("button", { name: "Combina" });
  const user = userEvent.setup();
  const select = (name: string) =>
    user.click(
      screen.getByRole("button", {
        name: new RegExp(`^${name}, elemento del set`),
      }),
    );
  const combine = () =>
    user.click(screen.getByRole("button", { name: "Combina" }));
  return { repo, app, user, select, combine, ...rendered };
}
it("selects A then B, clears individual slots and never resolves automatically", async () => {
  const { select, repo, user } = await setup();
  expect(
    screen.getByRole("button", { name: "Combina" }).hasAttribute("disabled"),
  ).toBe(true);
  await select("Vuoto");
  await select("Energia");
  expect(
    screen.getByRole("button", { name: "Rimuovi Vuoto dallo slot A" }),
  ).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "Rimuovi Energia dallo slot B" }),
  ).toBeTruthy();
  expect((await repo.load()).revision).toBe(1);
  await user.click(
    screen.getByRole("button", { name: "Rimuovi Vuoto dallo slot A" }),
  );
  expect(
    screen.getByRole("button", { name: "Combina" }).hasAttribute("disabled"),
  ).toBe(true);
  await select("Materia");
  expect(
    screen.getByRole("button", { name: "Rimuovi Materia dallo slot A" }),
  ).toBeTruthy();
});
it("supports authored A+A, committed discovery and explicit use/repeat/reset", async () => {
  const { select, combine, user, app } = await setup();
  await select("Energia");
  await select("Energia");
  await combine();
  await screen.findByRole("heading", { name: "Calore" });
  expect((await app.load()).save.discoveredElements.heat).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "Rimuovi Energia dallo slot A" }),
  ).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Usa risultato" }));
  expect(
    screen.getByRole("button", { name: "Rimuovi Calore dallo slot A" }),
  ).toBeTruthy();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Rimuovi Calore dallo slot A' }));
  expect(screen.getByRole("button", { name: "Slot B vuoto" })).toBeTruthy();
  await user.click(
    screen.getByRole("button", { name: "Rimuovi Calore dallo slot A" }),
  );
  await select("Vuoto");
  await select("Energia");
  await combine();
  await screen.findByRole("heading", { name: "Luce" });
  await user.click(screen.getByRole("button", { name: "Ripeti con A" }));
  expect(
    screen.getByRole("button", { name: "Rimuovi Vuoto dallo slot A" }),
  ).toBeTruthy();
  await select("Energia");
  await combine();
  await screen.findByText("Reazione conosciuta");
  const xp = (await app.load()).save.xp;
  await user.click(screen.getByRole("button", { name: "Nuovo esperimento" }));
  expect(screen.getByRole("button", { name: "Slot A vuoto" })).toBeTruthy();
  expect((await app.load()).save.xp).toBe(xp);
});
it("shows no reaction neutrally and remembers context without lighting valid partners", async () => {
  const { select, combine } = await setup();
  await select("Vuoto");
  expect(document.body.textContent).not.toContain("Reazione conosciuta");
  await select("Vuoto");
  await combine();
  await screen.findByRole("heading", { name: "Nessuna reazione." });
  expect(
    screen.getByRole("button", {
      name: /Vuoto, elemento.*Già provato: nessuna reazione/,
    }),
  ).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Usa risultato" })).toBeNull();
});
it("presents an alternate recipe without claiming a new element", async () => {
  const { select, combine, app } = await setup(true);
  const beforeXp = (await app.load()).save.xp;
  await select("Vuoto");
  await select("Energia");
  await combine();
  await screen.findByText("Ricetta alternativa");
  expect((await app.load()).save.xp - beforeXp).toBe(
    index.content.progression.rewards.alternateRecipe,
  );
  expect(screen.queryByText("Nuova scoperta")).toBeNull();
});
it("registers and repeats the canonical anomaly without hidden results or repeat XP", async () => {
  const { select, combine, app } = await setup(true);
  await select("Luna");
  await select("Vita");
  await combine();
  await screen.findByRole("heading", { name: "Reazione instabile" });
  expect(document.body.textContent).toContain("Reazione instabile registrata.");
  const xp = (await app.load()).save.xp;
  await combine();
  await screen.findAllByText("Reazione instabile già osservata.");
  expect((await app.load()).save.xp).toBe(xp);
  expect(document.body.textContent).not.toMatch(
    /Licantropo|Arcano|Magia|lunar_life/,
  );
});
it("searches owned content only; favorites survive a real save/load and component remount", async () => {
  const { user, app, unmount } = await setup();
  await user.type(screen.getByRole("searchbox"), "Muffa");
  expect(
    screen.getByText("Nessun elemento trovato tra le tue scoperte."),
  ).toBeTruthy();
  expect(screen.queryByRole("button", { name: /Muffa, elemento/ })).toBeNull();
  await user.clear(screen.getByRole("searchbox"));
  await user.click(
    screen.getByRole("button", { name: "Aggiungi Energia ai preferiti" }),
  );
  await screen.findByRole("button", { name: "Rimuovi Energia dai preferiti" });
  unmount();
  render(<LaboratoryApplication application={app} boot={app.load()} />);
  await screen.findByRole("button", { name: "Rimuovi Energia dai preferiti" });
  expect((await app.load()).save.favoriteElementIds).toEqual(["energy"]);
});
it("never confirms failed persistence and keeps inputs/last valid progress for retry", async () => {
  const { user, select, combine, repo, app } = await setup();
  const before = await repo.load();
  const persist = vi
    .spyOn(repo, "persist")
    .mockRejectedValueOnce(new SaveError("persistence_failed", "failure"));
  await select("Vuoto");
  await select("Energia");
  await combine();
  await screen.findByRole("alert");
  expect(screen.queryByRole("heading", { name: "Luce" })).toBeNull();
  expect(await repo.load()).toEqual(before);
  expect(
    screen.getByRole("button", { name: "Rimuovi Vuoto dallo slot A" }),
  ).toBeTruthy();
  persist.mockRestore();
  await combine();
  await screen.findByRole("heading", { name: "Luce" });
  expect((await app.load()).save.discoveredElements.light).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Usa risultato" }));
});
it("has semantic keyboard activation, stable focus, concise live outcome and persisted reduced motion", async () => {
  const { user, app } = await setup();
  const energy = screen.getByRole("button", { name: /^Energia, elemento/ });
  energy.focus();
  await user.keyboard("{Enter}");
  await user.keyboard(" ");
  expect(
    screen.getByRole("button", { name: "Rimuovi Energia dallo slot B" }),
  ).toBeTruthy();
  const combine = screen.getByRole("button", { name: "Combina" });
  combine.focus();
  await user.keyboard("{Enter}");
  await screen.findByRole("heading", { name: "Calore" });
  expect(document.activeElement).toBe(combine);
  expect(document.querySelector("[aria-live=polite]")?.textContent).toBe(
    "Nuova scoperta: Calore.",
  );
  expect(
    document.querySelector(".app-shell")?.getAttribute("data-reduced-motion"),
  ).toBe("true");
  await user.click(screen.getAllByRole("button", { name: /Impostazioni/ })[0]!);
  await user.click(await screen.findByRole("checkbox", { name: "Movimento ridotto" }));
  await waitFor(() =>
    expect(
      document.querySelector(".app-shell")?.getAttribute("data-reduced-motion"),
    ).toBe("false"),
  );
  expect((await app.load()).save.settings.reducedMotion).toBe(false);
});
it("preserves experiment and search while switching eligible destinations", async () => {
  const { user, select } = await setup();
  await select("Vuoto");
  await user.type(screen.getByRole("searchbox"), "Ener");
  await user.click(screen.getAllByRole("button", { name: /Impostazioni/ })[0]!);
  await user.click(
    await screen.findByRole("button", { name: "Torna al laboratorio" }),
  );
  expect(screen.getByRole("searchbox").getAttribute("value")).toBe("Ener");
  expect(
    screen.getByRole("button", { name: "Rimuovi Vuoto dallo slot A" }),
  ).toBeTruthy();
});
it("projects progressive navigation, groups Explore and excludes hidden metadata", async () => {
  const { app } = await setup();
  const fresh = laboratoryModel(await app.load(), index);
  expect(fresh.destinations.map((d) => d.id)).toEqual(["lab", "settings"]);
  expect(JSON.stringify(fresh)).not.toMatch(
    /fungi|mold|Funghi|Muffa|lunar_life/,
  );
  await app.combine("void", "energy");
  await app.combine("energy", "energy");
  expect(
    laboratoryModel(await app.load(), index).destinations.map((d) => d.id),
  ).not.toContain("collection");
  await app.combine("energy", "matter");
  expect(
    laboratoryModel(await app.load(), index).destinations.map((d) => d.id),
  ).toContain("collection");
});
it("favorites/settings obey validated atomic commits and cannot favorite hidden content", async () => {
  const { app, repo } = await setup();
  const before = await repo.load();
  await expect(
    app.updatePreferences({ favoriteElementId: "mold" }),
  ).rejects.toThrow();
  expect(await repo.load()).toEqual(before);
  vi.spyOn(repo, "persist").mockRejectedValueOnce(
    new SaveError("persistence_failed", "failure"),
  );
  await expect(
    app.updatePreferences({ favoriteElementId: "energy" }),
  ).rejects.toThrow();
  expect(await repo.load()).toEqual(before);
  await app.updatePreferences({
    favoriteElementId: "energy",
    highContrast: true,
    textScale: "extra_large",
  });
  const save = (await app.load()).save;
  expect(save.settings.highContrast).toBe(true);
  expect(save.settings.textScale).toBe("extra_large");
  expect(save.favoriteElementIds).toEqual(["energy"]);
});
it("reveals only committed Set names and current-content failure memory", async () => {
  const { app } = await setup(true);
  const transaction = await app.combine("void", "energy");
  const outcome = laboratoryReaction(
    transaction.resolution,
    transaction.snapshot,
    index,
  );
  expect(outcome.element?.name).toBe("Luce");
  const snapshot = await app.load();
  snapshot.save.testedPairs["energy::void"] = {
    lastOutcome: "no_reaction",
    testedAgainstContentVersion: "0.0.1",
    lastTestedAt: timestamp,
  };
  expect(
    laboratoryModel(snapshot, index, "void").elements.find(
      (e) => e.id === "energy",
    )?.context,
  ).toBe("");
});
