import { NextRequest, NextResponse } from 'next/server';
import { getJournalTagsQuery } from '@/features/journals/api/queries';
import { jsonNoStore, handleApiError } from '@/features/general/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryParam = searchParams.get('category') || undefined;

    const tags = await getJournalTagsQuery(categoryParam);

    return jsonNoStore({ tags });
  } catch (error) {
    return handleApiError(error, 'Failed to get journal tags:');
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Journal tags are static and cannot be created.' },
    { status: 405 },
  );
}
