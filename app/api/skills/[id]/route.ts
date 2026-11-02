import { NextRequest, NextResponse } from 'next/server';
import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { serializeSkill } from '@/features/skills/api/repository';
import { UpdateSkillSchema } from '@/features/skills/lib/types';
import { requireUserId } from '@/features/auth/lib/utils';
import {
  parseRouteId,
  invalidIdResponse,
  notFoundResponse,
  validationErrorResponse,
  handleApiError,
  type IdRouteParams,
} from '@/features/general/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * GET /api/skills/[id]
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: IdRouteParams },
) {
  try {
    const userId = await requireUserId();
    const skillId = await parseRouteId(params);
    if (!skillId) return invalidIdResponse();

    const item = await withRequestContext(async ({ skill }) => {
      return await skill.findById(skillId, userId);
    });

    if (!item) {
      return notFoundResponse('Skill');
    }

    return NextResponse.json(
      { skill: serializeSkill(item) },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error, 'Failed to get skill by ID:');
  }
}

/**
 * PUT/PATCH /api/skills/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: IdRouteParams },
) {
  try {
    const userId = await requireUserId();
    const skillId = await parseRouteId(params);
    if (!skillId) return invalidIdResponse();

    const body = await request.json();
    const validation = UpdateSkillSchema(body);

    if (validation instanceof type.errors) {
      return validationErrorResponse(validation);
    }

    const updated = await withRequestContext(async ({ skill }) => {
      return await skill.updateSkill(skillId, validation, userId);
    });

    if (!updated) {
      return notFoundResponse('Skill');
    }

    return NextResponse.json(
      { skill: serializeSkill(updated) },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error, 'Failed to update skill:');
  }
}

/**
 * DELETE /api/skills/[id]
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: IdRouteParams },
) {
  try {
    const userId = await requireUserId();
    const skillId = await parseRouteId(params);
    if (!skillId) return invalidIdResponse();

    const deleted = await withRequestContext(async ({ skill }) => {
      return await skill.deleteSkill(skillId, userId);
    });

    if (!deleted) {
      return notFoundResponse('Skill');
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'Failed to delete skill:');
  }
}
