import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { expect, it, vi } from 'vitest';
type Event = { request?: Request; data?: unknown; waitUntil: (value: Promise<unknown>) => void; respondWith: (value: Promise<Response>) => void };
function harness(failed = false, clients = 1) {
  const store = new Map<string,Map<string,Response>>(), listeners = new Map<string,(event: Event) => void>();
  const cache = async (name: string) => {
    if (!store.has(name)) store.set(name,new Map()); const rows=store.get(name)!;
    return { put: async (path:string,response:Response) => { rows.set(path,response); }, match: async (path:string) => rows.get(path)?.clone() };
  };
  const fetch = vi.fn(async () => { if(failed) throw new Error('Offline install'); return new Response('build asset'); });
  const skipWaiting=vi.fn(async()=>undefined), claim=vi.fn(async()=>undefined);
  const worker=readFileSync('src/platform/pwa/worker.js','utf8').replace('__BUILD__','"test"').replace('__ASSETS__','["/index.html","/assets/Catalog-hash.js","/manifest.webmanifest"]');
  // Request in a worker resolves relative asset URLs against the registration origin.
  class WorkerRequest extends Request { constructor(path:string,options?:RequestInit) { super(new URL(path,'https://app.example'),options); } }
  runInNewContext(worker,{ Request:WorkerRequest,URL,fetch,caches:{open:cache,keys:async()=>[...store.keys()],delete:async(name:string)=>store.delete(name)},
    self:{location:{origin:'https://app.example'},addEventListener:(type:string,listener:(event:Event)=>void)=>listeners.set(type,listener),skipWaiting,clients:{claim,matchAll:async()=>Array.from({length:clients},()=>({}))}} });
  async function dispatch(type:string, request?:Request, data?:unknown) {
    let work:Promise<unknown>|undefined, response:Promise<Response>|undefined;
    listeners.get(type)!({request,data,waitUntil:value=>{work=value;},respondWith:value=>{response=value;}});
    await work; return response;
  }
  return {store,fetch,skipWaiting,claim,dispatch,cache};
}
it('worker precaches the exact build atomically without activating an update', async () => {
  const h=harness(); await h.dispatch('install'); expect([...h.store.values()][0]!.size).toBe(3); expect(h.skipWaiting).not.toHaveBeenCalled();
  await h.dispatch('message',undefined,{type:'ACTIVATE_UPDATE'}); expect(h.skipWaiting).toHaveBeenCalledOnce();
});
it('failed precache removes the incomplete build and leaves a prior build usable', async () => {
  const h=harness(true); await (await h.cache('merge-discovery-build-old')).put('/index.html',new Response('prior'));
  await expect(h.dispatch('install')).rejects.toThrow('Offline install'); expect([...h.store.keys()]).toEqual(['merge-discovery-build-old']);
});
it('navigation with Map query works offline, unknown/export/external/non-GET requests are untouched', async () => {
  const h=harness(); await h.dispatch('install');
  // Node Request has no navigate constructor mode; supply the standards-shaped request to the worker.
  const nav={url:'https://app.example/explore/map?element=water',method:'GET',mode:'navigate'} as Request;
  expect(await (await h.dispatch('fetch',nav))!.text()).toBe('build asset');
  for(const url of ['https://app.example/save-export.json','https://github.com/repo','https://app.example/assets/Catalog-hash.js?save=private','https://app.example/__test/release']) expect(await h.dispatch('fetch',new Request(url))).toBeUndefined();
  expect(await h.dispatch('fetch',new Request('https://app.example/settings',{method:'POST'}))).toBeUndefined();
  expect(h.fetch).toHaveBeenCalledTimes(3);
});
it('prior hashed lazy chunks remain readable for an old open tab after explicit activation', async () => {
  const h=harness(false,2); await h.dispatch('install');
  await (await h.cache('merge-discovery-build-old')).put('/assets/Catalog-previous.js',new Response('old lazy'));
  await h.dispatch('activate'); expect(h.store.has('merge-discovery-build-old')).toBe(true);
  expect(await (await h.dispatch('fetch',new Request('https://app.example/assets/Catalog-previous.js')))!.text()).toBe('old lazy');
  expect(h.claim).toHaveBeenCalledOnce();
});
it('cache maintenance keeps current and immediate predecessor when alone, ignores other cache owners', async () => {
  const h=harness(); await h.cache('unrelated'); await h.cache('merge-discovery-build-oldest'); await h.cache('merge-discovery-build-prior'); await h.dispatch('install'); await h.dispatch('activate');
  expect([...h.store.keys()]).toEqual(['unrelated','merge-discovery-build-prior','merge-discovery-build-test']);
});
