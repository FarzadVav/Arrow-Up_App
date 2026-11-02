import { NextRequest, NextResponse } from 'next/server';
import { withRequestContext } from '@/db';
import { serializeTodo } from '@/features/todos/api/repository';
import { requireUserId } from '@/features/auth/lib/utils';
import {
  parseRouteId,
  invalidIdResponse,
  notFoundResponse,
  handleApiError,
  type IdRouteParams,
} from '@/features/general/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(
  _request: NextRequest,
  { params }: { params: IdRouteParams },
) {
  try {
    const userId = await requireUserId();
    const todoId = await parseRouteId(params);
    if (!todoId) return invalidIdResponse();

    const updated = await withRequestContext(async ({ todo }) => {
      return await todo.toggleDone(todoId, userId);
    });

    if (!updated) {
      return notFoundResponse('Todo');
    }

    return NextResponse.json(
      { success: true, todo: serializeTodo(updated) },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error, 'Failed to toggle todo:');
  }
}
