// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it } from 'vitest';
import { ExploreNavigation } from '../src/ui/components/ExploreNavigation';
afterEach(cleanup);
it('does not disclose an unobserved Archive or unavailable Map', () => {
  render(<MemoryRouter><ExploreNavigation map={false} anomalies /></MemoryRouter>);
  expect(screen.getAllByRole('link').map(a => a.textContent)).toEqual(['Anomalie']);
});
it('preserves the query-independent current Map destination', () => {
  render(<MemoryRouter initialEntries={['/explore/map?element=water']}><ExploreNavigation map anomalies /></MemoryRouter>);
  expect(screen.getByRole('link', { name: 'Mappa' }).getAttribute('aria-current')).toBe('page');
  expect(screen.getByRole('link', { name: 'Anomalie' }).getAttribute('aria-current')).toBeNull();
});
