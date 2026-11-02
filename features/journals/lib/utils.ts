import { JOURNAL_CATEGORIES } from './constants';
import type { JournalCategoryDefinition } from './types';


/**
 * Helper to find a category definition by its name (case-insensitive).
 */
export function getJournalCategory(
  categoryName?: string | null,
): JournalCategoryDefinition | undefined {
  if (!categoryName) return undefined;
  return JOURNAL_CATEGORIES.find(
    (c) => c.name.toLowerCase() === categoryName.toLowerCase(),
  );
}

/**
 * Helper to get available tags for a given category.
 */
export function getCategoryTags(categoryName?: string | null): string[] {
  const cat = getJournalCategory(categoryName);
  return cat ? [...cat.tags] : [];
}
