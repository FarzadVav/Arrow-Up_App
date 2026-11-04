import 'server-only';
import { withRequestContext } from '@/db';
import { requireUserId } from '@/features/auth/lib/utils';
import { serializeFramework, serializeFrameworkTag } from './repository';
import type { Framework, FrameworkTag } from '../lib/types';

export async function getFrameworksQuery(lifeAreaId?: number | null): Promise<Framework[]> {
  const userId = await requireUserId();

  return withRequestContext(async ({ framework }) => {
    const items = await framework.findAllFrameworks(userId, { lifeAreaId });
    return items.map(serializeFramework);
  });
}

export async function getFrameworkByIdQuery(id: number): Promise<Framework | null> {
  const userId = await requireUserId();

  return withRequestContext(async ({ framework }) => {
    const item = await framework.findById(id, userId);
    return item ? serializeFramework(item) : null;
  });
}

export async function getFrameworksHistoryQuery(lifeAreaId?: number | null): Promise<Framework[]> {
  const userId = await requireUserId();

  return withRequestContext(async ({ framework }) => {
    const items = await framework.findHistory(userId, { lifeAreaId });
    return items.map(serializeFramework);
  });
}

export async function getFrameworkTagsQuery(lifeAreaId?: number | null): Promise<FrameworkTag[]> {
  const userId = await requireUserId();

  return withRequestContext(async ({ frameworkTag }) => {
    const tags =
      lifeAreaId !== undefined
        ? await frameworkTag.findByLifeArea(lifeAreaId, userId)
        : await frameworkTag.findAllTags(userId);
    return tags.map(serializeFrameworkTag);
  });
}
