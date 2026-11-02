import { type } from 'arktype';

export const JOURNAL_CATEGORY_NAMES = [
  'Logs',
  'Thoughts',
  'Feelings',
  'Ideas',
  'Notes',
] as const;

/**
 * ArkType schema and inferred type for Journal categories.
 */
export const JournalCategorySchema = type.enumerated(...JOURNAL_CATEGORY_NAMES);
export type JournalCategory = typeof JournalCategorySchema.infer;

/**
 * ArkType schema and inferred type for Journal type variant.
 */
export const JournalTypeSchema = JournalCategorySchema.or('string');
export type JournalType = typeof JournalTypeSchema.infer;

/**
 * ArkType schema and inferred type for Journal entity.
 */
export const JournalSchema = type({
  id: 'number',
  title: 'string',
  content: 'string',
  type: JournalTypeSchema,
  'tag?': 'string | null',
  createdAt: 'string',
});
export type Journal = typeof JournalSchema.infer;

/**
 * ArkType schemas for Journal Repository operations.
 */
export const CreateJournalSchema = type({
  title: 'string >= 1',
  content: 'string >= 1',
  type: JournalCategorySchema,
  'tag?': 'string | null',
});
export type CreateJournalData = typeof CreateJournalSchema.infer;

export const UpdateJournalSchema = type({
  'id?': 'number',
  'title?': 'string >= 1',
  'content?': 'string >= 1',
  'type?': JournalCategorySchema,
  'tag?': 'string | null',
});
export type UpdateJournalData = typeof UpdateJournalSchema.infer;

/**
 * ArkType schema and inferred type for JournalTag entity.
 */
export const JournalTagSchema = type({
  id: 'number',
  title: 'string',
  category: JournalCategorySchema,
  'createdAt?': 'string',
  'updatedAt?': 'string',
});
export type JournalTag = typeof JournalTagSchema.infer;

export const CreateJournalTagSchema = type({
  title: 'string >= 1',
  category: JournalCategorySchema,
});
export type CreateJournalTagData = typeof CreateJournalTagSchema.infer;

export const UpdateJournalTagSchema = type({
  id: 'number',
  'title?': 'string >= 1',
  'category?': JournalCategorySchema,
});
export type UpdateJournalTagData = typeof UpdateJournalTagSchema.infer;
