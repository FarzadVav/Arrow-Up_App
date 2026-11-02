import { type } from 'arktype';

/**
 * ArkType schema and inferred type for Todo type variants.
 */
export const TodoTypeSchema = type.enumerated('Daily', 'Upcoming', 'Mission');
export type TodoType = typeof TodoTypeSchema.infer;

/**
 * Summary schema for Life Area referenced in Todo and Disciplines.
 */
export const TodoLifeAreaSummarySchema = type({
  id: 'number',
  title: 'string',
  'vision?': 'string',
});
export type TodoLifeAreaSummary = typeof TodoLifeAreaSummarySchema.infer;

/**
 * ArkType schema and inferred type for sub-action items in missions.
 */
export const TodoActionSchema = type({
  id: 'number',
  title: 'string',
  'deadline?': 'string | null',
  isDone: 'boolean',
  'createdAt?': 'string',
  'updatedAt?': 'string',
});
export type TodoAction = typeof TodoActionSchema.infer;

/**
 * ArkType schema for recurring discipline completion history.
 */
export const TodoDisciplineHistorySchema = type({
  date: 'string',
  isDone: 'boolean',
});

/**
 * ArkType schema and inferred type for recurring mission disciplines.
 */
export const TodoDisciplineSchema = type({
  id: 'number',
  title: 'string',
  'history?': TodoDisciplineHistorySchema.array(),
});
export type TodoDiscipline = typeof TodoDisciplineSchema.infer;

/**
 * ArkType schema and inferred type for a complete Todo entity.
 */
export const TodoSchema = type({
  id: 'number',
  title: 'string',
  description: 'string',
  'deadline?': 'string | null',
  type: TodoTypeSchema,
  isDone: 'boolean',
  'difficulty?': 'number',
  'lifeAreaId?': 'number | null',
  'lifeArea?': TodoLifeAreaSummarySchema,
  'actions?': TodoActionSchema.array(),
  'disciplines?': TodoDisciplineSchema.array(),
  'createdAt?': 'string',
  'updatedAt?': 'string',
});
export type Todo = typeof TodoSchema.infer;

/**
 * ArkType schemas for Todo Repository mutations and data operations.
 */
export const CreateTodoSchema = type({
  title: 'string >= 1',
  'description?': 'string',
  type: TodoTypeSchema,
  'deadline?': 'string | null',
  'difficulty?': 'number',
  'lifeAreaId?': 'number | null',
  'isDone?': 'boolean',
  'actions?': type({
    'id?': 'number',
    title: 'string >= 1',
    'deadline?': 'string | null',
    'isDone?': 'boolean',
  }).array(),
  'disciplines?': type({
    'id?': 'number',
    title: 'string >= 1',
  }).array(),
});
export type CreateTodoData = typeof CreateTodoSchema.infer;

export const UpdateTodoSchema = type({
  'id?': 'number',
  'title?': 'string >= 1',
  'description?': 'string',
  'type?': TodoTypeSchema,
  'deadline?': 'string | null',
  'isDone?': 'boolean',
  'difficulty?': 'number',
  'lifeAreaId?': 'number | null',
  'actions?': type({
    'id?': 'number',
    title: 'string >= 1',
    'deadline?': 'string | null',
    'isDone?': 'boolean',
  }).array(),
  'disciplines?': type({
    'id?': 'number',
    title: 'string >= 1',
  }).array(),
});
export type UpdateTodoData = typeof UpdateTodoSchema.infer;

export const CreateActionSchema = type({
  title: 'string >= 1',
  'deadline?': 'string | null',
  'isDone?': 'boolean',
});
export type CreateActionData = typeof CreateActionSchema.infer;

export const UpdateActionSchema = type({
  'title?': 'string >= 1',
  'deadline?': 'string | null',
  'isDone?': 'boolean',
});
export type UpdateActionData = typeof UpdateActionSchema.infer;

export const CreateDisciplineSchema = type({
  title: 'string >= 1',
});
export type CreateDisciplineData = typeof CreateDisciplineSchema.infer;
