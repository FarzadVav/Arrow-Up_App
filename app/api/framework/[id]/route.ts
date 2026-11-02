import { NextRequest, NextResponse } from 'next/server';
import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { serializeFramework } from '@/features/framework/api/repository';
import { UpdateFrameworkSchema } from '@/features/framework/lib/types';
import { requireUserId } from '@/features/auth/lib/utils';
import { authzResponse } from '@/features/general/lib/utils';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const frameworkId = Number(id);

    if (isNaN(frameworkId)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const found = await withRequestContext(async ({ framework }) => {
      return await framework.findById(frameworkId, userId);
    });

    if (!found) {
      return NextResponse.json({ message: 'Framework not found' }, { status: 404 });
    }

    return NextResponse.json({ framework: serializeFramework(found) }, { status: 200 });
  } catch (error) {
    const authz = authzResponse(error);
    if (authz) return authz;
    console.error('Failed to get framework in GET /api/framework/[id]:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const frameworkId = Number(id);

    if (isNaN(frameworkId)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const validation = UpdateFrameworkSchema(body);

    if (validation instanceof type.errors) {
      return NextResponse.json(
        { errors: validation.summary, message: 'Validation failed' },
        { status: 400 },
      );
    }

    const updated = await withRequestContext(async ({ framework }) => {
      return await framework.updateFramework(frameworkId, validation, userId);
    });

    if (!updated) {
      return NextResponse.json({ message: 'Framework not found' }, { status: 404 });
    }

    return NextResponse.json({ framework: serializeFramework(updated) }, { status: 200 });
  } catch (error) {
    const authz = authzResponse(error);
    if (authz) return authz;
    console.error('Failed to update framework in PUT /api/framework/[id]:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const frameworkId = Number(id);

    if (isNaN(frameworkId)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const success = await withRequestContext(async ({ framework }) => {
      return await framework.deleteFramework(frameworkId, userId);
    });

    if (!success) {
      return NextResponse.json({ message: 'Framework not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const authz = authzResponse(error);
    if (authz) return authz;
    console.error('Failed to delete framework in DELETE /api/framework/[id]:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
