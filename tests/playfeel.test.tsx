// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { LaboratoryApplication } from '../src/app/App';
import { SaveApplication } from '../src/application/save/SaveApplication';
import { MemorySaveRepository } from '../src/persistence/memory/MemorySaveRepository';
import { SaveError } from '../src/application/save/errors';
import { loadSeed } from '../src/content/load';
afterEach(cleanup);
beforeAll(()=>{ HTMLElement.prototype.setPointerCapture=vi.fn(); });
async function setup() {
  const repo=new MemorySaveRepository(),app=new SaveApplication(repo,loadSeed());
  const view=render(<LaboratoryApplication application={app} boot={app.start()}/>);
  const user=userEvent.setup(); await screen.findByRole('button',{name:'Tavolo libero'});
  const energy=()=>screen.getByRole('button',{name:/^Energia, elemento del set/});
  const attempt=async()=>{await user.click(energy()); await user.click(energy()); await user.click(screen.getByRole('button',{name:'Combina figure'}));};
  return {repo,app,user,attempt,...view};
}
it('defaults to table, makes committed and known results usable with zero replay writes/XP and no modal',async()=>{
  const {app,attempt,container}=await setup(); const combine=vi.spyOn(app,'combine');
  await attempt(); await waitFor(()=>expect(container.querySelector('[data-element="heat"]')).not.toBeNull());
  const first=await app.load(); expect(combine).toHaveBeenCalledTimes(1);
  await attempt(); await waitFor(()=>expect(container.querySelectorAll('[data-element="heat"]')).toHaveLength(2));
  expect(combine).toHaveBeenCalledTimes(1); expect((await app.load()).save).toEqual(first.save); expect((await app.load()).revision).toBe(first.revision);
  expect(screen.queryByRole('dialog')).toBeNull(); expect(screen.queryByRole('button',{name:'Nuovo esperimento'})).toBeNull();
});
it('failed persistence retains both visual inputs and retry commits before the result appears',async()=>{
  const {repo,app,attempt,user,container}=await setup();
  const before=await app.load(); vi.spyOn(repo,'persist').mockRejectedValueOnce(new SaveError('persistence_failed','fixture'));
  await attempt(); await screen.findByRole('alert');
  expect(container.querySelectorAll('[data-element="energy"]')).toHaveLength(2); expect(container.querySelector('[data-element="heat"]')).toBeNull(); expect((await app.load()).save).toEqual(before.save);
  await user.click(screen.getByRole('button',{name:'Combina figure'}));
  await waitFor(()=>expect(container.querySelector('[data-element="heat"]')).not.toBeNull()); expect((await app.load()).save.discoveredElements.heat).toBeTruthy();
});
