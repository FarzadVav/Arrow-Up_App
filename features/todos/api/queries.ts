import 'server-only';
import { withRequestContext } from '@/db';
import { requireUserId } from '@/features/auth/lib/utils';
import { serializeTodo } from './repository';
import type { Todo, TodoType } from '../lib/types';

export type TodosStats = {
  dailyCompleted: number;
  dailyTotal: number;
  upcomingTotal: number;
  missionsTotal: number;
};

/**
 * Server query for retrieving the acting user's todos, optionally filtered by type.
 * Authorization is resolved here rather than trusting a caller.
 */
export async function getTodosQuery(type?: TodoType | 'all' | string): Promise<Todo[]> {
  const userId = await requireUserId();

  return withRequestContext(async ({ todo }) => {
    let entities;

    if (type === 'Daily') {
      entities = await todo.findDaily(userId);
    } else if (type === 'Upcoming') {
      entities = await todo.findUpcoming(userId);
    } else if (type === 'Mission') {
      entities = await todo.findMissions(userId, { populateRelations: true });
    } else {
      entities = await todo.findAllTodos(userId);
    }

    return entities.map((item) => serializeTodo(item));
  });
}

/**
 * Server query for retrieving a single todo owned by the acting user.
 * Another user's id is indistinguishable from a nonexistent one.
 */
export async function getTodoByIdQuery(id: number): Promise<Todo | null> {
  const userId = await requireUserId();

  return withRequestContext(async ({ todo }) => {
    const entity = await todo.findById(id, userId);
    if (!entity) {
      return null;
    }

    return serializeTodo(entity);
  });
}

/**
 * Server query for retrieving aggregated summary statistics for todos.
 * Uses repository pattern via withRequestContext.
 */
export async function getTodosStatsQuery(): Promise<TodosStats> {
  const userId = await requireUserId();

  return withRequestContext(async ({ todo }) => {
    return todo.getTodosStats(userId);
  });
}
