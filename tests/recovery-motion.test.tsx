// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { AppErrorBoundary, RecoveryScreen } from '../src/ui/recovery/RecoveryScreen';
import { ReactionStage } from '../src/ui/components/LabComponents';
import { reactionPresentation } from '../src/application/presentation';
import type { LabReaction } from '../src/application/laboratory';
afterEach(cleanup);
it('fatal content fixture offers reload/read-only raw export without entering gameplay', async () => {
  const reload = vi.fn(), raw = '{"current":{"broken":true},"backup":{"xp":10}}';
  render(<RecoveryScreen fatal exportRaw={async () => raw} reload={reload} />);
  expect(screen.queryByRole('button',{ name: 'Combina' })).toBeNull();
  fireEvent.click(screen.getByRole('button',{ name: 'Esporta dati originali per recupero' }));
  expect((await screen.findByLabelText('Dati originali JSON · copia e conserva') as HTMLTextAreaElement).value).toBe(raw);
  fireEvent.click(screen.getByRole('button',{ name: 'Ricarica l’osservatorio' })); expect(reload).toHaveBeenCalledOnce();
});
it('boundary keeps raw exceptions off the player screen and retries', () => {
  const log = vi.spyOn(console,'error').mockImplementation(() => undefined);
  let fail = true;
  function Broken() { if (fail) throw new Error('SECRET stack payload'); return <p>Schermata recuperata</p>; }
  render(<AppErrorBoundary exportRaw={async () => '{}'} reload={vi.fn()}><Broken /></AppErrorBoundary>);
  expect(document.body.textContent).not.toContain('SECRET'); fail = false;
  fireEvent.click(screen.getByRole('button',{ name: 'Riprova' })); expect(screen.getByText('Schermata recuperata')).toBeTruthy(); log.mockRestore();
});
it.each(['new','collection','set','hidden-set','anomaly'] as const)('keeps %s semantics and actions with reduced motion', emphasis => {
  const reaction: LabReaction = { kind: emphasis === 'anomaly' ? 'anomaly' : 'new', title: 'Risultato osservato', message: 'Il risultato resta leggibile.', announcement: 'Informazione completa.', emphasis,
    setReveals: [], setRevealDetails: emphasis === 'hidden-set' ? [{ id: 'fungi', name: 'Funghi', kind: 'hidden', accent: 'fungi', motifKey: 'fungi', line: 'Un nuovo Set osservato.' }] : [], collectionCallouts: emphasis === 'collection' ? [{ id: 'water_cycle',name: 'Ciclo dell’acqua',kind:'completed' }] : [] };
  render(<div data-reduced-motion="true"><ReactionStage reaction={reaction} busy={false} onUse={vi.fn()} onRepeat={vi.fn()} onReset={vi.fn()} onViewDetail={vi.fn()} /></div>);
  expect(screen.getByText('Il risultato resta leggibile.')).toBeTruthy(); expect(reactionPresentation(reaction).acknowledgement).toBe(true);
  expect(screen.getByRole('button',{ name: 'Nuovo esperimento' }).hasAttribute('disabled')).toBe(false);
});
