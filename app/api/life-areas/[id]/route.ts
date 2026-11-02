import { NextRequest, NextResponse } from 'next/server';
import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { serializeLifeArea } from '@/features/life-areas/api/repository';
import { UpdateLifeAreaSchema } from '@/features/life-areas/lib/types';
import { requireUserId } from '@/features/auth/lib/utils';
import {
  checkCostCapacity,
  parseRouteId,
  invalidIdResponse,
  notFoundResponse,
  validationErrorResponse,
  handleApiError,
  type IdRouteParams,
} from '@/features/general/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * GET /api/life-areas/[id]
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: IdRouteParams },
) {
  try {
    const userId = await requireUserId();
    const id = await parseRouteId(params);
    if (!id) return invalidIdResponse();

    const item = await withRequestContext(async ({ lifeArea }) => {
      return await lifeArea.findById(id, userId);
    });

    if (!item) {
      return notFoundResponse('Life area');
    }

    return NextResponse.json({ lifeArea: serializeLifeArea(item) }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'Failed to get life area by ID:');
  }
}

/**
 * PUT/PATCH /api/life-areas/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: IdRouteParams },
) {
  try {
    const userId = await requireUserId();
    const id = await parseRouteId(params);
    if (!id) return invalidIdResponse();

    const body = await request.json();
    const validation = UpdateLifeAreaSchema(body);

    if (validation instanceof type.errors) {
      return validationErrorResponse(validation);
    }

    const existingAreas = await withRequestContext(async ({ lifeArea }) => {
      return await lifeArea.findAllLifeAreas(userId);
    });
    const currentArea = existingAreas.find((a) => a.id === id);
    const targetActive =
      validation.active !== undefined
        ? validation.active
        : (currentArea?.active ?? true);
    const targetDifficulty =
      validation.difficulty !== undefined
        ? validation.difficulty
        : (currentArea?.difficulty ?? 1);

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
      return notFoundResponse('Life area');
    }

    return NextResponse.json({ lifeArea: serializeLifeArea(updated) }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'Failed to update life area:');
  }
}

/**
 * DELETE /api/life-areas/[id]
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: IdRouteParams },
) {
  try {
    const userId = await requireUserId();
    const id = await parseRouteId(params);
    if (!id) return invalidIdResponse();

    const deleted = await withRequestContext(async ({ lifeArea }) => {
      return await lifeArea.deleteLifeArea(id, userId);
    });

    if (!deleted) {
      return notFoundResponse('Life area');
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'Failed to delete life area:');
  }
}
