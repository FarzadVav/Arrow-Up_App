import { type } from 'arktype';
import { JOURNAL_CATEGORY_NAMES } from './constants';

export { JOURNAL_CATEGORY_NAMES };

/**
 * ArkType schema and inferred type for Journal categories.
 */
export const JournalCategoryNameSchema = type.enumerated(...JOURNAL_CATEGORY_NAMES);
export type JournalCategoryName = typeof JournalCategoryNameSchema.infer;
export type JournalCategory = JournalCategoryName;

/**
 * ArkType schema and inferred type for Journal type variant.
 */
export const JournalTypeSchema = JournalCategoryNameSchema.or('string');
export type JournalType = typeof JournalTypeSchema.infer;

/**
 * ArkType schema for a Journal Tag.
 */
export const JournalTagSchema = type({
  id: 'number',
  slug: 'string',
  nameEn: 'string',
  nameFa: 'string',
  'categoryId?': 'number',
  'categorySlug?': 'string',
  'title?': 'string',
  'createdAt?': 'string',
  'updatedAt?': 'string',
});
export type JournalTag = typeof JournalTagSchema.infer;

/**
 * ArkType schema for a Journal Category.
 */
export const JournalCategoryObjectSchema = type({
  id: 'number',
  slug: 'string',
  nameEn: 'string',
  nameFa: 'string',
  'tags?': JournalTagSchema.array(),
});
export type JournalCategoryObject = typeof JournalCategoryObjectSchema.infer;

/**
 * ArkType schema and inferred type for Journal entity DTO.
 */
export const JournalSchema = type({
  id: 'number',
  title: 'string',
  content: 'string',
  category: JournalCategoryObjectSchema,
  tag: JournalTagSchema,
  'type?': 'string',
  createdAt: 'string',
  'deletedAt?': 'string | null',
});
export type Journal = typeof JournalSchema.infer;

/**
 * ArkType schemas for Journal Repository operations.
 */
export const CreateJournalSchema = type({
  title: 'string >= 1',
  content: 'string >= 1',
  'type?': 'string | number',
  'category?': 'string | number',
  'categoryId?': 'number',
  'tag?': 'string | number',
  'tagId?': 'number',
});
export type CreateJournalData = typeof CreateJournalSchema.infer;

export const UpdateJournalSchema = type({
  'id?': 'number',
  'title?': 'string >= 1',
  'content?': 'string >= 1',
  'type?': 'string | number',
  'category?': 'string | number',
  'categoryId?': 'number',
  'tag?': 'string | number',
  'tagId?': 'number',
});
export type UpdateJournalData = typeof UpdateJournalSchema.infer;

export const CreateJournalTagSchema = type({
  title: 'string',
  'category?': 'string',
});
export type CreateJournalTagData = typeof CreateJournalTagSchema.infer;

export const UpdateJournalTagSchema = type({
  'id?': 'number',
  'title?': 'string',
  'category?': 'string',
});
export type UpdateJournalTagData = typeof UpdateJournalTagSchema.infer;
