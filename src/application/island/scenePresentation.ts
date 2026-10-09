/** Presentation registration onto the 1000 × 667 painted plate.
 * These points do not change world eligibility, canonical content, or persisted anchor IDs.
 * Camera can crop/pan between authored shores; the accessible list never depends on the camera.
 */
export const scenePoints: Record<string, { x: number; y: number }> = {
  west_sky: { x: 300, y: 110 }, east_sky: { x: 700, y: 110 },
  west_ridge: { x: 460, y: 270 }, east_ridge: { x: 610, y: 290 },
  west_patch: { x: 265, y: 280 }, east_patch: { x: 710, y: 445 },
  west_basin: { x: 405, y: 355 }, east_basin: { x: 645, y: 390 },
  west_coast: { x: 235, y: 430 }, east_coast: { x: 780, y: 525 },
  west_inhabitant: { x: 330, y: 365 }, east_inhabitant: { x: 740, y: 480 },
};
export const sceneSprites: Record<string, { width: number; height: number; pivotX: number; pivotY: number }> = {
  light: { width: 230, height: 140, pivotX: 115, pivotY: 70 },
  heat: { width: 140, height: 65, pivotX: 70, pivotY: 40 }, lava: { width: 145, height: 75, pivotX: 72, pivotY: 40 }, rock: { width: 120, height: 90, pivotX: 60, pivotY: 65 },
  soil: { width: 140, height: 57, pivotX: 70, pivotY: 28 }, water: { width: 168, height: 72, pivotX: 84, pivotY: 36 },
  ocean: { width: 180, height: 80, pivotX: 90, pivotY: 40 }, seed: { width: 35, height: 40, pivotX: 17, pivotY: 30 },
  sprout: { width: 66, height: 85, pivotX: 33, pivotY: 75 }, tree: { width: 270, height: 180, pivotX: 135, pivotY: 170 },
  creature: { width: 95, height: 63, pivotX: 47, pivotY: 55 },
};
