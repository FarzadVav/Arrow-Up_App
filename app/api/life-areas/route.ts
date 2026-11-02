import { NextRequest, NextResponse } from 'next/server';
import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { serializeLifeArea } from '@/features/life-areas/api/repository';
import { CreateLifeAreaSchema } from '@/features/life-areas/lib/types';
import { requireUserId } from '@/features/auth/lib/utils';
import { authzResponse } from '@/features/general/lib/utils';
import { checkCostCapacity } from '@/features/general/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * GET /api/life-areas
 * Returns list of life areas for authenticated user.
 */
export async function GET() {
  try {
    const userId = await requireUserId();

    const lifeAreas = await withRequestContext(async ({ lifeArea }) => {
      const entities = await lifeArea.findAllLifeAreas(userId);
      return entities.map(serializeLifeArea);
    });

    return NextResponse.json(
      { lifeAreas },
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
    console.error('Failed to get life areas in GET /api/life-areas:', error);
    return NextResponse.json(
      { lifeAreas: [], message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/life-areas
 * Creates a new Life Area.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const validation = CreateLifeAreaSchema(body);

    if (validation instanceof type.errors) {
      return NextResponse.json(
        { errors: validation.summary, message: 'Validation failed' },
        { status: 400 },
      );
    }

    const targetDifficulty = validation.difficulty ?? 1;
    const targetActive = validation.active ?? true;

    if (targetActive) {
      const existingAreas = await withRequestContext(async ({ lifeArea }) => {
        return await lifeArea.findAllLifeAreas(userId);
      });
      const activeAreas = existingAreas.filter((a) => a.active !== false);
      const capacity = checkCostCapacity(activeAreas, targetDifficulty);

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

    const created = await withRequestContext(async ({ lifeArea }) => {
      return await lifeArea.createLifeArea(validation, userId);
    });

    return NextResponse.json(
      { lifeArea: serializeLifeArea(created) },
      { status: 201 },
    );
  } catch (error) {
    const authz = authzResponse(error);
    if (authz) return authz;
    console.error('Failed to create life area in POST /api/life-areas:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
