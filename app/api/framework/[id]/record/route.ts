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
  request: NextRequest,
  { params }: { params: IdRouteParams },
) {
  try {
    const userId = await requireUserId();
    const frameworkId = await parseRouteId(params);
    if (!frameworkId) return invalidIdResponse();

    const body = await request.json().catch(() => ({}));
    const isDone = body.isDone !== undefined ? Boolean(body.isDone) : true;
    const date = body.date || new Date().toISOString();

    const history = await withRequestContext(async ({ framework }) => {
      return await framework.recordHistory(frameworkId, date, isDone, userId);
    });

    if (!history) {
      return notFoundResponse('Framework');
    }

    return NextResponse.json(
      {
        success: true,
        history: {
          id: history.id,
          date: history.date,
          isDone: history.isDone,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error, 'Failed to record framework history:');
  }
}
