import { type } from 'arktype';

/**
 * ArkType schema and inferred type for a complete LifeArea entity.
 */
export const LifeAreaSchema = type({
  id: 'number',
  title: 'string',
  vision: 'string',
  'active?': 'boolean',
  'difficulty?': 'number',
  'createdAt?': 'string',
  'updatedAt?': 'string',
});
export type LifeArea = typeof LifeAreaSchema.infer;

/**
 * ArkType schemas for LifeArea data operations.
 */
export const CreateLifeAreaSchema = type({
  title: 'string >= 1',
  vision: 'string',
  'active?': 'boolean',
  'difficulty?': 'number',
});
export type CreateLifeAreaData = typeof CreateLifeAreaSchema.infer;

export const UpdateLifeAreaSchema = type({
  'id?': 'number',
  'title?': 'string >= 1',
  'vision?': 'string',
  'active?': 'boolean',
  'difficulty?': 'number',
});
export type UpdateLifeAreaData = typeof UpdateLifeAreaSchema.infer;
