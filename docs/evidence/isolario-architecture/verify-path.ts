// Architecture-audit evidence only: execute a proposed route through the existing core.
// No new recipes, world rules, runtime routes or assets are installed.
import { writeFileSync } from 'node:fs';
import { rawSeed } from '../../../src/content/load';
import { validateContent } from '../../../src/content/validate';
import { buildIndex } from '../../../src/content/indexes/build';
import { SaveApplication } from '../../../src/application/save/SaveApplication';
import { MemorySaveRepository } from '../../../src/persistence/memory/MemorySaveRepository';
const route = ['void_energy_to_light','energy_energy_to_heat','energy_matter_to_plasma','void_time_to_space','matter_space_to_gravity','matter_time_to_cosmic_dust','plasma_gravity_to_star','star_cosmic_dust_to_planet','planet_heat_to_lava','lava_time_to_rock','rock_time_to_soil','cosmic_dust_space_to_comet','planet_comet_to_water','water_planet_to_ocean','ocean_energy_to_life','life_soil_to_seed','seed_water_to_sprout','sprout_time_to_tree','life_energy_to_movement','life_movement_to_creature'];
const index = buildIndex(validateContent(rawSeed));
const app = new SaveApplication(new MemorySaveRepository(), index, ()=>'2026-10-09T12:00:00.000Z');
const initial = await app.start();
const steps = [];
for (const [n,id] of route.entries()) {
  const recipe = index.content.recipes.find(r=>r.id===id)!;
  const {resolution,snapshot} = await app.combine(...recipe.inputs);
  if (resolution.type!=='success' || resolution.recipeId!==id || !resolution.isNewElement) throw new Error(`Route failed at ${id}`);
  steps.push({step:n+1,recipeId:id,inputs:recipe.inputs,result:resolution.resultElementId,xp:snapshot.save.xp,owned:Object.keys(snapshot.save.discoveredElements).length});
}
const before = await app.load();
const replay = await app.combine('life','movement');
if(replay.snapshot.save.xp!==before.save.xp)throw new Error('Replay granted XP');
const report = {kind:'canonical route audit, not prototype implementation',baseCommit:'39c62ada194651d27c153d3be5d5444fc3c27ce8',starters:Object.keys(initial.save.discoveredElements),newDiscoveries:steps.length,finalOwned:Object.keys(before.save.discoveredElements).length,finalXp:before.save.xp,knownReplayXpDelta:0,canonicalContentChanged:false,worldActionsImplemented:false,designApproval:'PENDING',steps};
writeFileSync(new URL('./canonical-path.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
