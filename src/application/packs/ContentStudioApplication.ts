import type { ContentPackApplication } from './ContentPackApplication';
import type { ContentPackage } from '../../domain/model/types';
import type { ContentIndex } from '../../domain/model/types';
import type { ContentPackRepository } from '../../persistence/ContentPackRepository';
import type { AuthorDraftRepository } from '../../persistence/AuthorDraftRepository';
import { composePacks } from '../../content/packs/compose';
import { readPack, writePack, imageDimensions } from '../../content/packs/archive';
import { digest, PACK_LIMITS, PackError } from '../../content/packs/model';
import { authorChoices, authorPath, cloneDraft, newDraft, nextVersion, pairCollisions, type StudioDraft } from './authoring';
export class ContentStudioApplication {
  private draftWrites:Promise<void> = Promise.resolve();
  private cached?:{revision:number;index:ContentIndex};
  constructor(readonly importer:ContentPackApplication,private seed:ContentPackage,private packs:ContentPackRepository,private drafts?:AuthorDraftRepository,
    private verifyImage:(bytes:Uint8Array,mime:string)=>Promise<void> = async()=>{}) {}
  private async active() { const stored=await this.packs.load();if(this.cached?.revision===stored.revision)return this.cached.index;
    const index=composePacks(this.seed,stored.packs).index;this.cached={revision:stored.revision,index};return index; }
  async blank() { return newDraft((await this.active()).content.manifest.contentVersion); }
  async loadDraft() { await this.draftWrites; return await this.drafts?.load() ?? this.blank(); }
  saveDraft(draft:StudioDraft) { const copy=structuredClone(draft);const write=this.draftWrites.then(async()=>{await this.drafts?.save(copy);});this.draftWrites=write.catch(()=>undefined);return write; }
  async choices(draft:StudioDraft) { return authorChoices(await this.active(),draft); }
  async collisions(draft:StudioDraft,a:string,b:string,except?:string) { return pairCollisions(await this.active(),draft,a,b,except); }
  async path(draft:StudioDraft,target:string) { return authorPath(await this.active(),draft,target); }
  async import(bytes:Uint8Array) { return readPack(bytes); }
  async export(draft:StudioDraft) { return writePack(draft); }
  async preview(draft:StudioDraft) { return this.importer.preview(await writePack(draft)); }
  async editInstalled(packId:string) {
    const installed=(await this.packs.load()).packs.find(p=>p.manifest.packId===packId);if(!installed)throw new PackError(['Pacchetto non installato.']);
    const draft=structuredClone(installed);draft.manifest.version=nextVersion(draft.manifest.version);draft.manifest.contentVersion=nextVersion((await this.active()).content.manifest.contentVersion);return draft;
  }
  async image(draft:StudioDraft,key:string,bytes:Uint8Array) {
    if(bytes.length>PACK_LIMITS.imageBytes)throw new PackError(['Immagine oltre 2 MiB.']);
    const mime=bytes[0]===137?'image/png':'image/webp',dimensions=imageDimensions(bytes,mime);
    if(dimensions.width>2048||dimensions.height>2048)throw new PackError(['Immagine oltre 2048×2048.']);
    await this.verifyImage(bytes,mime);const next=cloneDraft(draft);
    next.manifest.assets[key]={path:`art/${await digest(new TextEncoder().encode(key))}.${mime==='image/png'?'png':'webp'}`,mime,sha256:await digest(bytes),...dimensions};next.assets[key]=bytes.slice();return next;
  }
  async imageForItem(draft:StudioDraft,kind:'elements'|'sets',id:string,bytes:Uint8Array){
    const next=cloneDraft(draft),item=next.patch[kind]?.find(item=>item.id===id);if(!item)throw new PackError(['Definizione non appartenente alla bozza.']);
    const key=`${draft.manifest.namespace}.${kind}.${id}`;
    if('artKey'in item)item.artKey=key;else item.iconKey=key;
    const used=new Set([...(next.patch.elements??[]).map(e=>e.artKey),...(next.patch.sets??[]).map(s=>s.iconKey)]);
    for(const key of Object.keys(next.manifest.assets))if(!used.has(key)){delete next.manifest.assets[key];delete next.assets[key];}
    return this.image(next,key,bytes);
  }
}
