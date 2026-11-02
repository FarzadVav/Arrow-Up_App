import { NextRequest, NextResponse } from 'next/server';
import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { serializeSkill } from '@/features/skills/api/repository';
import { CreateSkillSchema } from '@/features/skills/lib/types';
import { requireUserId } from '@/features/auth/lib/utils';
import {
  parseLifeAreaSlug,
  jsonNoStore,
  validationErrorResponse,
  handleApiError,
} from '@/features/general/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * GET /api/skills?lifeAreaId=...
 * Returns list of skills for authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const searchParams = request.nextUrl.searchParams;
    const lifeAreaId = parseLifeAreaSlug(searchParams.get('lifeAreaId'));

    const skills = await withRequestContext(async ({ skill }) => {
      const entities = await skill.findAllSkills(userId, lifeAreaId ?? undefined);
      return entities.map(serializeSkill);
    });

    return jsonNoStore({ skills });
  } catch (error) {
    return handleApiError(error, 'Failed to get skills:');
  }
}

/**
 * POST /api/skills
 * Creates a new Skill.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const validation = CreateSkillSchema(body);

    if (validation instanceof type.errors) {
      return validationErrorResponse(validation);
    }

    const created = await withRequestContext(async ({ skill }) => {
      return await skill.createSkill(validation, userId);
    });

    return NextResponse.json(
      { skill: serializeSkill(created) },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error, 'Failed to create skill:');
  }
}
