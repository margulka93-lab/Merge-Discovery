// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it } from 'vitest';
import { KnowledgeNavigation } from '../src/ui/components/KnowledgeNavigation';
afterEach(cleanup);
it('does not disclose unavailable Set or Collection destinations', () => {
  render(<MemoryRouter><KnowledgeNavigation overview sets={false} collections={false} /></MemoryRouter>);
  expect(screen.getAllByRole('link').map(a => a.textContent)).toEqual(['Panoramica']);
});
it('marks only the current family route and preserves deep links', () => {
  render(<MemoryRouter initialEntries={['/sets/world']}><KnowledgeNavigation overview sets collections /></MemoryRouter>);
  expect(screen.getByRole('link', { name: 'Set' }).getAttribute('aria-current')).toBe('page');
  expect(screen.getByRole('link', { name: 'Panoramica' }).getAttribute('aria-current')).toBeNull();
  expect(screen.getByRole('link', { name: 'Collezioni' }).getAttribute('href')).toBe('/collections');
});
