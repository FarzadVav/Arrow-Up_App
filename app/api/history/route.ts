import { NextRequest } from 'next/server';
import { jsonNoStore, handleApiError } from '@/features/general/lib/utils';
import { getTodosHistoryQuery } from '@/features/todos/api/queries';
import { getFrameworksHistoryQuery } from '@/features/framework/api/queries';
import { getJournalsHistoryQuery } from '@/features/journals/api/queries';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const typeParam = searchParams.get('type') || 'daily';

    if (typeParam === 'daily') {
      const items = await getTodosHistoryQuery('Daily');
      return jsonNoStore({ items, type: 'daily' });
    }
    if (typeParam === 'upcoming') {
      const items = await getTodosHistoryQuery('Upcoming');
      return jsonNoStore({ items, type: 'upcoming' });
    }
    if (typeParam === 'missions') {
      const items = await getTodosHistoryQuery('Mission');
      return jsonNoStore({ items, type: 'missions' });
    }
    if (typeParam === 'todos') {
      const items = await getTodosHistoryQuery('all');
      return jsonNoStore({ items, type: 'todos' });
    }
    if (typeParam === 'framework') {
      const items = await getFrameworksHistoryQuery();
      return jsonNoStore({ items, type: 'framework' });
    }
    if (typeParam === 'journals') {
      const items = await getJournalsHistoryQuery();
      return jsonNoStore({ items, type: 'journals' });
    }

    return jsonNoStore({ items: [], type: typeParam });
  } catch (error) {
    return handleApiError(error, 'Failed to get history:');
  }
}
