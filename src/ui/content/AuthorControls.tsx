import { useId, useState } from 'react';
import type { AuthorChoice, Requirement } from '../../application/packs/authoring';
export function ChoicePicker({label,value,choices,change,optional=false}:{label:string;value:string;choices:AuthorChoice[];change:(id:string)=>void;optional?:boolean}){
  const [query,setQuery]=useState(''), id=useId();const q=query.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
  const shown=choices.filter(c=>c.id===value||`${c.id} ${c.name}`.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().includes(q));
  return <div className="author-picker"><label htmlFor={`${id}-search`}>Cerca {label.toLowerCase()}</label><input id={`${id}-search`} type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Nome o identificatore" />
    <label htmlFor={id}>{label}</label><select id={id} value={value} onChange={e=>change(e.target.value)}><option value="">{optional?'Nessuno':'Scegli…'}</option>{shown.map(c=><option key={c.id} value={c.id}>{c.name} · {c.id}</option>)}</select></div>;
}
export function MemberPicker({label,selected,choices,change}:{label:string;selected:string[];choices:AuthorChoice[];change:(ids:string[])=>void}){
  const [query,setQuery]=useState(''),[page,setPage]=useState(0), visible=choices.filter(c=>`${c.name} ${c.id}`.toLowerCase().includes(query.toLowerCase()));
  return <fieldset className="author-members"><legend>{label}</legend><label>Cerca membri<input type="search" value={query} onChange={e=>{setQuery(e.target.value);setPage(0);}} /></label>
    <p>{selected.length} selezionati · {visible.length} corrispondenze</p><div className="author-member-grid">{visible.slice(page*30,(page+1)*30).map(c=><label key={c.id}><input type="checkbox" checked={selected.includes(c.id)} onChange={e=>change(e.target.checked?[...selected,c.id]:selected.filter(id=>id!==c.id))} />{c.name}</label>)}</div>
    {visible.length>30&&<div><button type="button" disabled={!page} onClick={()=>setPage(page-1)}>Membri precedenti</button><button type="button" disabled={(page+1)*30>=visible.length} onClick={()=>setPage(page+1)}>Altri membri</button></div>}</fieldset>;
}
const labels:Record<Requirement['type'],string>={min_level:'Livello minimo',element_discovered:'Elemento scoperto',set_revealed:'Set rivelato',set_completion_at_least:'Completamento Set',feature_unlocked:'Funzione sbloccata',era_eligible:'Era disponibile'};
export function RequirementEditor({value,change,elements,sets,eras,features}:{value:Requirement[];change:(v:Requirement[])=>void;elements:AuthorChoice[];sets:AuthorChoice[];eras:AuthorChoice[];features:AuthorChoice[]}){
  const [kind,setKind]=useState<Requirement['type']>('min_level'),[target,setTarget]=useState(''),[number,setNumber]=useState(1);
  const choices=kind==='element_discovered'?elements:kind==='feature_unlocked'?features:kind==='era_eligible'?eras:sets;
  const add=()=>{let req:Requirement;switch(kind){case'min_level':req={type:kind,level:number};break;case'element_discovered':req={type:kind,elementId:target};break;case'set_revealed':req={type:kind,setId:target};break;case'set_completion_at_least':req={type:kind,setId:target,percent:number};break;case'feature_unlocked':req={type:kind,featureId:target};break;case'era_eligible':req={type:kind,eraId:target};break;}change([...value,req]);};
  return <fieldset className="author-requirements"><legend>Prerequisiti · devono essere tutti soddisfatti</legend><ul>{value.map((r,i)=><li key={i}>{labels[r.type]}: {Object.entries(r).filter(([key])=>key!=='type').map(([,v])=>String(v)).join(' · ')}<button type="button" onClick={()=>change(value.filter((_,n)=>n!==i))} aria-label={`Rimuovi requisito ${i+1}`}>Rimuovi</button></li>)}</ul>
    <label>Tipo di requisito<select value={kind} onChange={e=>{setKind(e.target.value as Requirement['type']);setTarget('');setNumber(e.target.value==='set_completion_at_least'?100:1);}}>{Object.entries(labels).map(([key,text])=><option key={key} value={key}>{text}</option>)}</select></label>
    {kind!=='min_level'&&<ChoicePicker label="Oggetto del requisito" value={target} change={setTarget} choices={choices} />}
    {(kind==='min_level'||kind==='set_completion_at_least')&&<label>{kind==='min_level'?'Livello richiesto':'Percentuale richiesta'}<input type="number" min={kind==='min_level'?1:0} max={kind==='min_level'?100:100} value={number} onChange={e=>setNumber(Number(e.target.value))} /></label>}
    <button type="button" disabled={kind!=='min_level'&&!target} onClick={add}>Aggiungi requisito</button><p>Il validator controlla curva XP, riferimenti e cicli; questi controlli non approvano le scelte di design.</p></fieldset>;
}
