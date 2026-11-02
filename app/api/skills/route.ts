import { NextRequest, NextResponse } from 'next/server';
import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { serializeSkill } from '@/features/skills/api/repository';
import { CreateSkillSchema } from '@/features/skills/lib/types';
import { requireUserId } from '@/features/auth/lib/utils';
import { authzResponse } from '@/features/general/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * GET /api/skills?lifeAreaId=...
 * Returns list of skills for authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();

    const searchParams = request.nextUrl.searchParams;
    const lifeAreaIdParam = searchParams.get('lifeAreaId');
    const lifeAreaId = lifeAreaIdParam ? Number(lifeAreaIdParam) : undefined;

    const skills = await withRequestContext(async ({ skill }) => {
      const entities = await skill.findAllSkills(userId, lifeAreaId);
      return entities.map(serializeSkill);
    });

    return NextResponse.json(
      { skills },
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
    console.error('Failed to get skills in GET /api/skills:', error);
    return NextResponse.json(
      { skills: [], message: 'Internal Server Error' },
      { status: 500 },
    );
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
      return NextResponse.json(
        { errors: validation.summary, message: 'Validation failed' },
        { status: 400 },
      );
    }

    const created = await withRequestContext(async ({ skill }) => {
      return await skill.createSkill(validation, userId);
    });

    return NextResponse.json(
      { skill: serializeSkill(created) },
      { status: 201 },
    );
  } catch (error) {
    const authz = authzResponse(error);
    if (authz) return authz;
    console.error('Failed to create skill in POST /api/skills:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
