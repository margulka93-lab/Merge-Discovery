// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { App } from '../src/app/App';
import { DiagnosticStatus } from '../src/ui/DiagnosticStatus';
import { SaveDiagnostics } from '../src/ui/SaveDiagnostics';
import { SaveApplication } from '../src/application/save/SaveApplication';
import { MemorySaveRepository } from '../src/persistence/memory/MemorySaveRepository';
import { loadSeed } from '../src/content/load';

afterEach(cleanup);
it('boots the diagnostic scaffold without revealing hidden content', async () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Merge Discovery' })).toBeTruthy();
  expect(screen.getAllByRole('status').some(e => e.textContent?.includes('Motore pronto'))).toBe(true);
  await screen.findByText(/Salvataggio creato\/caricato/);
  expect(document.body.textContent).not.toMatch(/Funghi|Muffa|67|lunar_life/);
});
it('diagnostic export/preview remains non-destructive until explicit confirmation', async () => {
  const repo = new MemorySaveRepository(); const app = new SaveApplication(repo, loadSeed(), () => '2026-10-06T10:00:00.000Z');
  render(<SaveDiagnostics application={app} boot={app.start()} />);
  await screen.findByText(/Salvataggio creato\/caricato/);
  const before = await repo.load();
  fireEvent.click(screen.getByRole('button', { name: 'Esporta JSON / verifica round-trip' }));
  await screen.findByText(/Export\/import validato/);
  expect(await repo.load()).toEqual(before);
  fireEvent.click(screen.getByRole('button', { name: 'Verifica import' }));
  await screen.findByText(/Preview: 4 scoperte/);
  expect(await repo.load()).toEqual(before);
  fireEvent.click(screen.getByRole('button', { name: 'Conferma sostituzione del progresso' }));
  await screen.findByRole('button', { name: 'Verifica import' });
  // Wait for the consumed preview to disappear after successful persistence.
  const { waitFor } = await import('@testing-library/react');
  await waitFor(() => expect(screen.queryByText(/Preview:/)).toBeNull());
  expect((await repo.load()).revision).toBe(before.revision + 1);
});
it('diagnostic corruption surfaces recovery without silently creating a new game', async () => {
  const repo = new MemorySaveRepository({ revision: 1, current: { broken: true }, backup: null });
  const app = new SaveApplication(repo, loadSeed()); const before = await repo.load();
  render(<SaveDiagnostics application={app} boot={app.start()} />);
  await screen.findByRole('alert');
  expect(screen.getByRole('button', { name: 'Esporta dati originali per recupero' })).toBeTruthy();
  expect(await repo.load()).toEqual(before);
  expect(document.body.textContent).not.toMatch(/Funghi|Muffa|lunar_life/);
});
it('renders a content boot failure as an accessible alert', () => {
  render(<DiagnosticStatus ready={false} error="Contenuto non valido" />);
  expect(screen.getByRole('alert').textContent).toBe('Contenuto non valido');
});
