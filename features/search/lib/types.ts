import type { Todo } from '@/features/todos/lib/types';
import type { Framework } from '@/features/framework/lib/types';
import type { Journal } from '@/features/journals/lib/types';

export type SearchFilter = 'availables' | 'histories' | 'all';
export type SearchTab = 'all' | 'todos' | 'framework' | 'journals';

export interface SearchResults {
  todos: Todo[];
  frameworks: Framework[];
  journals: Journal[];
  counts: {
    all: number;
    todos: number;
    framework: number;
    journals: number;
  };
}

export interface SearchOptions {
  q?: string;
  filter?: SearchFilter;
  tab?: SearchTab;
}
