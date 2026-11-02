import { NextResponse } from 'next/server';
import { getTodosStatsQuery } from '@/features/todos/api/queries';
import { authzResponse } from '@/features/general/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * GET /api/todos/stats
 */
export async function GET() {
  try {
    const stats = await getTodosStatsQuery();
    return NextResponse.json(
      { stats },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      },
    );
  } catch (error) {
    const authz = authzResponse(error);
    if (authz) return authz;
    console.error('Failed to get todos stats:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
