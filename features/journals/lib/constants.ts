import type { JournalCategoryDefinition } from './types';

export const JOURNAL_CATEGORY_NAMES = [
  'Logs',
  'Thoughts',
  'Feelings',
  'Ideas',
  'Notes',
] as const;

export const JOURNAL_CATEGORIES: JournalCategoryDefinition[] = [
  {
    name: 'Logs',
    tags: [],
  },
  {
    name: 'Thoughts',
    tags: [],
  },
  {
    name: 'Feelings',
    tags: [],
  },
  {
    name: 'Ideas',
    tags: [],
  },
  {
    name: 'Notes',
    tags: [],
  },
];
