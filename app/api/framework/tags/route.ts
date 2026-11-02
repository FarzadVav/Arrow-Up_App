import { NextRequest, NextResponse } from 'next/server';
import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { requireUserId } from '@/features/auth/lib/utils';
import { authzResponse } from '@/features/general/lib/utils';
import { serializeFrameworkTag } from '@/features/framework/api/repository';
import { CreateFrameworkTagSchema } from '@/features/framework/lib/types';
import { parseLifeAreaSlug } from '@/features/general/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const lifeAreaId = parseLifeAreaSlug(
      request.nextUrl.searchParams.get('lifeAreaId'),
    );

    const tags = await withRequestContext(async ({ frameworkTag }) => {
      const entities =
        lifeAreaId === undefined
          ? await frameworkTag.findAllTags(userId)
          : await frameworkTag.findByLifeArea(lifeAreaId, userId);

      return entities.map(serializeFrameworkTag);
    });

    return NextResponse.json(
      { tags },
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
    console.error('Failed to get framework tags:', error);
    return NextResponse.json(
      { tags: [], message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const validation = CreateFrameworkTagSchema({
      title: body?.title,
      lifeAreaId:
        body?.lifeAreaId === undefined
          ? undefined
          : parseLifeAreaSlug(String(body.lifeAreaId)),
    });

    if (validation instanceof type.errors) {
      return NextResponse.json(
        { errors: validation.summary, message: 'Validation failed' },
        { status: 400 },
      );
    }

    const created = await withRequestContext(async ({ frameworkTag }) => {
      return await frameworkTag.createTag(validation, userId);
    });

    return NextResponse.json(
      { tag: serializeFrameworkTag(created) },
      { status: 201 },
    );
  } catch (error) {
    const authz = authzResponse(error);
    if (authz) return authz;
    console.error('Failed to create framework tag:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
