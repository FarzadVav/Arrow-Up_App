import 'server-only';
import { notFound } from 'next/navigation';
import { withRequestContext } from '@/db';
import { requireUserId } from '@/features/auth/lib/utils';
import { getTranslations } from '@/features/general/lib/i18n/server';
import { JournalCategory } from '@/db/entities/enums';
import { serializeJournal, serializeJournalTag } from './repository';
import { getJournalCategory } from '../lib/utils';
import type {
  Journal,
  JournalCategory as JournalCategoryType,
  JournalTag,
  JournalsStats,
  JournalCategoryDefinition,
} from '../lib/types';

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
        { user: userId, tag, deletedAt: null },
        { orderBy: [{ sortNumber: 'ASC' }, { createdAt: 'DESC' }] },
      );
    } else {
      entities = await journal.findAllJournals(userId);
    }

    return entities.map((item) => serializeJournal(item));
  });
}

/**
 * Server query for retrieving the acting user's deleted journals (history).
 */
export async function getJournalsHistoryQuery(
  category?: JournalCategoryType | 'all' | string,
): Promise<Journal[]> {
  const userId = await requireUserId();

  return withRequestContext(async ({ journal }) => {
    const entities = await journal.findHistory(userId, category);
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

export type JournalCategoryRouteParams = Promise<{ category: string }>;

/**
 * Resolves a journal category from route parameters, validating it and
 * retrieving its localized translated title. Automatically triggers notFound() if invalid.
 */
export async function resolveJournalCategory(
  params: JournalCategoryRouteParams,
): Promise<{
  category: JournalCategoryDefinition;
  title: string;
}> {
  const { category: rawSlug } = await params;
  if (!rawSlug) {
    notFound();
  }

  const matched = getJournalCategory(rawSlug);
  if (!matched) {
    notFound();
  }

  const { t } = await getTranslations();
  const title =
    t(`journals.categories.${matched.name.toLowerCase()}`) || matched.name;

  return { category: matched, title };
}
