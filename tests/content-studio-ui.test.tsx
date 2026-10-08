// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { webcrypto } from 'node:crypto';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { ContentStudio } from '../src/ui/content/ContentStudio';
import { ContentPackApplication } from '../src/application/packs/ContentPackApplication';
import { loadSeed } from '../src/content/load';
import { samplePack } from '../src/content/packs/sample';
import { MemorySaveRepository } from '../src/persistence/memory/MemorySaveRepository';
import { ContentPackDatabase, IndexedDbContentPackRepository } from '../src/persistence/indexeddb/IndexedDbContentPackRepository';
import { UpdateCoordinator } from '../src/platform/pwa/updates';
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks();});
it('flushes its pending autosave before checking activation safety after a fast preview',async()=>{
  vi.stubGlobal('crypto',webcrypto);Object.defineProperty(navigator,'locks',{value:{},configurable:true});
  const draft=await samplePack();draft.manifest.assets={};draft.assets={};
  const database=new ContentPackDatabase('studio_fast_preview'),packs=new IndexedDbContentPackRepository(database),saves=new MemorySaveRepository();
  const save=vi.fn().mockResolvedValue(undefined),app=new ContentPackApplication(loadSeed().content,packs,saves,undefined,undefined,undefined,{load:async()=>draft,save});
  const coordinator=new UpdateCoordinator(vi.fn()),install=vi.spyOn(app,'install').mockImplementation(()=>new Promise(()=>{}));
  const user=userEvent.setup();render(<ContentStudio application={app} busy={false} beginOperation={coordinator.beginOperation} safe={()=>coordinator.getSnapshot().safe}/>);
  await screen.findByLabelText('Titolo del pacchetto');expect(coordinator.getSnapshot().safe).toBe(false);
  await user.click(screen.getByRole('button',{name:'Valida e simula bozza'}));
  await screen.findByText('68/68 raggiungibili');
  await user.click(screen.getByRole('button',{name:'Installa bozza validata e riavvia'}));
  await waitFor(()=>expect(install).toHaveBeenCalledOnce());expect(save).toHaveBeenCalled();expect(screen.queryByRole('alert')).toBeNull();
  cleanup();await database.delete();delete (navigator as unknown as {locks?:unknown}).locks;
});
