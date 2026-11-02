import { NextRequest, NextResponse } from 'next/server';
import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { getJournalsQuery } from '@/features/journals/api/queries';
import { serializeJournal } from '@/features/journals/api/repository';
import { CreateJournalSchema } from '@/features/journals/lib/types';
import { requireUserId } from '@/features/auth/lib/utils';
import { authzResponse } from '@/features/general/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * GET /api/journals?category=Logs|Thoughts|Feelings|Ideas|Notes|all
 * Calls getJournalsQuery and returns JSON payload for client SWR consumption.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryParam = searchParams.get('category') || undefined;
    const tagParam = searchParams.get('tag') || undefined;

    const journals = await getJournalsQuery(categoryParam, tagParam);

    return NextResponse.json(
      { journals },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      },
    );
  } catch (error) {
    const authz = authzResponse(error);
    if (authz) return authz;
    console.error('Failed to get journals in GET /api/journals:', error);
    return NextResponse.json(
      { journals: [], message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/journals
 * Validates with ArkType CreateJournalSchema and persists via JournalRepository.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const validation = CreateJournalSchema(body);

    if (validation instanceof type.errors) {
      return NextResponse.json(
        { errors: validation.summary, message: 'Validation failed' },
        { status: 400 },
      );
    }

    const created = await withRequestContext(async ({ journal }) => {
      return await journal.createJournal(validation, userId);
    });

    return NextResponse.json(
      { journal: serializeJournal(created) },
      { status: 201 },
    );
  } catch (error) {
    const authz = authzResponse(error);
    if (authz) return authz;
    console.error('Failed to create journal in POST /api/journals:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
