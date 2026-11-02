import { NextRequest, NextResponse } from 'next/server';
import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { serializeFramework } from '@/features/framework/api/repository';
import { CreateFrameworkSchema } from '@/features/framework/lib/types';
import { requireUserId } from '@/features/auth/lib/utils';
import {
  parseLifeAreaSlug,
  jsonNoStore,
  validationErrorResponse,
  handleApiError,
} from '@/features/general/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * GET /api/frameworks?lifeAreaId=...
 * Returns list of frameworks for authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const searchParams = request.nextUrl.searchParams;
    const lifeAreaId = parseLifeAreaSlug(searchParams.get('lifeAreaId'));

    const frameworks = await withRequestContext(async ({ framework }) => {
      const entities = await framework.findAllFrameworks(userId, { lifeAreaId });
      return entities.map(serializeFramework);
    });

    return jsonNoStore({ frameworks });
  } catch (error) {
    return handleApiError(error, 'Failed to get frameworks:');
  }
}

/**
 * POST /api/frameworks
 * Creates a new Framework.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const validation = CreateFrameworkSchema(body);

    if (validation instanceof type.errors) {
      return validationErrorResponse(validation);
    }

    const created = await withRequestContext(async ({ framework }) => {
      return await framework.createFramework(validation, userId);
    });

    return NextResponse.json(
      { framework: serializeFramework(created) },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error, 'Failed to create framework:');
  }
}
