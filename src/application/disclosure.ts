import type { ContentIndex } from "../domain/model/types";
import type { ApplicationSnapshot } from "./save/SaveApplication";

/** The Phase 3 first-session rules, shared by navigation, routes and contextual links. */
export function featureDisclosure(
  snapshot: ApplicationSnapshot,
  index: ContentIndex,
) {
  const known = Object.keys(snapshot.save.discoveredElements);
  return {
    collection:
      known.filter(
        (id) => index.elements.has(id) && !index.elements.get(id)!.starter,
      ).length >= 3,
    sets: snapshot.save.revealedSetIds.some(
      (id) => !index.content.visibility.initialRevealedSetIds.includes(id),
    ),
    anomalies: Object.keys(snapshot.save.anomalies).length > 0,
    map: known.length >= 15,
  };
}
export type DisclosedFeatures = ReturnType<typeof featureDisclosure>;
export function routeAvailable(
  path: string,
  features: DisclosedFeatures,
): boolean {
  const section = path.split("/")[1];
  if (!section || section === "settings" || section === "elements") return true;
  if (section === "collection" || section === "collections")
    return features.collection;
  if (section === "sets") return features.sets;
  if (section === "anomalies" || path === "/explore/anomalies")
    return features.anomalies;
  if (section === "map" || path === "/explore/map") return features.map;
  if (path === "/explore") return features.anomalies || features.map;
  return false;
}
