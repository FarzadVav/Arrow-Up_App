import { type } from 'arktype';

/**
 * Summary schema for Life Area referenced in Framework.
 */
export const FrameworkLifeAreaSummarySchema = type({
  id: 'number',
  title: 'string',
});

/**
 * Summary schema for Tag referenced in Framework.
 */
export const FrameworkTagSummarySchema = type({
  id: 'number',
  title: 'string',
});

/**
 * Schema for framework check-in completion history.
 */
export const FrameworkHistoryItemSchema = type({
  id: 'number',
  date: 'string',
  isDone: 'boolean',
});

/**
 * ArkType schema and inferred type for Framework practice items.
 */
export const FrameworkPracticeSchema = type({
  id: 'number',
  title: 'string',
});
export type FrameworkPractice = typeof FrameworkPracticeSchema.infer;

/**
 * ArkType schema and inferred type for Framework entity.
 */
export const FrameworkSchema = type({
  id: 'number',
  title: 'string',
  content: 'string',
  'lifeAreaId?': 'number | null',
  'lifeArea?': FrameworkLifeAreaSummarySchema,
  'tagId?': 'number | null',
  'tag?': 'string | null',
  'practices?': FrameworkPracticeSchema.array(),
  'history?': FrameworkHistoryItemSchema.array(),
  'createdAt?': 'string',
  'updatedAt?': 'string',
  'deletedAt?': 'string | null',
});
export type Framework = typeof FrameworkSchema.infer;

/**
 * ArkType schema for a practice input item.
 * Supports either an object with id/title or a plain title string.
 */
export const FrameworkPracticeInputSchema = type({
  'id?': 'number',
  title: 'string >= 1',
}).or('string >= 1');
export type FrameworkPracticeInput = typeof FrameworkPracticeInputSchema.infer;

/**
 * ArkType schema for creating a Framework.
 * Content is mandatory; practices are optional.
 */
export const CreateFrameworkSchema = type({
  title: 'string >= 1',
  content: 'string >= 1',
  lifeAreaId: 'number >= 1',
  'tagId?': 'number >= 1',
  'tag?': 'string | number',
  'practices?': FrameworkPracticeInputSchema.array(),
});
export type CreateFrameworkData = typeof CreateFrameworkSchema.infer;

/**
 * ArkType schema for updating a Framework.
 */
export const UpdateFrameworkSchema = type({
  'id?': 'number',
  'title?': 'string >= 1',
  'content?': 'string >= 1',
  'lifeAreaId?': 'number >= 1',
  'tagId?': 'number >= 1',
  'tag?': 'string | number',
  'practices?': FrameworkPracticeInputSchema.array(),
});
export type UpdateFrameworkData = typeof UpdateFrameworkSchema.infer;

/**
 * ArkType schema and inferred type for the FrameworkTag entity.
 * A tag belongs to a mandatory life area.
 */
export const FrameworkTagSchema = type({
  id: 'number',
  title: 'string',
  lifeAreaId: 'number | null',
  'createdAt?': 'string',
  'updatedAt?': 'string',
});
export type FrameworkTag = typeof FrameworkTagSchema.infer;

export const CreateFrameworkTagSchema = type({
  title: 'string >= 1',
  lifeAreaId: 'number >= 1',
});
export type CreateFrameworkTagData = typeof CreateFrameworkTagSchema.infer;

export const UpdateFrameworkTagSchema = type({
  id: 'number',
  'title?': 'string >= 1',
  'lifeAreaId?': 'number >= 1',
});
export type UpdateFrameworkTagData = typeof UpdateFrameworkTagSchema.infer;
