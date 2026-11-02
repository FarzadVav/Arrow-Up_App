import { getTodosStatsQuery } from '@/features/todos/api/queries';
import { jsonNoStore, handleApiError } from '@/features/general/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * GET /api/todos/stats
 */
export async function GET() {
  try {
    const stats = await getTodosStatsQuery();
    return jsonNoStore({ stats });
  } catch (error) {
    return handleApiError(error, 'Failed to get todos stats:');
  }
}
