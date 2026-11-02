import 'server-only';
import { withRequestContext } from '@/db';
import { requireUserId } from '@/features/auth/lib/utils';
import { serializeLifeArea } from './repository';
import type { LifeArea } from '../lib/types';

export async function getLifeAreasQuery(): Promise<LifeArea[]> {
  const userId = await requireUserId();

  return withRequestContext(async ({ lifeArea }) => {
    const areas = await lifeArea.findAllLifeAreas(userId);
    return areas.map(serializeLifeArea);
  });
}

export async function getLifeAreaByIdQuery(id: number): Promise<LifeArea | null> {
  const userId = await requireUserId();

  return withRequestContext(async ({ lifeArea }) => {
    const area = await lifeArea.findById(id, userId);
    return area ? serializeLifeArea(area) : null;
  });
}
