import { NextRequest, NextResponse } from 'next/server';
import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { requireUserId } from '@/features/auth/lib/utils';
import { serializeSkillTag } from '@/features/skills/api/repository';
import { CreateSkillTagSchema } from '@/features/skills/lib/types';
import {
  parseLifeAreaSlug,
  jsonNoStore,
  validationErrorResponse,
  handleApiError,
} from '@/features/general/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const lifeAreaId = parseLifeAreaSlug(
      request.nextUrl.searchParams.get('lifeAreaId'),
    );

    const tags = await withRequestContext(async ({ skillTag }) => {
      const entities =
        lifeAreaId === undefined
          ? await skillTag.findAllTags(userId)
          : await skillTag.findByLifeArea(lifeAreaId, userId);

      return entities.map(serializeSkillTag);
    });

    return jsonNoStore({ tags });
  } catch (error) {
    return handleApiError(error, 'Failed to get skill tags:');
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const validation = CreateSkillTagSchema({
      title: body?.title,
      lifeAreaId:
        body?.lifeAreaId === undefined
          ? undefined
          : parseLifeAreaSlug(String(body.lifeAreaId)),
    });

    if (validation instanceof type.errors) {
      return validationErrorResponse(validation);
    }

    const created = await withRequestContext(async ({ skillTag }) => {
      return await skillTag.createTag(validation, userId);
    });

    return NextResponse.json(
      { tag: serializeSkillTag(created) },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error, 'Failed to create skill tag:');
  }
}
