import 'server-only';
import type { FilterQuery } from '@mikro-orm/core';
import { withRequestContext } from '@/db';
import { Todo } from '@/db/entities/Todo';
import { Framework } from '@/db/entities/Framework';
import { Journal } from '@/db/entities/Journal';
import { requireUserId } from '@/features/auth/lib/utils';
import { serializeTodo } from '@/features/todos/api/repository';
import { serializeFramework } from '@/features/framework/api/repository';
import { serializeJournal } from '@/features/journals/api/repository';
import { stripHtml } from '@/features/general/lib/utils';
import type { Todo as TodoDto } from '@/features/todos/lib/types';
import type { Framework as FrameworkDto } from '@/features/framework/lib/types';
import type { Journal as JournalDto } from '@/features/journals/lib/types';
import type { SearchOptions, SearchResults, SearchFilter } from '../lib/types';

function matchesQuery(text: string | null | undefined, terms: string[]): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term));
}

function matchTodoItem(item: TodoDto, terms: string[]): boolean {
  if (terms.length === 0) return true;

  if (matchesQuery(item.title, terms)) return true;
  if (matchesQuery(stripHtml(item.description), terms)) return true;
  if (matchesQuery(item.lifeArea?.title, terms)) return true;
  if (matchesQuery(item.type, terms)) return true;

  if (item.actions?.some((action) => matchesQuery(action.title, terms))) {
    return true;
  }

  if (item.disciplines?.some((discipline) => matchesQuery(discipline.title, terms))) {
    return true;
  }

  return false;
}

function matchFrameworkItem(item: FrameworkDto, terms: string[]): boolean {
  if (terms.length === 0) return true;

  if (matchesQuery(item.title, terms)) return true;
  if (matchesQuery(stripHtml(item.content), terms)) return true;
  if (matchesQuery(item.lifeArea?.title, terms)) return true;
  if (matchesQuery(item.tag, terms)) return true;

  if (item.practices?.some((practice) => matchesQuery(practice.title, terms))) {
    return true;
  }

  return false;
}

function matchJournalItem(item: JournalDto, terms: string[]): boolean {
  if (terms.length === 0) return true;

  if (matchesQuery(item.title, terms)) return true;
  if (matchesQuery(stripHtml(item.content), terms)) return true;
  if (matchesQuery(item.category?.nameEn, terms)) return true;
  if (matchesQuery(item.category?.nameFa, terms)) return true;
  if (matchesQuery(item.category?.slug, terms)) return true;
  if (matchesQuery(item.tag?.nameEn, terms)) return true;
  if (matchesQuery(item.tag?.nameFa, terms)) return true;
  if (matchesQuery(item.tag?.slug, terms)) return true;

  return false;
}

function getDeletedAtFilter(filter: SearchFilter = 'availables') {
  if (filter === 'availables') {
    return { deletedAt: null };
  }
  if (filter === 'histories') {
    return { deletedAt: { $ne: null } };
  }
  return {};
}

/**
 * Searches across todos, frameworks, and journals for the authenticated user,
 * respecting status filtering (availables, histories, all) and optional query term.
 */
export async function getSearchResultsQuery(
  options: SearchOptions = {},
): Promise<SearchResults> {
  const userId = await requireUserId();
  const filter = options.filter || 'availables';
  const rawQ = (options.q || '').trim().toLowerCase();
  const terms = rawQ ? rawQ.split(/\s+/).filter(Boolean) : [];

  return withRequestContext(async ({ todo, framework, journal }) => {
    const deletedCondition = getDeletedAtFilter(filter);

    const todoWhere: FilterQuery<Todo> = {
      user: userId,
      ...deletedCondition,
    };

    const frameworkWhere: FilterQuery<Framework> = {
      user: userId,
      ...deletedCondition,
    };

    const journalWhere: FilterQuery<Journal> = {
      user: userId,
      ...deletedCondition,
    };

    const [todoEntities, frameworkEntities, journalEntities] = await Promise.all([
      todo.find(todoWhere, {
        populate: ['actions', 'disciplines.history', 'lifeArea'],
        orderBy: [{ sortNumber: 'ASC' }, { deadline: 'ASC' }, { createdAt: 'DESC' }],
      }),
      framework.find(frameworkWhere, {
        populate: ['lifeArea', 'tag', 'history', 'practices'],
        orderBy: [{ sortNumber: 'ASC' }, { createdAt: 'DESC' }],
      }),
      journal.find(journalWhere, {
        populate: ['category', 'tag'],
        orderBy: [{ sortNumber: 'ASC' }, { createdAt: 'DESC' }],
      }),
    ]);

    const serializedTodos = todoEntities.map(serializeTodo);
    const serializedFrameworks = frameworkEntities.map(serializeFramework);
    const serializedJournals = journalEntities.map(serializeJournal);

    const filteredTodos = serializedTodos.filter((item) => matchTodoItem(item, terms));
    const filteredFrameworks = serializedFrameworks.filter((item) => matchFrameworkItem(item, terms));
    const filteredJournals = serializedJournals.filter((item) => matchJournalItem(item, terms));

    return {
      todos: filteredTodos,
      frameworks: filteredFrameworks,
      journals: filteredJournals,
      counts: {
        all: filteredTodos.length + filteredFrameworks.length + filteredJournals.length,
        todos: filteredTodos.length,
        framework: filteredFrameworks.length,
        journals: filteredJournals.length,
      },
    };
  });
}
