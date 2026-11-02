import { getJournalsStatsQuery } from '@/features/journals/api/queries';
import { jsonNoStore, handleApiError } from '@/features/general/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * GET /api/journals/stats
 * Returns aggregated category counts and total count of journals for the authenticated user.
 */
export async function GET() {
  try {
    const stats = await getJournalsStatsQuery();
    return jsonNoStore({ stats });
  } catch (error) {
    return handleApiError(error, 'Failed to get journals stats:');
  }
}
