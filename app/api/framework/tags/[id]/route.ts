import { NextRequest, NextResponse } from 'next/server';
import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { requireUserId } from '@/features/auth/lib/utils';
import { authzResponse } from '@/features/general/lib/utils';
import { serializeFrameworkTag } from '@/features/framework/api/repository';
import { UpdateFrameworkTagSchema } from '@/features/framework/lib/types';
import { parseLifeAreaSlug } from '@/features/general/lib/utils';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const tagId = Number(id);

    if (isNaN(tagId)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const tag = await withRequestContext(async ({ frameworkTag }) => {
      const entity = await frameworkTag.findById(tagId, userId);
      return entity ? serializeFrameworkTag(entity) : null;
    });

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
    console.error('Failed to get framework tag by ID:', error);
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
    const validation = UpdateFrameworkTagSchema({
      ...body,
      id: tagId,
      ...(body?.lifeAreaId === undefined
        ? {}
        : { lifeAreaId: parseLifeAreaSlug(String(body.lifeAreaId)) }),
    });

    if (validation instanceof type.errors) {
      return NextResponse.json(
        { errors: validation.summary, message: 'Validation failed' },
        { status: 400 },
      );
    }

    const updated = await withRequestContext(async ({ frameworkTag }) => {
      return await frameworkTag.updateTag(tagId, validation, userId);
    });

    if (!updated) {
      return NextResponse.json(
        { message: 'Tag not found or unauthorized' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { tag: serializeFrameworkTag(updated) },
      { status: 200 },
    );
  } catch (error) {
    const authz = authzResponse(error);
    if (authz) return authz;
    console.error('Failed to update framework tag:', error);
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

    const success = await withRequestContext(async ({ frameworkTag }) => {
      return await frameworkTag.deleteTag(tagId, userId);
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
    console.error('Failed to delete framework tag:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
