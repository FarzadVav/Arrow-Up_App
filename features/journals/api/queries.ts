import 'server-only';
import { withRequestContext } from '@/db';
import { requireUserId } from '@/features/auth/lib/utils';
import { JournalCategory } from '@/db/entities/enums';
import { serializeJournal, serializeJournalTag } from './repository';
import type { Journal, JournalCategory as JournalCategoryType, JournalTag, JournalsStats } from '../lib/types';

export type { JournalsStats };

/**
 * Server query for retrieving a single journal owned by the acting user.
 * Another user's id is indistinguishable from a nonexistent one.
 */
export async function getJournalByIdQuery(id: number): Promise<Journal | null> {
  const userId = await requireUserId();

  return withRequestContext(async ({ journal }) => {
    const entity = await journal.findById(id, userId);
    if (!entity) {
      return null;
    }

    return serializeJournal(entity);
  });
}

/**
 * Server query for retrieving the acting user's journals, optionally filtered by
 * category and tag. Authorization is resolved here rather than trusting a caller.
 */
export async function getJournalsQuery(
  category?: JournalCategoryType | 'all' | string,
  tag?: string,
): Promise<Journal[]> {
  const userId = await requireUserId();

  return withRequestContext(async ({ journal }) => {
    let entities;
    if (category && category !== 'all') {
      entities = await journal.findByCategory(category, userId, tag);
    } else if (tag && tag.toLowerCase() !== 'all') {
      entities = await journal.find(
        { user: userId, tag },
        { orderBy: { createdAt: 'DESC' } },
      );
    } else {
      entities = await journal.findAllJournals(userId);
    }

    return entities.map((item) => serializeJournal(item));
  });
}

/**
 * Server query for retrieving aggregated summary statistics and counts for journals per category.
 * Uses repository pattern via withRequestContext.
 */
export async function getJournalsStatsQuery(): Promise<JournalsStats> {
  const userId = await requireUserId();

  return withRequestContext(async ({ journal }) => {
    const counts = await journal.getCategoryCounts(userId);
    const total = Object.values(counts).reduce((acc, count) => acc + count, 0);

    return { counts, total };
  });
}

export async function getJournalTagsQuery(
  category?: JournalCategoryType | string,
): Promise<JournalTag[]> {
  const userId = await requireUserId();

  return withRequestContext(async ({ journalTag }) => {
    const entities = category
      ? await journalTag.findByCategory(category, userId)
      : await journalTag.findAllTags(userId);

    return entities.map((item) => serializeJournalTag(item));
  });
}

export async function getJournalTagByIdQuery(
  id: number,
): Promise<JournalTag | null> {
  const userId = await requireUserId();

  return withRequestContext(async ({ journalTag }) => {
    const entity = await journalTag.findById(id, userId);
    return entity ? serializeJournalTag(entity) : null;
  });
}
