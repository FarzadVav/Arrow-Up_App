import { NextRequest, NextResponse } from 'next/server';
import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { TodoType as DbTodoType } from '@/db/entities/enums';
import { getTodoByIdQuery } from '@/features/todos/api/queries';
import { serializeTodo } from '@/features/todos/api/repository';
import { UpdateTodoSchema, type TodoType } from '@/features/todos/lib/types';
import { requireUserId } from '@/features/auth/lib/utils';
import {
  checkCostCapacity,
  parseRouteId,
  invalidIdResponse,
  notFoundResponse,
  validationErrorResponse,
  jsonNoStore,
  handleApiError,
  type IdRouteParams,
} from '@/features/general/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * GET /api/todos/[id]
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: IdRouteParams },
) {
  try {
    const todoId = await parseRouteId(params);
    if (!todoId) return invalidIdResponse();

    const todo = await getTodoByIdQuery(todoId);
    if (!todo) {
      return notFoundResponse('Todo');
    }

    return jsonNoStore({ todo });
  } catch (error) {
    return handleApiError(error, 'Failed to get todo by ID:');
  }
}

/**
 * PATCH /api/todos/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: IdRouteParams },
) {
  try {
    const userId = await requireUserId();
    const todoId = await parseRouteId(params);
    if (!todoId) return invalidIdResponse();

    const body = await request.json();
    const validation = UpdateTodoSchema(body);

    if (validation instanceof type.errors) {
      return validationErrorResponse(validation);
    }

    const currentTodo = await withRequestContext(async ({ todo }) => {
      return await todo.findById(todoId, userId);
    });

    if (!currentTodo) {
      return notFoundResponse('Todo');
    }

    const targetType = (validation.type ?? currentTodo.type) as TodoType;
    const targetDifficulty =
      validation.difficulty !== undefined
        ? validation.difficulty
        : currentTodo.difficulty ?? 1;
    const dbType =
      targetType === 'Daily'
        ? DbTodoType.DAILY
        : targetType === 'Upcoming'
          ? DbTodoType.UPCOMING
          : DbTodoType.MISSION;

    const existingTodos = await withRequestContext(async ({ todo }) => {
      return await todo.find({ type: dbType, user: userId });
    });

    const capacity = checkCostCapacity(existingTodos, targetDifficulty, todoId);
    if (!capacity.valid) {
      return NextResponse.json(
        {
          errors: `Capacity exceeded for ${targetType} todos. Currently using ${capacity.currentSum}/10.`,
          message: 'Capacity exceeded',
        },
        { status: 400 },
      );
    }

    const updated = await withRequestContext(async ({ todo }) => {
      return await todo.updateTodo(todoId, validation, userId);
    });

    if (!updated) {
      return notFoundResponse('Todo');
    }

    return NextResponse.json({ todo: serializeTodo(updated) }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'Failed to update todo:');
  }
}

/**
 * DELETE /api/todos/[id]
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: IdRouteParams },
) {
  try {
    const userId = await requireUserId();
    const todoId = await parseRouteId(params);
    if (!todoId) return invalidIdResponse();

    const deleted = await withRequestContext(async ({ todo }) => {
      return await todo.deleteTodo(todoId, userId);
    });

    if (!deleted) {
      return notFoundResponse('Todo');
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'Failed to delete todo:');
  }
}
