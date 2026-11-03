import { NextRequest, NextResponse } from 'next/server';
import { getJournalTagByIdQuery } from '@/features/journals/api/queries';
import {
  parseRouteId,
  invalidIdResponse,
  notFoundResponse,
  jsonNoStore,
  handleApiError,
  type IdRouteParams,
} from '@/features/general/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: IdRouteParams },
) {
  try {
    const tagId = await parseRouteId(params);
    if (!tagId) return invalidIdResponse();

    const tag = await getJournalTagByIdQuery(tagId);
    if (!tag) {
      return notFoundResponse('Tag');
    }

    return jsonNoStore({ tag });
  } catch (error) {
    return handleApiError(error, 'Failed to get journal tag by ID:');
  }
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Journal tags are static and cannot be modified.' },
    { status: 405 },
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Journal tags are static and cannot be deleted.' },
    { status: 405 },
  );
}
