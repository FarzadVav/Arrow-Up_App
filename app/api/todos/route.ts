import { NextRequest, NextResponse } from 'next/server';
import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { TodoType as DbTodoType } from '@/db/entities/enums';
import { getTodosQuery, getTodosHistoryQuery } from '@/features/todos/api/queries';
import { serializeTodo } from '@/features/todos/api/repository';
import { CreateTodoSchema, TodoType } from '@/features/todos/lib/types';
import { requireUserId } from '@/features/auth/lib/utils';
import {
  checkCostCapacity,
  jsonNoStore,
  validationErrorResponse,
  handleApiError,
} from '@/features/general/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * GET /api/todos?type=Daily|Upcoming|Mission|all
 * Calls getTodosQuery and returns JSON payload for client SWR consumption.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const typeParam = searchParams.get('type') || undefined;
    const isHistory = searchParams.get('history') === 'true' || searchParams.get('isHistory') === 'true';

    const todos = isHistory
      ? await getTodosHistoryQuery(typeParam as TodoType)
      : await getTodosQuery(typeParam as TodoType);

    return jsonNoStore({ todos });
  } catch (error) {
    return handleApiError(error, 'Failed to get todos:');
  }
}

/**
 * POST /api/todos
 * Validates with ArkType CreateTodoSchema and persists via TodoRepository.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const validation = CreateTodoSchema(body);

    if (validation instanceof type.errors) {
      return validationErrorResponse(validation);
    }

    const targetType = validation.type;
    const targetDifficulty = validation.difficulty ?? 1;
    const dbType =
      targetType === 'Daily'
        ? DbTodoType.DAILY
        : targetType === 'Upcoming'
          ? DbTodoType.UPCOMING
          : DbTodoType.MISSION;

    const existingTodos = await withRequestContext(async ({ todo }) => {
      return await todo.find({ type: dbType, user: userId });
    });

    const capacity = checkCostCapacity(existingTodos, targetDifficulty);
    if (!capacity.valid) {
      return NextResponse.json(
        {
          errors: `Capacity exceeded for ${targetType} todos. Currently using ${capacity.currentSum}/10.`,
          message: 'Capacity exceeded',
        },
        { status: 400 },
      );
    }

    const created = await withRequestContext(async ({ todo }) => {
      return await todo.createTodo(validation, userId);
    });

    return NextResponse.json(
      { todo: serializeTodo(created) },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error, 'Failed to create todo:');
  }
}
