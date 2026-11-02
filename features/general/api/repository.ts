import type { EntityRepository } from '@mikro-orm/postgresql';
import { LifeArea } from '@/db/entities/LifeArea';
import { ForbiddenReferenceError, InactiveReferenceError } from '../lib/utils';
import type { ActionResult } from '../lib/types';

export interface IGeneralRepository {
  ping?(): Promise<boolean>;
}

export type { ActionResult };

type RepositoryEm = EntityRepository<LifeArea>['em'];

/**
 * Verifies in one query that every referenced LifeArea id belongs to userId.
 *
 * Client-supplied relation ids must never reach `em.getReference` unchecked:
 * MikroORM defers the lookup, so a foreign id silently links one user's record
 * to another user's area. Ids are asserted before binding, not after.
 *
 * Archived (inactive) areas are refused as well: they stay readable, editable and
 * deletable, but new work is only ever assigned to an active area. `keepInactiveId`
 * lets an existing record keep the area it already has.
 */
export async function assertOwnedLifeAreas(
  em: RepositoryEm,
  userId: number,
  lifeAreaIds: readonly (number | null | undefined)[],
  options?: { keepInactiveId?: number | null },
): Promise<void> {
  const ids = [
    ...new Set(
      lifeAreaIds.filter(
        (id): id is number => typeof id === 'number' && Number.isSafeInteger(id) && id > 0,
      ),
    ),
  ];

  if (ids.length === 0) {
    return;
  }

  const areas = await em.find(
    LifeArea,
    { id: { $in: ids }, user: userId },
    { fields: ['id', 'active'] },
  );
  const owned = new Map(areas.map((area) => [area.id, area.active ?? true]));

  for (const id of ids) {
    if (!owned.has(id)) {
      throw new ForbiddenReferenceError('lifeAreaId', id);
    }

    if (owned.get(id) === false && id !== options?.keepInactiveId) {
      throw new InactiveReferenceError('lifeAreaId', id);
    }
  }
}
