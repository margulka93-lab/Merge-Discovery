// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { ElementCard, DiscoveryLevelBadge, ReactionStage } from '../src/ui/components/LabComponents';
import { ElementArt } from '../src/ui/components/ElementArt';
import type { LabElement, LabModel } from '../src/application/laboratory';
import { BottomNavigation } from '../src/ui/shell/AppShell';
afterEach(cleanup);
const element: LabElement = { id: 'water', name: 'Acqua', description: 'Descrizione', setName: 'Mondo', accent: '--accent-world', artKey: 'element.water', rarity: 'Comune', favorite: true, context: '○ Già provato: nessuna reazione' };

it('compact navigation keeps full accessible destination labels and current-page semantics', async () => {
  const navigate = vi.fn();
  const destinations = [{id:'lab',label:'Laboratorio',symbol:'✧'},{id:'settings',label:'Impostazioni',symbol:'⚙'}];
  render(<BottomNavigation model={{mobileDestinations:destinations} as LabModel} active="lab" navigate={navigate} />);
  expect(screen.getByRole('button', {name:'Laboratorio'}).getAttribute('aria-current')).toBe('page');
  expect(screen.getByText('Lab')).toBeTruthy(); expect(screen.getByText('Opzioni')).toBeTruthy();
  await userEvent.click(screen.getByRole('button', {name:'Impostazioni'}));
  expect(navigate).toHaveBeenCalledWith('settings');
});

it('keeps selection, Set, pair context and favorite accessible while showing one card cue', async () => {
  const select = vi.fn(), favorite = vi.fn();
  render(<ElementCard element={element} selected busy={false} onSelect={select} onFavorite={favorite} />);
  const card = screen.getByRole('button', { name: 'Acqua, elemento del set Mondo, selezionato, ○ Già provato: nessuna reazione' });
  expect(card.getAttribute('aria-pressed')).toBe('true');
  expect(document.querySelectorAll('.selected-cue,.context-cue')).toHaveLength(1);
  expect(screen.getByRole('button', { name: 'Rimuovi Acqua dai preferiti' }).getAttribute('aria-pressed')).toBe('true');
  await userEvent.click(card); await userEvent.click(screen.getByRole('button', { name: 'Rimuovi Acqua dai preferiti' }));
  expect(select).toHaveBeenCalledOnce(); expect(favorite).toHaveBeenCalledOnce();
});

it.each(['◇ Reazione instabile già osservata', '○ Già provato: nessuna reazione', '✓ Reazione conosciuta', 'Nuove possibilità'])('retains readable contextual card state %s', context => {
  render(<ElementCard element={{ ...element, context }} selected={false} busy={false} onSelect={vi.fn()} onFavorite={vi.fn()} />);
  expect(screen.getByText(context)).toBeTruthy();
  expect(screen.getByRole('button', { name: new RegExp(context.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) })).toBeTruthy();
});

it('preserves artKey, unique paint servers, decorative semantics and stable unknown-art fallback', () => {
  render(<><ElementArt artKey="element.water" /><ElementArt artKey="element.water" /><ElementArt artKey="future.unrecognized" /></>);
  const art = document.querySelectorAll('svg'); expect(art).toHaveLength(3);
  expect([...art].every(node => node.getAttribute('aria-hidden') === 'true')).toBe(true);
  expect(art[2]!.getAttribute('data-art-key')).toBe('future.unrecognized');
  const ids = [...document.querySelectorAll('[id]')].map(node => node.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(art[0]!.getAttribute('data-art-study')).toBe('water');
});

it('level progress keeps the actual value and does not add a hidden denominator', () => {
  render(<DiscoveryLevelBadge model={{ level: 2, count: 7, xp: 280, progress: 37.2 } as LabModel} />);
  expect(screen.getByRole('progressbar', { name: 'Progresso del livello' }).getAttribute('aria-valuenow')).toBe('37');
  expect(screen.getByText('7 scoperte · 280 XP')).toBeTruthy();
});

it('anomaly presentation keeps all result actions and no fabricated result', () => {
  render(<ReactionStage reaction={{kind:'anomaly',title:'Reazione instabile',message:'Non ancora stabilizzata.',announcement:'Reazione instabile registrata.',setReveals:[],emphasis:'anomaly'}} busy={false} onUse={vi.fn()} onRepeat={vi.fn()} onReset={vi.fn()} onViewDetail={vi.fn()} />);
  expect(screen.getByRole('heading', {name:'Reazione instabile'})).toBeTruthy();
  expect(screen.getByRole('button', {name:'Nuovo esperimento'})).toBeTruthy();
  expect(screen.queryByRole('button', {name:'Usa risultato'})).toBeNull();
  expect(document.querySelector('svg')).toBeNull();
});
