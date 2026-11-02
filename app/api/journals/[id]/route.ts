import { NextRequest, NextResponse } from 'next/server';
import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { getJournalByIdQuery } from '@/features/journals/api/queries';
import { serializeJournal } from '@/features/journals/api/repository';
import { UpdateJournalSchema } from '@/features/journals/lib/types';
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

/**
 * GET /api/journals/[id]
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: IdRouteParams },
) {
  try {
    const journalId = await parseRouteId(params);
    if (!journalId) return invalidIdResponse();

    const journal = await getJournalByIdQuery(journalId);
    if (!journal) {
      return notFoundResponse('Journal entry');
    }

    return jsonNoStore({ journal });
  } catch (error) {
    return handleApiError(error, 'Failed to get journal by ID:');
  }
}

/**
 * PATCH /api/journals/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: IdRouteParams },
) {
  try {
    const userId = await requireUserId();
    const journalId = await parseRouteId(params);
    if (!journalId) return invalidIdResponse();

    const body = await request.json();
    const validation = UpdateJournalSchema(body);

    if (validation instanceof type.errors) {
      return validationErrorResponse(validation);
    }

    const updated = await withRequestContext(async ({ journal }) => {
      return await journal.updateJournal(journalId, validation, userId);
    });

    if (!updated) {
      return notFoundResponse('Journal entry');
    }

    return NextResponse.json({ journal: serializeJournal(updated) }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'Failed to update journal:');
  }
}

/**
 * DELETE /api/journals/[id]
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: IdRouteParams },
) {
  try {
    const userId = await requireUserId();
    const journalId = await parseRouteId(params);
    if (!journalId) return invalidIdResponse();

    const success = await withRequestContext(async ({ journal }) => {
      return await journal.deleteJournal(journalId, userId);
    });

    if (!success) {
      return notFoundResponse('Journal entry');
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'Failed to delete journal:');
  }
}
