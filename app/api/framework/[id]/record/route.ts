import { NextRequest, NextResponse } from 'next/server';
import { withRequestContext } from '@/db';
import { requireUserId } from '@/features/auth/lib/utils';
import { authzResponse } from '@/features/general/lib/utils';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/framework/[id]/record
 * Records framework check-in status (I Do / I Don't Do) consistently with mission discipline.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const frameworkId = Number(id);

    if (isNaN(frameworkId)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const isDone = body.isDone !== undefined ? Boolean(body.isDone) : true;
    const date = body.date || new Date().toISOString();

    const history = await withRequestContext(async ({ framework }) => {
      return await framework.recordHistory(frameworkId, date, isDone, userId);
    });

    if (!history) {
      return NextResponse.json({ message: 'Framework not found' }, { status: 404 });
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
    const authz = authzResponse(error);
    if (authz) return authz;
    console.error('Failed to record framework history in POST /api/framework/[id]/record:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
