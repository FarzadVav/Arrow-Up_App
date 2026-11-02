export type {
  TodoType,
  TodoLifeAreaSummary,
  TodoAction,
  TodoDiscipline,
  Todo,
  CreateTodoData,
  UpdateTodoData,
  CreateActionData,
  UpdateActionData,
  CreateDisciplineData,
} from './schemas';
export {
  TodoTypeSchema,
  TodoLifeAreaSummarySchema,
  TodoActionSchema,
  TodoDisciplineHistorySchema,
  TodoDisciplineSchema,
  TodoSchema,
  CreateTodoSchema,
  UpdateTodoSchema,
  CreateActionSchema,
  UpdateActionSchema,
  CreateDisciplineSchema,
} from './schemas';

import type { TodoType } from './schemas';

/**
 * Form state for Base UI and React 19 useActionState form handling.
 */
export type TodoFormState = {
  errors?: {
    title?: string[];
    description?: string[];
    type?: string[];
    deadline?: string[];
    difficulty?: string[];
    lifeAreaId?: string[];
    general?: string[];
  };
  message?: string;
  inputs?: {
    id?: number;
    title?: string;
    description?: string;
    type?: TodoType;
    deadline?: string | null;
    difficulty?: number;
    lifeAreaId?: number | null;
  };
  success?: boolean;
  todoId?: number;
} | null;
