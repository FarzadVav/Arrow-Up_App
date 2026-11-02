import { NextRequest, NextResponse } from 'next/server';
import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { TodoType as DbTodoType } from '@/db/entities/enums';
import { getTodoByIdQuery } from '@/features/todos/api/queries';
import { serializeTodo } from '@/features/todos/api/repository';
import { UpdateTodoSchema, type TodoType } from '@/features/todos/lib/types';
import { requireUserId } from '@/features/auth/lib/utils';
import { authzResponse } from '@/features/general/lib/utils';
import { checkCostCapacity } from '@/features/general/lib/utils';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/todos/[id]
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const todoId = Number(id);

    if (isNaN(todoId)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const todo = await getTodoByIdQuery(todoId);
    if (!todo) {
      return NextResponse.json({ message: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json(
      { todo },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      },
    );
  } catch (error) {
    const authz = authzResponse(error);
    if (authz) return authz;
    console.error('Failed to get todo by ID:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PATCH /api/todos/[id]
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const todoId = Number(id);

    if (isNaN(todoId)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const validation = UpdateTodoSchema(body);

    if (validation instanceof type.errors) {
      return NextResponse.json(
        { errors: validation.summary, message: 'Validation failed' },
        { status: 400 },
      );
    }

    const currentTodo = await withRequestContext(async ({ todo }) => {
      return await todo.findById(todoId, userId);
    });

    if (!currentTodo) {
      return NextResponse.json({ message: 'Todo not found or unauthorized' }, { status: 404 });
    }

    const targetType = (validation.type ?? currentTodo.type) as TodoType;
    const targetDifficulty = validation.difficulty !== undefined ? validation.difficulty : (currentTodo.difficulty ?? 1);
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
      return NextResponse.json({ message: 'Todo not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ todo: serializeTodo(updated) }, { status: 200 });
  } catch (error) {
    const authz = authzResponse(error);
    if (authz) return authz;
    console.error('Failed to update todo:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/todos/[id]
 */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const todoId = Number(id);

    if (isNaN(todoId)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const deleted = await withRequestContext(async ({ todo }) => {
      return await todo.deleteTodo(todoId, userId);
    });

    if (!deleted) {
      return NextResponse.json({ message: 'Todo not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const authz = authzResponse(error);
    if (authz) return authz;
    console.error('Failed to delete todo:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
