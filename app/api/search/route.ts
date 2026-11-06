import { NextRequest } from 'next/server';
import { jsonNoStore, handleApiError } from '@/features/general/lib/utils';
import { getSearchResultsQuery } from '@/features/search/api/queries';
import type { SearchFilter, SearchTab } from '@/features/search/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q') || '';
    const filter = (searchParams.get('filter') || 'availables') as SearchFilter;
    const tab = (searchParams.get('tab') || 'all') as SearchTab;

    const results = await getSearchResultsQuery({ q, filter, tab });
    return jsonNoStore(results);
  } catch (error) {
    return handleApiError(error, 'Failed to perform search:');
  }
}
