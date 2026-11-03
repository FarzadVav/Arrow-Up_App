import { type } from 'arktype';

/**
 * Summary schema for Life Area referenced in Skill.
 */
export const SkillLifeAreaSummarySchema = type({
  id: 'number',
  title: 'string',
  'vision?': 'string',
});

/**
 * Summary schema for Tag referenced in Skill.
 */
export const SkillTagSummarySchema = type({
  id: 'number',
  title: 'string',
});

/**
 * ArkType schema and inferred type for a complete Skill entity.
 */
export const SkillSchema = type({
  id: 'number',
  title: 'string',
  content: 'string',
  'lifeAreaId?': 'number | null',
  'lifeArea?': SkillLifeAreaSummarySchema,
  'tagId?': 'number | null',
  'tag?': 'string | null',
  'createdAt?': 'string',
  'updatedAt?': 'string',
  'deletedAt?': 'string | null',
});
export type Skill = typeof SkillSchema.infer;

/**
 * ArkType schemas for Skill data operations.
 * LifeArea and Tag are mandatory on create/edit; users cannot send null.
 */
export const CreateSkillSchema = type({
  title: 'string >= 1',
  content: 'string',
  lifeAreaId: 'number >= 1',
  'tagId?': 'number >= 1',
  'tag?': 'string | number',
});
export type CreateSkillData = typeof CreateSkillSchema.infer;

export const UpdateSkillSchema = type({
  'id?': 'number',
  'title?': 'string >= 1',
  'content?': 'string',
  'lifeAreaId?': 'number >= 1',
  'tagId?': 'number >= 1',
  'tag?': 'string | number',
});
export type UpdateSkillData = typeof UpdateSkillSchema.infer;

/**
 * ArkType schema and inferred type for the SkillTag entity.
 * A tag belongs to a mandatory life area.
 */
export const SkillTagSchema = type({
  id: 'number',
  title: 'string',
  lifeAreaId: 'number | null',
  'createdAt?': 'string',
  'updatedAt?': 'string',
});
export type SkillTag = typeof SkillTagSchema.infer;

export const CreateSkillTagSchema = type({
  title: 'string >= 1',
  lifeAreaId: 'number >= 1',
});
export type CreateSkillTagData = typeof CreateSkillTagSchema.infer;

export const UpdateSkillTagSchema = type({
  id: 'number',
  'title?': 'string >= 1',
  'lifeAreaId?': 'number >= 1',
});
export type UpdateSkillTagData = typeof UpdateSkillTagSchema.infer;
