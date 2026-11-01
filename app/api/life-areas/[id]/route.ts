import { NextRequest, NextResponse } from 'next/server';
import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { serializeLifeArea } from '@/features/life-areas/repositories';
import { UpdateLifeAreaSchema } from '@/features/life-areas/types';
import { requireUserId } from '@/features/auth/lib/actor';
import { authzResponse } from '@/features/general/lib/api/respond';
import { checkCostCapacity } from '@/features/general/lib/costCapacity';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/life-areas/[id]
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id: rawId } = await context.params;
    const id = Number(rawId);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const item = await withRequestContext(async ({ lifeArea }) => {
      return await lifeArea.findById(id, userId);
    });

    if (!item) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ lifeArea: serializeLifeArea(item) }, { status: 200 });
  } catch (error) {
    const authz = authzResponse(error);
    if (authz) return authz;
    console.error('Failed to get life area by ID:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT/PATCH /api/life-areas/[id]
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
    const validation = UpdateLifeAreaSchema(body);

    if (validation instanceof type.errors) {
      return NextResponse.json(
        { errors: validation.summary, message: 'Validation failed' },
        { status: 400 },
      );
    }

    const existingAreas = await withRequestContext(async ({ lifeArea }) => {
      return await lifeArea.findAllLifeAreas(userId);
    });
    const currentArea = existingAreas.find((a) => a.id === id);
    const targetActive = validation.active !== undefined ? validation.active : (currentArea?.active ?? true);
    const targetDifficulty = validation.difficulty !== undefined ? validation.difficulty : (currentArea?.difficulty ?? 1);

    if (targetActive) {
      const activeAreas = existingAreas.filter((a) => a.active !== false);
      const capacity = checkCostCapacity(activeAreas, targetDifficulty, id);

      if (!capacity.valid) {
        return NextResponse.json(
          {
            errors: `Total life time and energy cost cannot exceed 10. (Currently using ${capacity.currentSum}/10)`,
            message: 'Capacity exceeded',
          },
          { status: 400 },
        );
      }
    }

    const updated = await withRequestContext(async ({ lifeArea }) => {
      return await lifeArea.updateLifeArea(id, validation, userId);
    });

    if (!updated) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ lifeArea: serializeLifeArea(updated) }, { status: 200 });
  } catch (error) {
    const authz = authzResponse(error);
    if (authz) return authz;
    console.error('Failed to update life area:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/life-areas/[id]
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id: rawId } = await context.params;
    const id = Number(rawId);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const deleted = await withRequestContext(async ({ lifeArea }) => {
      return await lifeArea.deleteLifeArea(id, userId);
    });

    if (!deleted) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const authz = authzResponse(error);
    if (authz) return authz;
    console.error('Failed to delete life area:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
