import { NextRequest, NextResponse } from 'next/server';
import { withRequestContext } from '@/db';
import { serializeTodo } from '@/features/todos/api/repository';
import { requireUserId } from '@/features/auth/lib/utils';
import { authzResponse } from '@/features/general/lib/utils';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/todos/[id]/toggle
 * Toggles isDone status of a todo.
 */
export async function POST(_request: NextRequest, { params }: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const todoId = Number(id);

    if (isNaN(todoId)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const updated = await withRequestContext(async ({ todo }) => {
      return await todo.toggleDone(todoId, userId);
    });

    if (!updated) {
      return NextResponse.json({ message: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, todo: serializeTodo(updated) }, { status: 200 });
  } catch (error) {
    const authz = authzResponse(error);
    if (authz) return authz;
    console.error('Failed to toggle todo in /api/todos/[id]/toggle:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
