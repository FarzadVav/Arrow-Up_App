import { NextRequest, NextResponse } from 'next/server';
import { type } from 'arktype';
import type { EntityClass } from '@mikro-orm/core';
import { withRequestContext } from '@/db';
import { Habit, Journal, Skill, Todo } from '@/db/entities';
import { requireUserId } from '@/features/auth/lib/utils';
import {
  handleApiError,
  validationErrorResponse,
} from '@/features/general/lib/utils';

export const dynamic = 'force-dynamic';

const REORDERABLE_ENTITIES = {
  todos: Todo,
  skills: Skill,
  journals: Journal,
  habits: Habit,
} as const;

export type ReorderEntity = keyof typeof REORDERABLE_ENTITIES;

interface ReorderableRecord {
  id: number;
  sortNumber: number;
  user?: unknown;
}

const ReorderSchema = type({
  entity: type.enumerated('todos', 'skills', 'journals', 'habits'),
  ids: 'number[]',
});

/**
 * POST /api/reorder
 * Persists a drag-reorder of one card list by assigning sortNumber
 * from the position of each id in the received order.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const validation = ReorderSchema(body);

    if (validation instanceof type.errors) {
      return validationErrorResponse(validation);
    }

    await withRequestContext(async ({ em }) => {
      const entityClass = REORDERABLE_ENTITIES[
        validation.entity
      ] as unknown as EntityClass<ReorderableRecord>;

      const records = await em.find(entityClass, {
        id: validation.ids,
        user: userId,
      });

      const positionById = new Map(
        validation.ids.map((id: number, index: number) => [id, index]),
      );

      for (const record of records) {
        const position = positionById.get(record.id);
        if (position !== undefined) {
          record.sortNumber = position;
        }
      }

      await em.flush();
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'Failed to persist reorder in /api/reorder:');
  }
}
