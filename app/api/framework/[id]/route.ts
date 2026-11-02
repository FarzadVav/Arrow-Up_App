import { NextRequest, NextResponse } from 'next/server';
import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { serializeFramework } from '@/features/framework/api/repository';
import { UpdateFrameworkSchema } from '@/features/framework/lib/types';
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

export async function GET(
  _request: NextRequest,
  { params }: { params: IdRouteParams },
) {
  try {
    const userId = await requireUserId();
    const frameworkId = await parseRouteId(params);
    if (!frameworkId) return invalidIdResponse();

    const found = await withRequestContext(async ({ framework }) => {
      return await framework.findById(frameworkId, userId);
    });

    if (!found) {
      return notFoundResponse('Framework');
    }

    return NextResponse.json(
      { framework: serializeFramework(found) },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error, 'Failed to get framework by ID:');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: IdRouteParams },
) {
  try {
    const userId = await requireUserId();
    const frameworkId = await parseRouteId(params);
    if (!frameworkId) return invalidIdResponse();

    const body = await request.json();
    const validation = UpdateFrameworkSchema(body);

    if (validation instanceof type.errors) {
      return validationErrorResponse(validation);
    }

    const updated = await withRequestContext(async ({ framework }) => {
      return await framework.updateFramework(frameworkId, validation, userId);
    });

    if (!updated) {
      return notFoundResponse('Framework');
    }

    return NextResponse.json(
      { framework: serializeFramework(updated) },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error, 'Failed to update framework:');
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: IdRouteParams },
) {
  try {
    const userId = await requireUserId();
    const frameworkId = await parseRouteId(params);
    if (!frameworkId) return invalidIdResponse();

    const success = await withRequestContext(async ({ framework }) => {
      return await framework.deleteFramework(frameworkId, userId);
    });

    if (!success) {
      return notFoundResponse('Framework');
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'Failed to delete framework:');
  }
}
