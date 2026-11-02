import { NextRequest, NextResponse } from 'next/server';
import { withRequestContext } from '@/db';
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
    const actionId = await parseRouteId(params);
    if (!actionId) return invalidIdResponse();

    const updated = await withRequestContext(async ({ todoAction }) => {
      return await todoAction.toggleAction(actionId, userId);
    });

    if (!updated) {
      return notFoundResponse('Action');
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
    return handleApiError(error, 'Failed to toggle action:');
  }
}
