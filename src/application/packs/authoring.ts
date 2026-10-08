import type { ContentIndex, ElementDefinition as Element, RecipeDefinition as Recipe, SetDefinition, CollectionDefinition, AnomalyDefinition, UnlockRule as UnlockDefinition, Requirement } from '../../domain/model/types';
import type { ContentPack } from '../../content/packs/model';
import { pairKey } from '../../domain/resolver/pair';
import { PackError } from '../../content/packs/model';
export type StudioDraft = ContentPack;
export const cloneDraft = (draft:StudioDraft):StudioDraft => ({...draft,manifest:structuredClone(draft.manifest),patch:structuredClone(draft.patch),assets:{...draft.assets}});
export type { Element, Recipe, SetDefinition, CollectionDefinition, AnomalyDefinition, UnlockDefinition, Requirement };
export const suggestedId = (name: string) => name.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').replace(/^[^a-z]+/,'') || 'nuovo';
export const nextVersion = (version: string) => { const parts = version.split('.').map(Number); return `${parts[0]}.${parts[1]}.${parts[2]!+1}`; };
export function newDraft(contentVersion: string): StudioDraft { return {
  manifest:{schemaVersion:1,packId:'my_pack',namespace:'my_pack',title:'Il mio pacchetto',version:'1.0.0',contentVersion:nextVersion(contentVersion),minimumSaveSchemaVersion:1,reviewStatus:'proposed',dependencies:[],assets:{}},
  patch:{elements:[],recipes:[],sets:[],collections:[],anomalies:[],unlocks:[],registries:{tags:[],features:[],eras:[]},locales:{it:{}},visibility:{initialRevealedSetIds:[],setAnnouncements:[],collectionReveals:[]}},assets:{},
}; }
export interface AuthorChoice {id:string;name:string}
export interface StudioChoices {elements:AuthorChoice[];sets:AuthorChoice[];recipes:AuthorChoice[];eras:AuthorChoice[];features:AuthorChoice[];activeVersion:string;coreSetIds:string[];nextSetOrder:number}
export function authorChoices(index: ContentIndex, draft: StudioDraft): StudioChoices {
  const locale = {...index.content.locales.it,...draft.patch.locales?.it};
  const choices = (list:{id:string;nameKey:string}[]) => [...new Map(list.map(item => [item.id,{id:item.id,name:locale[item.nameKey] ?? item.id}])).values()].sort((a,b) => a.name.localeCompare(b.name,'it'));
  return {elements:choices([...index.content.elements,...draft.patch.elements ?? []]),sets:choices([...index.content.sets,...draft.patch.sets ?? []]),
    recipes:[...new Map([...index.content.recipes,...draft.patch.recipes??[]].map(r=>[r.id,r])).values()].map(r=>({id:r.id,name:`${r.inputs.join(' + ')} → ${r.resultElementId}`})),
    eras:[...new Set([...index.content.registries.eras,...draft.patch.registries?.eras ?? []])].map(id=>({id,name:id})),
    features:[...new Set([...index.content.registries.features,...draft.patch.registries?.features ?? []])].map(id=>({id,name:id})),
    activeVersion:index.content.manifest.contentVersion,coreSetIds:index.content.sets.map(s=>s.id),nextSetOrder:Math.max(...index.content.sets.map(s=>s.sortOrder),...(draft.patch.sets??[]).map(s=>s.sortOrder))+1};
}
/** Form edits affect a draft only; validation/simulation always use the shared importer. */
export function upsertDraft<T extends {id:string}>(draft: StudioDraft, section:'elements'|'recipes'|'sets'|'collections'|'anomalies'|'unlocks', item:T, editingId?:string) {
  const next = cloneDraft(draft), items = next.patch[section] ?? [];
  if(items.some(e=>e.id===item.id)&&editingId!==item.id)throw new PackError([`ID già nella bozza: ${item.id}. Usa Modifica per aggiornarlo.`]);
  Object.assign(next.patch,{[section]:[...items.filter(e=>e.id!==item.id),item]}); return next;
}
export function removeDraft(draft:StudioDraft,section:'elements'|'recipes'|'sets'|'collections'|'anomalies'|'unlocks',id:string){
  const next=cloneDraft(draft);Object.assign(next.patch,{[section]:(next.patch[section]??[]).filter(e=>e.id!==id)});
  const used=new Set([...(next.patch.elements??[]).map(e=>e.artKey),...(next.patch.sets??[]).map(s=>s.iconKey)]);
  for(const key of Object.keys(next.manifest.assets))if(!used.has(key)){delete next.manifest.assets[key];delete next.assets[key];}return next;
}
export function registerSymbols(draft:StudioDraft,kind:'tags'|'eras'|'features',ids:string[]){const next=cloneDraft(draft);next.patch.registries??={tags:[],features:[],eras:[]};next.patch.registries[kind]=[...new Set([...next.patch.registries[kind],...ids])];return next;}
export function localizeDraft(draft: StudioDraft, item:{nameKey:string;descriptionKey:string}, name:string, description:string) {
  const next = cloneDraft(draft); next.patch.locales ??= {it:{}};
  next.patch.locales.it[item.nameKey] = name; next.patch.locales.it[item.descriptionKey] = description; return next;
}
export function pairCollisions(index:ContentIndex, draft:StudioDraft, a:string,b:string, except?:string) {
  const key=pairKey(a,b);
  return [...new Map([...index.content.recipes,...draft.patch.recipes ?? []].map(r=>[r.id,r])).values()].filter(r=>r.id!==except && pairKey(...r.inputs)===key).map(r=>({id:r.id,result:r.resultElementId}));
}
export function authorPath(index:ContentIndex,draft:StudioDraft,target:string) {
  const recipes=[...new Map([...index.content.recipes,...draft.patch.recipes ?? []].map(r=>[r.id,r])).values()], seen=new Set<string>();
  const nodes:{id:string;inputs:string[];recipe:string;requirements:Requirement[];cycle:boolean}[]=[];
  const visit=(id:string,path:Set<string>)=>{if(nodes.length>=30||seen.has(id))return;seen.add(id);const recipe=recipes.find(r=>r.resultElementId===id);if(!recipe)return;
    nodes.push({id,inputs:recipe.inputs,recipe:recipe.id,requirements:recipe.requirements ?? [],cycle:path.has(id)});
    const next=new Set([...path,id]);for(const input of recipe.inputs){if(nodes.length>=30)break;if(next.has(input)){nodes.push({id:input,inputs:[],recipe:'Ciclo',requirements:[],cycle:true});}else visit(input,next);}
  }; visit(target,new Set()); return nodes;
}
