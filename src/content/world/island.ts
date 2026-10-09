import type { ManifestationDefinition, WorldContent, WorldRequirement } from '../../domain/world/types';
const local = (id: string, sameAnchor = false): WorldRequirement => ({ type: 'manifested', manifestationId: id, sameZone: true, sameAnchor });
const habitat = (tag: 'water' | 'tree'): WorldRequirement => ({ type: 'habitat', tag, sameZone: true });
const pair = (slot: string) => [`west_${slot}`, `east_${slot}`];
function mapping(id: string, kind: ManifestationDefinition['kind'], slot: string, requirements: WorldRequirement[] = [], replaces: string[] = [], habitatTags: ('water' | 'tree')[] = []): ManifestationDefinition {
  return { id, sourceElementId: id, worldId: 'first_island', kind, target: { zoneIds: ['west', 'east'], anchorIds: pair(slot), slot }, requirements, replaces, maxInstances: 1, labelKey: `action.${id}`, observationKey: `observed.${id}`, artKey: id, habitatTags };
}
/** Eleven checkpoint-approved mappings. Separate authored content, never canonical recipe modifiers. */
export const islandContent: WorldContent = {
  definition: { id: 'first_island', version: '0.1.0', coordinateSpace: { width: 1000, height: 700 }, baseArtKey: 'island_base',
    zones: ['west', 'east'].map((id, side) => ({ id, labelKey: `zone.${id}`, anchors: [
      { id: `${id}_sky`, x: 300 + side * 400, y: 70, depth: 0, tags: ['sky'] },
      { id: `${id}_ridge`, x: 370 + side * 280, y: 240, depth: 240, tags: ['ridge'] },
      { id: `${id}_patch`, x: 250 + side * 430, y: 400, depth: 400, tags: ['patch'] },
      { id: `${id}_basin`, x: 330 + side * 380, y: 460, depth: 460, tags: ['basin'] },
      { id: `${id}_coast`, x: 180 + side * 650, y: 520, depth: 520, tags: ['coast'] },
      { id: `${id}_inhabitant`, x: 390 + side * 200, y: 430, depth: 430, tags: ['inhabitant'] },
    ] })) },
  manifestations: [
    mapping('light', 'environment', 'sky'), mapping('heat', 'environment', 'ridge'),
    mapping('lava', 'terrain', 'ridge', [local('heat', true)], ['heat']),
    mapping('rock', 'terrain', 'ridge', [local('lava', true)], ['lava']),
    mapping('soil', 'terrain', 'patch'), mapping('water', 'environment', 'basin', [], [], ['water']),
    mapping('ocean', 'environment', 'coast', [{ type: 'manifested', manifestationId: 'water', sameZone: false, sameAnchor: false }]),
    { ...mapping('seed', 'living_object', 'patch', [local('soil', true), habitat('water')]), target: { zoneIds: ['west', 'east'], anchorIds: pair('patch'), slot: 'plant' } },
    { ...mapping('sprout', 'living_object', 'patch', [local('seed', true)], ['seed']), target: { zoneIds: ['west', 'east'], anchorIds: pair('patch'), slot: 'plant' } },
    { ...mapping('tree', 'living_object', 'patch', [local('sprout', true)], ['sprout'], ['tree']), target: { zoneIds: ['west', 'east'], anchorIds: pair('patch'), slot: 'plant' } },
    mapping('creature', 'living_object', 'inhabitant', [habitat('water'), habitat('tree')]),
  ],
  // Registry geometry is provisional until the sample and individual raster props are approved.
  assets: ['island_base', 'light', 'heat', 'lava', 'rock', 'soil', 'water', 'ocean', 'seed', 'sprout', 'tree', 'creature'].map(id => ({
    id, width: 256, height: 256, pivot: { x: 128, y: 220 }, footprint: { width: 100, height: 60 }, layer: id === 'island_base' ? 0 : 1,
    hitBounds: { x: 28, y: 40, width: 200, height: 200 }, placeholder: true,
  })),
  locale: {
    'zone.west': 'Riva occidentale', 'zone.east': 'Riva orientale',
    'action.light': 'Illumina il cielo', 'action.heat': 'Scalda la vena', 'action.lava': 'Trasforma la vena', 'action.rock': 'Stabilizza la roccia',
    'action.soil': 'Prepara il terreno', 'action.water': 'Riempi il bacino', 'action.ocean': 'Bagna la costa', 'action.seed': 'Colloca il seme',
    'action.sprout': 'Fai germogliare', 'action.tree': 'Fai crescere l’albero', 'action.creature': 'Accogli una creatura',
    'observed.light': 'Il cielo si è illuminato.', 'observed.heat': 'La vena si è scaldata.', 'observed.lava': 'La vena è diventata incandescente.',
    'observed.rock': 'La roccia si è stabilizzata.', 'observed.soil': 'Il terreno è diventato fertile.', 'observed.water': 'Il bacino si è riempito.',
    'observed.ocean': 'La costa ha reagito all’acqua.', 'observed.seed': 'Un seme è stato collocato.', 'observed.sprout': 'Il seme è diventato un germoglio.',
    'observed.tree': 'Il germoglio è diventato un albero.', 'observed.creature': 'Una creatura ha trovato un habitat.',
  },
};
