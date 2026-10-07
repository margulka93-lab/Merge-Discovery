// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { PlatformRecovery } from '../src/app/PlatformRecovery';
import { updates } from '../src/platform/pwa/updates';
import { exportRawRecovery } from '../src/app/rawRecovery';
import { SaveApplication } from '../src/application/save/SaveApplication';
import { IndexedDbSaveRepository } from '../src/persistence/indexeddb/IndexedDbSaveRepository';
import { loadSeed } from '../src/content/load';
import { saveRuntime, refreshRuntimeBootForRetry } from '../src/app/saveRuntime';
afterEach(cleanup);
it('fatal raw export uses exactly the existing Phase 2 recovery envelope without writing a save', async () => {
  const repository = new IndexedDbSaveRepository(), app = new SaveApplication(repository,loadSeed());
  await app.start(); const before = await repository.load();
  expect(await exportRawRecovery()).toBe(await app.exportRawRecovery());
  expect(await repository.load()).toEqual(before); repository.database.close();
});
it('a boundary retry refreshes the cached boot snapshot from the committed save without rewarding again', async () => {
  const runtime = saveRuntime(), initialBoot = runtime.boot;
  const initial = await initialBoot;
  await runtime.application.combine('energy','energy');
  const committed = await runtime.application.repository.load();
  const refreshed = await refreshRuntimeBootForRetry();
  expect(refreshed!.save.xp).toBeGreaterThan(initial.save.xp);
  expect((await saveRuntime().boot).save).toEqual(refreshed!.save);
  expect(await runtime.application.repository.load()).toEqual(committed);
});
it('fatal recovery exports read-only data before accepting a healthy waiting build through reload', async () => {
  let finish!: (value: string) => void;
  const raw = new Promise<string>(resolve => { finish = resolve; }), reload = vi.fn(), postMessage = vi.fn();
  render(<PlatformRecovery fatal exportRaw={() => raw} reload={reload} />);
  act(() => updates.offer({ postMessage }));
  fireEvent.click(screen.getByRole('button',{name:'Esporta dati originali per recupero'}));
  expect(screen.queryByRole('button',{name:'Aggiorna ora'})).toBeNull();
  expect(screen.getByRole('button',{name:'Ricarica l’osservatorio'}).hasAttribute('disabled')).toBe(true);
  await act(async () => { finish('{"current":{"xp":100},"backup":{"xp":0}}'); await raw; });
  expect((screen.getByLabelText('Dati originali JSON · copia e conserva') as HTMLTextAreaElement).value).toContain('100');
  fireEvent.click(screen.getByRole('button',{name:'Ricarica l’osservatorio'}));
  expect(postMessage).toHaveBeenCalledExactlyOnceWith({type:'ACTIVATE_UPDATE'});
  expect(reload).not.toHaveBeenCalled();
});
