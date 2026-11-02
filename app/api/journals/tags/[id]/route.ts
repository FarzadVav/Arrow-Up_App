import { NextRequest, NextResponse } from 'next/server';
import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { getJournalTagByIdQuery } from '@/features/journals/api/queries';
import { serializeJournalTag } from '@/features/journals/api/repository';
import { UpdateJournalTagSchema } from '@/features/journals/lib/types';
import { requireUserId } from '@/features/auth/lib/utils';
import { authzResponse } from '@/features/general/lib/utils';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const tagId = Number(id);

    if (isNaN(tagId)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const tag = await getJournalTagByIdQuery(tagId);
    if (!tag) {
      return NextResponse.json({ message: 'Tag not found' }, { status: 404 });
    }

    return NextResponse.json(
      { tag },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      },
    );
  } catch (error) {
    const authz = authzResponse(error);
    if (authz) return authz;
    console.error('Failed to get journal tag by ID:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const tagId = Number(id);

    if (isNaN(tagId)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const validation = UpdateJournalTagSchema({ ...body, id: tagId });

    if (validation instanceof type.errors) {
      return NextResponse.json(
        { errors: validation.summary, message: 'Validation failed' },
        { status: 400 },
      );
    }

    const updated = await withRequestContext(async ({ journalTag }) => {
      return await journalTag.updateTag(tagId, validation, userId);
    });

    if (!updated) {
      return NextResponse.json(
        { message: 'Tag not found or unauthorized' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { tag: serializeJournalTag(updated) },
      { status: 200 },
    );
  } catch (error) {
    const authz = authzResponse(error);
    if (authz) return authz;
    console.error('Failed to update journal tag:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const tagId = Number(id);

    if (isNaN(tagId)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const success = await withRequestContext(async ({ journalTag }) => {
      return await journalTag.deleteTag(tagId, userId);
    });

    if (!success) {
      return NextResponse.json(
        { message: 'Tag not found or unauthorized' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const authz = authzResponse(error);
    if (authz) return authz;
    console.error('Failed to delete journal tag:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
