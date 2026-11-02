import { NextResponse } from 'next/server';
import { getJournalsStatsQuery } from '@/features/journals/api/queries';
import { authzResponse } from '@/features/general/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * GET /api/journals/stats
 * Returns aggregated category counts and total count of journals for the authenticated user.
 */
export async function GET() {
  try {
    const stats = await getJournalsStatsQuery();
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
    console.error('Failed to get journals stats:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
