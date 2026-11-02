import { NextRequest, NextResponse } from 'next/server';
import { withRequestContext } from '@/db';
import { requireUserId } from '@/features/auth/lib/utils';
import { authzResponse } from '@/features/general/lib/utils';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/todos/actions/[id]/toggle
 * Toggles isDone status of a mission action item.
 */
export async function POST(_request: NextRequest, { params }: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const actionId = Number(id);

    if (isNaN(actionId)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const updated = await withRequestContext(async ({ todoAction }) => {
      return await todoAction.toggleAction(actionId, userId);
    });

    if (!updated) {
      return NextResponse.json({ message: 'Action not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        action: {
          id: updated.id,
          title: updated.title,
          deadline: updated.deadline,
          isDone: updated.isDone,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    const authz = authzResponse(error);
    if (authz) return authz;
    console.error('Failed to toggle action:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
