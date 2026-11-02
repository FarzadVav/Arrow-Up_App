import { NextRequest, NextResponse } from 'next/server';
import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { getJournalTagsQuery } from '@/features/journals/api/queries';
import { serializeJournalTag } from '@/features/journals/api/repository';
import { CreateJournalTagSchema } from '@/features/journals/lib/types';
import { requireUserId } from '@/features/auth/lib/utils';
import {
  jsonNoStore,
  validationErrorResponse,
  handleApiError,
} from '@/features/general/lib/utils';

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

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const validation = CreateJournalTagSchema(body);

    if (validation instanceof type.errors) {
      return validationErrorResponse(validation);
    }

    const created = await withRequestContext(async ({ journalTag }) => {
      return await journalTag.createTag(validation, userId);
    });

    return NextResponse.json(
      { tag: serializeJournalTag(created) },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error, 'Failed to create journal tag:');
  }
}
