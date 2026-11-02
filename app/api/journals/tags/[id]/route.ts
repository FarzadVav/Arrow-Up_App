import { NextRequest, NextResponse } from 'next/server';
import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { getJournalTagByIdQuery } from '@/features/journals/api/queries';
import { serializeJournalTag } from '@/features/journals/api/repository';
import { UpdateJournalTagSchema } from '@/features/journals/lib/types';
import { requireUserId } from '@/features/auth/lib/utils';
import {
  parseRouteId,
  invalidIdResponse,
  notFoundResponse,
  validationErrorResponse,
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: IdRouteParams },
) {
  try {
    const userId = await requireUserId();
    const tagId = await parseRouteId(params);
    if (!tagId) return invalidIdResponse();

    const body = await request.json();
    const validation = UpdateJournalTagSchema({ ...body, id: tagId });

    if (validation instanceof type.errors) {
      return validationErrorResponse(validation);
    }

    const updated = await withRequestContext(async ({ journalTag }) => {
      return await journalTag.updateTag(tagId, validation, userId);
    });

    if (!updated) {
      return notFoundResponse('Tag');
    }

    return NextResponse.json(
      { tag: serializeJournalTag(updated) },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error, 'Failed to update journal tag:');
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: IdRouteParams },
) {
  try {
    const userId = await requireUserId();
    const tagId = await parseRouteId(params);
    if (!tagId) return invalidIdResponse();

    const success = await withRequestContext(async ({ journalTag }) => {
      return await journalTag.deleteTag(tagId, userId);
    });

    if (!success) {
      return notFoundResponse('Tag');
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'Failed to delete journal tag:');
  }
}
