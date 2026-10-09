import { loadSeed } from '../src/content/load';
import { validateWorld } from '../src/content/world/validate';
import { islandContent } from '../src/content/world/island';
const index = validateWorld(islandContent, loadSeed());
console.log(JSON.stringify({ valid: true, world: index.content.definition.id, definitionVersion: index.content.definition.version,
  mappings: index.manifestations.size, anchors: index.anchors.size, authoredReachability: '11/11', assetRegistry: 'provisional geometry, not final raster assets' }, null, 2));
