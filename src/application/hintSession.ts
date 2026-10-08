import type { ResolutionResult } from "../domain/model/types";
export interface HintSession {
  consecutiveNoReaction: number;
  experimentsSinceProgress: number;
  experiments: number;
  declinedUntil: number;
}
export const initialHintSession: HintSession = {
  consecutiveNoReaction: 0,
  experimentsSinceProgress: 0,
  experiments: 0,
  declinedUntil: 0,
};
export const hintThresholds = {
  light: { failures: 5, experiments: 10 },
  normal: { failures: 3, experiments: 6 },
};
export function recordHintExperiment(
  session: HintSession,
  result: ResolutionResult,
  collectionRevealed = false,
): HintSession {
  const progress =
    collectionRevealed ||
    result.events.some((e) =>
      [
        "element_discovered",
        "recipe_discovered",
        "anomaly_registered",
        "set_revealed",
        "collection_completed",
      ].includes(e.type),
    );
  return recordQuietExperiment(session, result.type === 'no_reaction', progress);
}
/** A deliberate remembered attempt still reflects a player stall, without a save transaction. */
export function recordQuietExperiment(session: HintSession, noReaction: boolean, progress = false): HintSession {
  return {
    experiments: session.experiments + 1,
    consecutiveNoReaction: progress
      ? 0
      : noReaction
        ? session.consecutiveNoReaction + 1
        : 0,
    experimentsSinceProgress: progress
      ? 0
      : session.experimentsSinceProgress + 1,
    declinedUntil: progress ? 0 : session.declinedUntil,
  };
}
export function offerHint(
  session: HintSession,
  mode: "off" | "light" | "normal",
): boolean {
  if (mode === "off" || session.experiments < session.declinedUntil)
    return false;
  const threshold = hintThresholds[mode];
  return (
    session.consecutiveNoReaction >= threshold.failures ||
    session.experimentsSinceProgress >= threshold.experiments
  );
}
export function declineHint(session: HintSession): HintSession {
  return { ...session, declinedUntil: session.experiments + 3 };
}
