import { NextRequest, NextResponse } from 'next/server';
import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { requireUserId } from '@/features/auth/lib/utils';
import { serializeSkillTag } from '@/features/skills/api/repository';
import { UpdateSkillTagSchema } from '@/features/skills/lib/types';
import {
  parseLifeAreaSlug,
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
    const userId = await requireUserId();
    const tagId = await parseRouteId(params);
    if (!tagId) return invalidIdResponse();

    const tag = await withRequestContext(async ({ skillTag }) => {
      const entity = await skillTag.findById(tagId, userId);
      return entity ? serializeSkillTag(entity) : null;
    });

    if (!tag) {
      return notFoundResponse('Tag');
    }

    return jsonNoStore({ tag });
  } catch (error) {
    return handleApiError(error, 'Failed to get skill tag by ID:');
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
    const validation = UpdateSkillTagSchema({
      ...body,
      id: tagId,
      ...(body?.lifeAreaId === undefined
        ? {}
        : { lifeAreaId: parseLifeAreaSlug(String(body.lifeAreaId)) }),
    });

    if (validation instanceof type.errors) {
      return validationErrorResponse(validation);
    }

    const updated = await withRequestContext(async ({ skillTag }) => {
      return await skillTag.updateTag(tagId, validation, userId);
    });

    if (!updated) {
      return notFoundResponse('Tag');
    }

    return NextResponse.json(
      { tag: serializeSkillTag(updated) },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error, 'Failed to update skill tag:');
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

    const success = await withRequestContext(async ({ skillTag }) => {
      return await skillTag.deleteTag(tagId, userId);
    });

    if (!success) {
      return notFoundResponse('Tag');
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'Failed to delete skill tag:');
  }
}
