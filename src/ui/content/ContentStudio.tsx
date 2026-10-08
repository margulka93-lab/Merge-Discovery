import { useEffect, useMemo, useRef, useState } from 'react';
import type { ContentPackApplication, PreparedPack, PackSnapshot } from '../../application/packs/ContentPackApplication';
import type { ContentStudioApplication } from '../../application/packs/ContentStudioApplication';
import { removeDraft, type StudioDraft, type StudioChoices } from '../../application/packs/authoring';
import { artworkSources } from '../../application/packs/artwork';
import { ContentArtProvider } from '../components/ContentArt';
import { ElementForm, RecipeForm, SetForm, CollectionForm, AnomalyForm, UnlockForm } from './StudioForms';
import { ChoicePicker } from './AuthorControls';
import { authorError, downloadBytes, PackReport } from './ContentImportPanel';
import './content.css';
type Section='pack'|'elements'|'recipes'|'sets'|'collections'|'anomalies'|'unlocks'|'preview';
const sections:Record<Section,string>={pack:'Pacchetto',elements:'Elementi',recipes:'Ricette',sets:'Set',collections:'Collezioni',anomalies:'Anomalie',unlocks:'Unlock',preview:'Anteprima'};
const itemSections=['elements','recipes','sets','collections','anomalies','unlocks'] as const;
export function ContentStudio({application,busy,beginOperation,safe}:{application:ContentPackApplication;busy:boolean;beginOperation:()=> (()=>void)|undefined;safe:()=>boolean}){
  const [studio,setStudio]=useState<ContentStudioApplication>(),[draft,setDraft]=useState<StudioDraft>(),[choices,setChoices]=useState<StudioChoices>(),[installed,setInstalled]=useState<PackSnapshot>();
  const [section,setSection]=useState<Section>('pack'),[editing,setEditing]=useState<string>(),[reset,setReset]=useState(0),[query,setQuery]=useState(''),[page,setPage]=useState(0);
  const [error,setError]=useState(''),[status,setStatus]=useState(''),[working,setWorking]=useState(false),[prepared,setPrepared]=useState<PreparedPack>();
  const [pairWarning,setPairWarning]=useState(''),[pathTarget,setPathTarget]=useState(''),[path,setPath]=useState<Awaited<ReturnType<ContentStudioApplication['path']>>>([]);
  const latestDraft=useRef<StudioDraft>(undefined);
  const flushDraft=useRef<(()=>Promise<void>)>(undefined);
  useEffect(()=>{let alive=true;void (async()=>{const value=await application.studio(),loaded=await value.loadDraft(),installed=await application.load();if(alive){setStudio(value);setDraft(loaded);setInstalled(installed);}})().catch(cause=>{if(alive)setError(authorError(cause));});return()=>{alive=false;};},[application]);
  useEffect(()=>{if(!studio||!draft)return;let alive=true;void studio.choices(draft).then(value=>{if(alive)setChoices(value);},cause=>{if(alive)setError(authorError(cause));});return()=>{alive=false;};},[studio,draft]);
  useEffect(()=>{latestDraft.current=draft;if(!studio||!draft)return;let alive=true,write:Promise<void>|undefined;const release=beginOperation();
    const persist=()=>write??=studio.saveDraft(draft).then(()=>{if(alive)setStatus('Bozza salvata localmente. Nessun contenuto installato automaticamente.');},cause=>{if(alive)setError(`Bozza non salvata: ${authorError(cause)}. Esporta il ZIP per conservarla.`);throw cause;}).finally(()=>release?.());
    const timer=setTimeout(()=>{void persist().catch(()=>undefined);},400);flushDraft.current=()=>{clearTimeout(timer);return persist();};
    return()=>{alive=false;clearTimeout(timer);if(!write)release?.();};},[studio,draft,beginOperation]);
  useEffect(()=>()=>{if(studio&&latestDraft.current){const release=beginOperation();void studio.saveDraft(latestDraft.current).catch(()=>undefined).finally(()=>release?.());}},[studio,beginOperation]);
  const art=useMemo(()=>draft?artworkSources([draft]):[],[draft]);
  const commit=(value:StudioDraft|(()=>StudioDraft))=>{try{const next=typeof value==='function'?value():value;
    if(draft&&itemSections.includes(section as typeof itemSections[number])){const s=section as typeof itemSections[number],added=next.patch[s]?.find(e=>!draft.patch[s]?.some(old=>old.id===e.id));if(added)setEditing(added.id);}
    setDraft(next);setPrepared(undefined);setStatus('Bozza modificata…');setError('');}catch(cause){setError(authorError(cause));}};
  const run=async(action:()=>Promise<void>,activate=false)=>{if(working||busy)return;let release:(()=>void)|undefined;setWorking(true);setError('');
    try{if(activate){await flushDraft.current?.();if(!safe()||!navigator.locks)throw new Error('Termina la reazione corrente prima di attivare i contenuti. È necessario Web Locks.');}
      release=beginOperation();if(release)await action();}catch(cause){setError(authorError(cause));}finally{release?.();setWorking(false);}};
  const switchSection=(next:Section)=>{setSection(next);setEditing(undefined);setQuery('');setPage(0);setPairWarning('');requestAnimationFrame(()=>document.getElementById('studio-section')?.focus({preventScroll:true}));};
  if(!studio||!draft||!choices)return <section className="content-author"><h3>Studio contenuti</h3>{error?<p role="alert" className="author-error">{error}</p>:<p role="status">Apertura della bozza…</p>}</section>;
  const disabled=working||busy, formKey=`${section}-${editing??'new'}-${reset}`;
  const items=itemSections.includes(section as typeof itemSections[number])?draft.patch[section as typeof itemSections[number]]??[]:[];
  const names=draft.patch.locales?.it??{}, filtered=items.filter(item=>`${item.id} ${'nameKey'in item?names[item.nameKey]:''}`.toLowerCase().includes(query.toLowerCase()));
  const collisions=(a:string,b:string,except?:string)=>{if(!a||!b){setPairWarning('');return;}void studio.collisions(draft,a,b,except).then(rows=>setPairWarning(rows.length?`Coppia già definita: ${rows.map(r=>`${r.id} → ${r.result}`).join('; ')}. La validazione controllerà ambiguità e seed locked.`:''),cause=>setError(authorError(cause)));};
  const image=(id:string,_key:string,file:File)=>void run(async()=>{commit(await studio.imageForItem(draft,'elements',id,new Uint8Array(await file.arrayBuffer())));});
  return <ContentArtProvider artwork={art}><section className="content-author content-studio" aria-label="Studio contenuti" aria-busy={working}>
    <header><p className="eyebrow">Taccuino dell’autrice</p><h3>Studio contenuti</h3><p>Componi una proposta, verifica il percorso, poi scegli se installarla solo su questo browser.</p></header>
    <p role="status">{status||'Bozza locale · separata dal progresso del gioco.'}</p>{error&&<p role="alert" className="author-error">{error}</p>}
    <fieldset disabled={disabled} className="studio-workspace"><legend className="sr-only">Editor del pacchetto</legend>
    <nav aria-label="Sezioni dello Studio" className="studio-nav">{Object.entries(sections).map(([id,label])=><button key={id} type="button" aria-pressed={section===id} onClick={()=>switchSection(id as Section)}>{label}</button>)}</nav>
    <div className="studio-actions"><button onClick={()=>void run(async()=>{downloadBytes(await studio.export(draft),`${draft.manifest.packId}.zip`);})}>Esporta ZIP della bozza</button><button className="secondary warm" onClick={()=>void run(async()=>{await studio.saveDraft(draft);setPrepared(await studio.preview(draft));switchSection('preview');})}>Valida e simula bozza</button></div>
    <h4 id="studio-section" tabIndex={-1}>{sections[section]}</h4>
    {section==='pack'&&<div className="studio-metadata"><div className="studio-grid">
      <label>Titolo del pacchetto<input maxLength={100} value={draft.manifest.title} onChange={e=>commit({...draft,manifest:{...draft.manifest,title:e.target.value}})} /></label>
      <label>Identificatore del pacchetto<input maxLength={64} value={draft.manifest.packId} onChange={e=>commit({...draft,manifest:{...draft.manifest,packId:e.target.value}})} /></label>
      <label>Namespace del pacchetto<input maxLength={64} value={draft.manifest.namespace} onChange={e=>commit({...draft,manifest:{...draft.manifest,namespace:e.target.value}})} /></label>
      <label>Versione del pacchetto<input value={draft.manifest.version} onChange={e=>commit({...draft,manifest:{...draft.manifest,version:e.target.value}})} /></label>
      <label>Versione contenuti proposta<input value={draft.manifest.contentVersion} onChange={e=>commit({...draft,manifest:{...draft.manifest,contentVersion:e.target.value}})} /><small>Attiva: {choices.activeVersion}. La proposta deve essere successiva.</small></label>
    </div><p>1. Crea gli elementi (o un nuovo Set). 2. Definisci ricette e prerequisiti. 3. Valida e simula. 4. Esporta o installa la proposta. Nessun JSON da scrivere a mano.</p>
      <label>Apri ZIP nello Studio<input type="file" accept=".zip,application/zip" onChange={e=>{const file=e.target.files?.[0];if(file)void run(async()=>{if(file.size>16*1024*1024)throw new Error('ZIP oltre 16 MiB.');commit(await studio.import(new Uint8Array(await file.arrayBuffer())));});}} /></label>
      <details><summary>Nuova bozza vuota</summary><p>La bozza attuale verrà sostituita. Esporta prima il ZIP per conservarla.</p><button onClick={()=>void run(async()=>{commit(await studio.blank());setReset(reset+1);})}>Crea nuova bozza vuota</button></details>
      <h5>Modifica un pacchetto installato</h5>{installed?.packs.map(p=><button key={p.manifest.packId} onClick={()=>void run(async()=>{commit(await studio.editInstalled(p.manifest.packId));setReset(reset+1);})}>Prepara aggiornamento {p.manifest.packId}</button>)}
      <details><summary>Dipendenze e simboli · avanzate</summary><p>Le dipendenze richiedono versioni esatte; il validator segnala cicli o assenze. I simboli non aggiungono codice di gioco.</p>
        {draft.manifest.dependencies.map((d,i)=><div className="studio-grid" key={i}><label>Pacchetto dipendenza {i+1}<input value={d.packId} onChange={e=>commit({...draft,manifest:{...draft.manifest,dependencies:draft.manifest.dependencies.map((v,n)=>n===i?{...v,packId:e.target.value}:v)}})} /></label><label>Versione dipendenza {i+1}<input value={d.version} onChange={e=>commit({...draft,manifest:{...draft.manifest,dependencies:draft.manifest.dependencies.map((v,n)=>n===i?{...v,version:e.target.value}:v)}})} /></label><button onClick={()=>commit({...draft,manifest:{...draft.manifest,dependencies:draft.manifest.dependencies.filter((_,n)=>n!==i)}})}>Rimuovi dipendenza {i+1}</button></div>)}
        <button onClick={()=>commit({...draft,manifest:{...draft.manifest,dependencies:[...draft.manifest.dependencies,{packId:'',version:'1.0.0'}]}})}>Aggiungi dipendenza</button>
        {(['tags','eras','features']as const).map(kind=><label key={kind}>Simboli {kind} · virgole<input value={draft.patch.registries?.[kind].join(', ')??''} onChange={e=>commit({...draft,patch:{...draft.patch,registries:{...draft.patch.registries??{tags:[],eras:[],features:[]},[kind]:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}}})} /></label>)}
      </details></div>}
    {items.length>0&&<section className="studio-list" aria-label="Definizioni nella bozza"><label>Cerca nella bozza<input type="search" value={query} onChange={e=>{setQuery(e.target.value);setPage(0);}}/></label><p>{filtered.length} definizioni · solo quelle appartenenti a questa bozza sono modificabili.</p><ul>{filtered.slice(page*20,(page+1)*20).map(item=><li key={item.id}><strong>{'nameKey'in item?names[item.nameKey]??item.id:item.id}</strong><div><button aria-label={`Modifica ${item.id}`} onClick={()=>{setEditing(item.id);setReset(reset+1);}}>Modifica</button><button aria-label={`Rimuovi ${item.id} dalla bozza`} onClick={()=>commit(()=>removeDraft(draft,section as typeof itemSections[number],item.id))}>Rimuovi dalla bozza</button></div></li>)}</ul>{filtered.length>20&&<div><button disabled={!page} onClick={()=>setPage(page-1)}>Definizioni precedenti</button><button disabled={(page+1)*20>=filtered.length} onClick={()=>setPage(page+1)}>Altre definizioni</button></div>}<button onClick={()=>{setEditing(undefined);setReset(reset+1);}}>Nuova definizione</button><p>Le rimozioni possono rendere invalidi i riferimenti. Un aggiornamento installato non può perdere ID precedenti.</p></section>}
    {section==='elements'&&<ElementForm key={formKey} draft={draft} choices={choices} commit={commit} current={draft.patch.elements?.find(e=>e.id===editing)} image={image}/>}
    {section==='recipes'&&<><RecipeForm key={formKey} draft={draft} choices={choices} commit={commit} current={draft.patch.recipes?.find(e=>e.id===editing)} collisions={collisions}/>{pairWarning&&<p className="author-error" role="status">{pairWarning}</p>}</>}
    {section==='sets'&&<SetForm key={formKey} draft={draft} choices={choices} commit={commit} current={draft.patch.sets?.find(e=>e.id===editing)} image={(id,file)=>void run(async()=>{commit(await studio.imageForItem(draft,'sets',id,new Uint8Array(await file.arrayBuffer())));})}/>}
    {section==='collections'&&<CollectionForm key={formKey} draft={draft} choices={choices} commit={commit} current={draft.patch.collections?.find(e=>e.id===editing)}/>}
    {section==='anomalies'&&<AnomalyForm key={formKey} draft={draft} choices={choices} commit={commit} current={draft.patch.anomalies?.find(e=>e.id===editing)}/>}
    {section==='unlocks'&&<UnlockForm key={formKey} draft={draft} choices={choices} commit={commit} current={draft.patch.unlocks?.find(e=>e.id===editing)}/>}
    {section==='preview'&&<><p>La validazione completa usa lo stesso resolver, validator e simulator del gioco e del CLI.</p>{prepared?<><PackReport prepared={prepared}/><button className="combine-button" onClick={()=>void run(async()=>{await studio.saveDraft(draft);await application.install(prepared);window.location.reload();},true)}>Installa bozza validata e riavvia</button></>:<p>Premi Valida e simula bozza. Ogni modifica invalida l’anteprima precedente.</p>}
      <ChoicePicker label="Percorso verso un elemento" value={pathTarget} choices={choices.elements} change={value=>{setPathTarget(value);void studio.path(draft,value).then(setPath,cause=>setError(authorError(cause)));}}/>
      <p>Relazioni dichiarate, fino a 30 nodi. Il percorso effettivamente raggiungibile è verificato dalla simulazione; questo schema non sostituisce il report.</p><ol className="author-path">{path.map((node,i)=><li key={i}><strong>{node.id}</strong> ← {node.inputs.join(' + ')||'ciclo'}<small>{node.recipe}{node.requirements.length?` · ${node.requirements.length} prerequisiti`:''}{node.cycle?' · CICLO':''}</small></li>)}</ol></>}
    </fieldset></section></ContentArtProvider>;
}
