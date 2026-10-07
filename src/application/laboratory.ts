import type { ContentIndex, ResolutionResult } from "../domain/model/types";
import type { ApplicationSnapshot } from "./save/SaveApplication";
import { isFailureAuthoritative } from "./updates/reconcile";
import { featureDisclosure } from "./disclosure";
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
  emphasis?:
    | "known"
    | "alternate"
    | "new"
    | "collection"
    | "set"
    | "hidden-set"
    | "secret-set"
    | "anomaly";
  setRevealDetails?: {
    id: string;
    name: string;
    kind: "normal" | "hidden" | "secret";
    accent: string;
    motifKey: string;
    line: string;
  }[];
  collectionCallouts?: {
    id: string;
    kind: "revealed" | "completed";
    name: string;
  }[];
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
  const features = featureDisclosure(snapshot, index);
  if (features.collection)
    destinations.push({ id: "collection", label: "Collezione", symbol: "▦" });
  if (features.sets)
    destinations.push({ id: "sets", label: "Set", symbol: "◈" });
  if (features.anomalies)
    destinations.push({ id: "anomalies", label: "Anomalie", symbol: "◇" });
  if (features.map)
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
function basicLaboratoryReaction(
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

/** One presentation state: highest event controls emphasis, all lower events stay readable. */
export function laboratoryReaction(
  result: ResolutionResult,
  snapshot: ApplicationSnapshot,
  index: ContentIndex,
  previous?: ApplicationSnapshot,
): LabReaction {
  const base = basicLaboratoryReaction(result, snapshot, index);
  const setRevealDetails = result.events.flatMap((event) => {
    if (
      event.type !== "set_revealed" ||
      !snapshot.save.revealedSetIds.includes(event.setId)
    )
      return [];
    const set = index.content.sets.find((s) => s.id === event.setId)!;
    const kind: "secret" | "hidden" | "normal" =
      set.visibility === "secret"
        ? "secret"
        : set.visibility === "hidden"
          ? "hidden"
          : "normal";
    return [
      {
        id: set.id,
        name: index.content.locales.it[set.nameKey] ?? "",
        kind,
        accent: set.accentToken,
        motifKey: set.iconKey,
        line:
          kind === "hidden"
            ? "Sotto la superficie, la vita trova nuove trame."
            : kind === "secret"
              ? "Il possibile si allarga ancora."
              : "Un nuovo dominio prende forma.",
      },
    ];
  });
  const collectionCallouts: NonNullable<LabReaction["collectionCallouts"]> = [];
  if (previous)
    for (const collection of snapshot.derived.collections) {
      if (!previous.derived.collections.some((c) => c.id === collection.id))
        collectionCallouts.push({
          id: collection.id,
          kind: "revealed",
          name: index.content.locales.it[collection.nameKey] ?? "",
        });
    }
  for (const event of result.events) {
    if (
      event.type !== "collection_completed" ||
      !snapshot.derived.collections.some((c) => c.id === event.collectionId)
    )
      continue;
    const definition = index.content.collections.find(
      (c) => c.id === event.collectionId,
    )!;
    const chapter = definition.chapters?.find(
      (c) => c.id === event.completionId,
    );
    const name =
      (index.content.locales.it[definition.nameKey] ?? "") +
      (chapter ? ` · ${index.content.locales.it[chapter.nameKey] ?? ""}` : "");
    collectionCallouts.push({
      id: event.completionId,
      kind: "completed",
      name,
    });
  }
  const emphasis =
    result.type === "anomaly" ||
    result.events.some((e) => e.type === "anomaly_resolved")
      ? "anomaly"
      : setRevealDetails.some((s) => s.kind === "secret")
        ? "secret-set"
        : setRevealDetails.some((s) => s.kind === "hidden")
          ? "hidden-set"
          : setRevealDetails.length
            ? "set"
            : collectionCallouts.length
              ? "collection"
              : base.kind === "new"
                ? "new"
                : base.kind === "alternate"
                  ? "alternate"
                  : "known";
  const announcement =
    base.announcement.replace(/ Nuovo set: [^.]+\./g, "") +
    setRevealDetails
      .map(
        (s) =>
          ` Nuovo set${s.kind === "hidden" ? " nascosto" : s.kind === "secret" ? " segreto" : ""}: ${s.name}.`,
      )
      .join("") +
    collectionCallouts
      .map(
        (c) =>
          ` ${c.kind === "completed" ? "Collezione completata" : "Nuova collezione"}: ${c.name}.`,
      )
      .join("");
  return {
    ...base,
    emphasis,
    setRevealDetails,
    collectionCallouts,
    announcement,
  };
}
