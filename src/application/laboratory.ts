import type { ContentIndex, ResolutionResult } from "../domain/model/types";
import type { ApplicationSnapshot } from "./save/SaveApplication";
import { isFailureAuthoritative } from "./updates/reconcile";
import { pairKey } from "../domain/resolver/pair";

export interface LabElement {
  id: string;
  name: string;
  description: string;
  setName: string;
  accent: string;
  artKey: string;
  rarity: string;
  favorite: boolean;
  context: string;
}
export interface Destination {
  id: string;
  label: string;
  symbol: string;
}
export interface LabModel {
  elements: LabElement[];
  destinations: Destination[];
  mobileDestinations: Destination[];
  level: number;
  count: number;
  xp: number;
  progress: number;
  reducedMotion: boolean;
  highContrast: boolean;
  textScale: "default" | "large" | "extra_large";
}
export interface LabReaction {
  kind: "new" | "alternate" | "known" | "no_reaction" | "anomaly";
  title: string;
  message: string;
  element?: LabElement;
  setReveals: string[];
  announcement: string;
}
const rarityNames = {
  common: "Comune",
  uncommon: "Non comune",
  rare: "Raro",
  extraordinary: "Straordinario",
  secret: "Segreto",
};
/** Presentation selectors expose owned content only; no resolver previews or valid-partner hints. */
export function laboratoryModel(
  snapshot: ApplicationSnapshot,
  index: ContentIndex,
  slotA?: string,
): LabModel {
  const { save } = snapshot;
  const text = (key: string) => index.content.locales.it[key] ?? "";
  const elements = index.content.elements
    .filter((e) => Boolean(save.discoveredElements[e.id]))
    .map((e) => {
      const set = index.content.sets.find((s) => s.id === e.setId)!;
      let context = snapshot.newPossibilityElementIds.includes(e.id)
        ? "Nuove possibilità"
        : "";
      if (slotA) {
        const key = pairKey(slotA, e.id),
          tested = save.testedPairs[key];
        if (tested?.lastOutcome === "anomaly")
          context = "◇ Reazione instabile già osservata";
        else if (
          !context &&
          tested?.lastOutcome === "no_reaction" &&
          isFailureAuthoritative(save, key, index)
        )
          context = "○ Già provato: nessuna reazione";
        else if (!context && tested?.lastOutcome === "success")
          context = "✓ Reazione conosciuta";
      }
      return {
        id: e.id,
        name: text(e.nameKey),
        description: text(e.descriptionKey),
        setName: text(set.nameKey),
        accent: set.accentToken,
        artKey: e.artKey,
        rarity: rarityNames[e.rarity],
        favorite: save.favoriteElementIds.includes(e.id),
        context,
      };
    });
  const destinations: Destination[] = [
    { id: "lab", label: "Laboratorio", symbol: "✧" },
  ];
  // First-session disclosure counts discoveries made by the player, not the four supplied concepts.
  if (elements.filter((e) => !index.elements.get(e.id)?.starter).length >= 3)
    destinations.push({ id: "collection", label: "Collezione", symbol: "▦" });
  if (
    save.revealedSetIds.some(
      (id) => !index.content.visibility.initialRevealedSetIds.includes(id),
    )
  )
    destinations.push({ id: "sets", label: "Set", symbol: "◈" });
  if (Object.keys(save.anomalies).length)
    destinations.push({ id: "anomalies", label: "Anomalie", symbol: "◇" });
  if (elements.length >= 15)
    destinations.push({ id: "map", label: "Mappa", symbol: "⌘" });
  destinations.push({ id: "settings", label: "Impostazioni", symbol: "⚙" });
  const both =
    destinations.some((d) => d.id === "map") &&
    destinations.some((d) => d.id === "anomalies");
  const mobileDestinations = both
    ? [
        ...destinations.filter(
          (d) => !["map", "anomalies", "settings"].includes(d.id),
        ),
        { id: "explore", label: "Esplora", symbol: "◇" },
        destinations.at(-1)!,
      ]
    : destinations;
  const thresholds = index.content.progression.levelThresholds;
  const floor = thresholds[snapshot.derived.level - 1] ?? 0,
    ceiling = thresholds[snapshot.derived.level];
  return {
    elements,
    destinations,
    mobileDestinations,
    level: snapshot.derived.level,
    count: elements.length,
    xp: save.xp,
    progress:
      ceiling === undefined
        ? 100
        : Math.min(100, ((save.xp - floor) / (ceiling - floor)) * 100),
    ...save.settings,
  };
}
export function laboratoryReaction(
  result: ResolutionResult,
  snapshot: ApplicationSnapshot,
  index: ContentIndex,
): LabReaction {
  const setReveals = result.events.flatMap((e) => {
    if (e.type !== "set_revealed") return [];
    const set = index.content.sets.find((s) => s.id === e.setId)!;
    return [index.content.locales.it[set.nameKey] ?? ""];
  });
  if (result.type === "success") {
    const element = laboratoryModel(snapshot, index).elements.find(
      (e) => e.id === result.resultElementId,
    )!;
    const kind = result.isNewElement
      ? "new"
      : result.isNewRecipe
        ? "alternate"
        : "known";
    const title =
      kind === "new"
        ? "Nuova scoperta"
        : kind === "alternate"
          ? "Ricetta alternativa"
          : "Reazione conosciuta";
    return {
      kind,
      title,
      element,
      setReveals,
      message: element.description,
      announcement: `${title}: ${element.name}.${setReveals.map((name) => ` Nuovo set: ${name}.`).join("")}`,
    };
  }
  if (result.type === "anomaly")
    return {
      kind: "anomaly",
      title: "Reazione instabile",
      setReveals,
      message: "Qualcosa ha reagito, ma non riesci ancora a stabilizzarlo.",
      announcement: result.isNewAnomaly
        ? "Reazione instabile registrata."
        : "Reazione instabile già osservata.",
    };
  return {
    kind: "no_reaction",
    title: "Nessuna reazione.",
    message: "Puoi continuare a sperimentare.",
    setReveals,
    announcement: "Nessuna reazione.",
  };
}
