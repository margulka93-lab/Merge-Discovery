// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { App } from '../src/app/App';
import { DiagnosticStatus } from '../src/ui/DiagnosticStatus';

afterEach(cleanup);
it('boots the diagnostic scaffold without revealing hidden content', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Merge Discovery' })).toBeTruthy();
  expect(screen.getByRole('status').textContent).toContain('Motore pronto');
  expect(document.body.textContent).not.toMatch(/Funghi|Muffa|67|lunar_life/);
});
it('renders a content boot failure as an accessible alert', () => {
  render(<DiagnosticStatus ready={false} error="Contenuto non valido" />);
  expect(screen.getByRole('alert').textContent).toBe('Contenuto non valido');
});
