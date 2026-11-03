import {
  STATIC_JOURNAL_CATEGORIES,
  type StaticJournalTag,
} from './constants';
import type { JournalCategoryDefinition } from './types';

/**
 * Helper to find a category definition by its name or slug (case-insensitive).
 */
export function getJournalCategory(
  categoryName?: string | null,
): JournalCategoryDefinition | undefined {
  if (!categoryName) return undefined;
  const clean = categoryName.toLowerCase().trim();
  const found = STATIC_JOURNAL_CATEGORIES.find(
    (c) => c.slug.toLowerCase() === clean || c.nameEn.toLowerCase() === clean,
  );
  if (!found) return undefined;
  return {
    name: found.nameEn as JournalCategoryDefinition['name'],
    slug: found.slug,
    nameEn: found.nameEn,
    nameFa: found.nameFa,
    tags: found.tags.map((t) => t.nameEn),
  };
}

/**
 * Helper to get available tag names for a given category.
 */
export function getCategoryTags(categoryName?: string | null): string[] {
  const cat = getJournalCategory(categoryName);
  return cat ? [...cat.tags] : [];
}

/**
 * Helper to get available static tags (with en and fa names) for a given category.
 */
export function getCategoryStaticTags(
  categoryName?: string | null,
): StaticJournalTag[] {
  if (!categoryName) return [];
  const clean = categoryName.toLowerCase().trim();
  const found = STATIC_JOURNAL_CATEGORIES.find(
    (c) => c.slug.toLowerCase() === clean || c.nameEn.toLowerCase() === clean,
  );
  return found ? found.tags : [];
}

/**
 * Helper to get localized tag name based on current locale.
 */
export function getTagName(
  tag?: { nameEn: string; nameFa: string } | null,
  locale: string = 'fa',
): string {
  if (!tag) return '';
  return locale === 'fa' ? tag.nameFa : tag.nameEn;
}

/**
 * Helper to get localized category name based on current locale.
 */
export function getCategoryName(
  category?: { nameEn: string; nameFa: string } | null,
  locale: string = 'fa',
): string {
  if (!category) return '';
  return locale === 'fa' ? category.nameFa : category.nameEn;
}
