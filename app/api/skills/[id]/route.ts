import { NextRequest, NextResponse } from 'next/server';
import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { serializeSkill } from '@/features/skills/api/repository';
import { UpdateSkillSchema } from '@/features/skills/lib/types';
import { requireUserId } from '@/features/auth/lib/utils';
import { authzResponse } from '@/features/general/lib/utils';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/skills/[id]
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id: rawId } = await context.params;
    const id = Number(rawId);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const item = await withRequestContext(async ({ skill }) => {
      return await skill.findById(id, userId);
    });

    if (!item) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ skill: serializeSkill(item) }, { status: 200 });
  } catch (error) {
    const authz = authzResponse(error);
    if (authz) return authz;
    console.error('Failed to get skill by ID:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT/PATCH /api/skills/[id]
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id: rawId } = await context.params;
    const id = Number(rawId);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const validation = UpdateSkillSchema(body);

    if (validation instanceof type.errors) {
      return NextResponse.json(
        { errors: validation.summary, message: 'Validation failed' },
        { status: 400 },
      );
    }

    const updated = await withRequestContext(async ({ skill }) => {
      return await skill.updateSkill(id, validation, userId);
    });

    if (!updated) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ skill: serializeSkill(updated) }, { status: 200 });
  } catch (error) {
    const authz = authzResponse(error);
    if (authz) return authz;
    console.error('Failed to update skill:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/skills/[id]
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id: rawId } = await context.params;
    const id = Number(rawId);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const deleted = await withRequestContext(async ({ skill }) => {
      return await skill.deleteSkill(id, userId);
    });

    if (!deleted) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const authz = authzResponse(error);
    if (authz) return authz;
    console.error('Failed to delete skill:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
