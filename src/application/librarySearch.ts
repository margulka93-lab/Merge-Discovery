import type { LabElement } from './laboratory';
export const normalizeSearch = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('it').trim();
export type LibraryFilter = 'all' | 'possibilities' | 'exhausted' | 'untested' | 'known';
export type LibraryOrder = 'relevance' | 'recent' | 'favorites' | 'set';
/** Input is an owned-only DTO. This search never accesses the raw content index. */
export function searchLibrary(elements: LabElement[], query: string, filter: LibraryFilter, order: LibraryOrder, favorites: boolean) {
  const term = normalizeSearch(query);
  const rank = (e: LabElement) => normalizeSearch(e.name).startsWith(term) ? 0 : 1;
  return elements.filter(e => (!favorites || e.favorite) &&
    normalizeSearch([e.name, e.setName, ...(e.searchAliases ?? [])].join(' ')).includes(term) &&
    (filter === 'all' || (filter === 'possibilities' ? e.possibilities : filter === 'exhausted' ? e.exhausted : filter === 'known' ? e.context.includes('conosciuta') : !e.context.includes('provato') && !e.context.includes('conosciuta') && !e.context.includes('osservata'))))
    .sort((a, b) => order === 'recent' ? (b.discoveredAt ?? '').localeCompare(a.discoveredAt ?? '') : order === 'favorites' ? Number(b.favorite) - Number(a.favorite) : order === 'set' ? a.setName.localeCompare(b.setName, 'it') || a.name.localeCompare(b.name, 'it') : rank(a) - rank(b) || a.name.localeCompare(b.name, 'it'));
}
