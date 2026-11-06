import type { SearchFilter, SearchTab } from './types';

export const SEARCH_TABS: readonly SearchTab[] = [
  'all',
  'todos',
  'framework',
  'journals',
] as const;

export const SEARCH_FILTERS: readonly SearchFilter[] = [
  'availables',
  'histories',
  'all',
] as const;

export const DEFAULT_SEARCH_TAB: SearchTab = 'all';
export const DEFAULT_SEARCH_FILTER: SearchFilter = 'availables';
