import { readFileSync } from 'node:fs';
import { validateContent } from '../../src/content/validate';
import { buildIndex } from '../../src/content/indexes/build';
import { samplePack } from '../../src/content/packs/sample';
import { pairKey } from '../../src/domain/resolver/pair';
/** Synthetic 1,000-element composition, not a content/design proposal. */
export async function performancePack() {
  // Playwright's Node ESM runner does not transform bare JSON imports like Vite/tsx do.
  const modules = ['manifest','elements','sets','collections','recipes','rules','anomalies','unlocks','progression','visibility','registries','migrations'];
  const raw = { ...Object.fromEntries(modules.map(name => [name,JSON.parse(readFileSync(`src/content/data/${name}.json`,'utf8'))])), locales:{it:JSON.parse(readFileSync('src/content/localization/it.json','utf8'))} };
  const seed = buildIndex(validateContent(raw)), pack = await samplePack(), ids = [...seed.elements.keys()];
  const pairs: [string,string][] = [];
  for (let i = 0; i < ids.length; i++) for (let j = i; j < ids.length; j++) {
    const pair: [string,string] = [ids[i]!,ids[j]!]; if (!seed.recipesByPair.has(pairKey(...pair)) && !seed.anomaliesByPair.has(pairKey(...pair))) pairs.push(pair);
  }
  const count = 1000 - seed.elements.size;
  pack.manifest.assets = {}; pack.assets = {}; pack.patch.collections = []; pack.patch.visibility = {initialRevealedSetIds:[],setAnnouncements:[],collectionReveals:[]};
  pack.patch.elements = Array.from({length:count},(_,i) => ({...pack.patch.elements![0]!,id:`studio_sample_${i}`,artKey:'studio_sample.placeholder',sortOrder:i,nameKey:`studio_sample.item_${i}.name`,descriptionKey:`studio_sample.item_${i}.description`}));
  pack.patch.recipes = pack.patch.elements.map((e,i) => ({id:`studio_sample_recipe_${i}`,inputs:pairs[i]!,resultElementId:e.id,kind:'explicit',discovery:'normal'}));
  pack.patch.unlocks![0]!.requirements = [{type:'element_discovered',elementId:pack.patch.elements[0]!.id}];
  for (const e of pack.patch.elements) { pack.patch.locales!.it[e.nameKey] = e.id; pack.patch.locales!.it[e.descriptionKey] = 'Fixture sintetica di performance.'; }
  return pack;
}
