'use server';

import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { TodoType as DbTodoType } from '@/db/entities/enums';
import { tryGetUserId } from '@/features/auth/lib/utils';
import { lifeAreaFieldError } from '@/features/life-areas/lib/utils';
import { getTranslations } from '@/features/general/lib/i18n/server';
import { checkCostCapacity } from '@/features/general/lib/utils';
import type { ActionResult } from '@/features/general/lib/types';
import {
  CreateTodoSchema,
  UpdateTodoSchema,
} from '../lib/schemas';
import type {
  TodoFormState,
  TodoType,
  CreateTodoData,
  UpdateTodoData,
} from '../lib/types';

/**
 * Server Action mutation for creating a new Todo (Daily, Upcoming, or Mission with actions/disciplines).
 * Connects directly to native client-side forms following Base UI and Next.js form guidelines.
 */
export async function createTodoMutation(
  prevState: TodoFormState,
  formData: FormData,
): Promise<TodoFormState> {
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const typeValue = String(formData.get('type') ?? 'Daily') as TodoType;
  const rawDeadline = String(formData.get('deadline') ?? '').trim();
  const deadline = rawDeadline || null;
  const difficultyRaw = formData.get('difficulty');
  const difficulty = difficultyRaw ? Number(difficultyRaw) : 1;

  const lifeAreaIdRaw = formData.get('lifeAreaId');
  const lifeAreaId =
    lifeAreaIdRaw && lifeAreaIdRaw !== '' && lifeAreaIdRaw !== '0' && lifeAreaIdRaw !== 'none'
      ? Number(lifeAreaIdRaw)
      : null;

  const errors: NonNullable<TodoFormState>['errors'] = {};

  if (!lifeAreaId || lifeAreaId <= 0) {
    const { t } = await getTranslations();
    errors.lifeAreaId = [t('lifeAreas.selectLifeArea')];
  }

  let actions: CreateTodoData['actions'] = undefined;
  const actionsRaw = formData.get('actions');
  if (actionsRaw) {
    try {
      actions = JSON.parse(String(actionsRaw)) as CreateTodoData['actions'];
    } catch {
      actions = undefined;
    }
  }

  let disciplines: CreateTodoData['disciplines'] = undefined;
  const disciplinesRaw = formData.get('disciplines');
  if (disciplinesRaw) {
    try {
      disciplines = JSON.parse(String(disciplinesRaw)) as CreateTodoData['disciplines'];
    } catch {
      disciplines = undefined;
    }
  }

  if (typeValue === 'Mission' && !deadline) {
    return {
      errors: {
        ...errors,
        deadline: ['Deadline is required for missions.'],
      },
      inputs: {
        title,
        description,
        type: typeValue,
        deadline,
        difficulty,
        lifeAreaId,
      },
      success: false,
    };
  }

  const validation = CreateTodoSchema({
    title,
    ...(description ? { description } : {}),
    type: typeValue,
    deadline,
    difficulty,
    lifeAreaId: lifeAreaId ?? 0,
    ...(actions && actions.length > 0 ? { actions } : {}),
    ...(disciplines && disciplines.length > 0 ? { disciplines } : {}),
  });

  if (validation instanceof type.errors || Object.keys(errors).length > 0) {
    if (validation instanceof type.errors) {
      for (const problem of validation) {
        const field = String(problem.path[0] ?? 'general') as
          | 'title'
          | 'description'
          | 'type'
          | 'deadline'
          | 'difficulty'
          | 'lifeAreaId'
          | 'general';

        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field]?.push(problem.message);
      }
    }

    return {
      errors,
      inputs: {
        title,
        description,
        type: typeValue,
        deadline,
        difficulty,
        lifeAreaId,
      },
      success: false,
    };
  }

  const userId = await tryGetUserId();
  if (userId === null) {
    return {
      errors: { general: ['Your session has expired. Please sign in again.'] },
      inputs: { title, description, type: typeValue, deadline, difficulty, lifeAreaId },
      success: false,
    };
  }

  const { t } = await getTranslations();

  const dbType =
    typeValue === 'Daily'
      ? DbTodoType.DAILY
      : typeValue === 'Upcoming'
        ? DbTodoType.UPCOMING
        : DbTodoType.MISSION;

  const existingTodos = await withRequestContext(async ({ todo }) => {
    return await todo.find({ type: dbType, user: userId });
  });

  const capacity = checkCostCapacity(existingTodos, difficulty);
  if (!capacity.valid) {
    const errorKey =
      typeValue === 'Daily'
        ? 'todos.dailyCapacityError'
        : typeValue === 'Upcoming'
          ? 'todos.midtermCapacityError'
          : 'missions.capacityError';

    return {
      errors: {
        difficulty: [t(errorKey, { current: capacity.currentSum })],
      },
      inputs: { title, description, type: typeValue, deadline, difficulty, lifeAreaId },
      success: false,
    };
  }

  const inputs = { title, description, type: typeValue, deadline, difficulty, lifeAreaId };

  let created;
  try {
    created = await withRequestContext(async ({ todo }) => {
      return await todo.createTodo(
        {
          title,
          description,
          type: typeValue,
          deadline,
          difficulty,
          lifeAreaId: lifeAreaId!,
          actions,
          disciplines,
        },
        userId,
      );
    });
  } catch (error) {
    const fieldError = lifeAreaFieldError(error);
    if (fieldError) {
      return { errors: { lifeAreaId: [fieldError] }, inputs, success: false };
    }
    throw error;
  }

  return {
    success: true,
    todoId: created.id,
    inputs,
  };
}

/**
 * Server Action mutation for updating an existing Todo.
 * Connects directly to native client-side forms following Base UI and Next.js form guidelines.
 */
export async function updateTodoMutation(
  prevState: TodoFormState,
  formData: FormData,
): Promise<TodoFormState> {
  const idRaw = formData.get('id') || formData.get('editId');
  const id = Number(idRaw);

  if (!id || isNaN(id)) {
    return {
      errors: {
        general: ['Invalid or missing todo ID.'],
      },
      success: false,
    };
  }

  const title = formData.has('title') ? String(formData.get('title') ?? '').trim() : undefined;
  const description = formData.has('description')
    ? String(formData.get('description') ?? '').trim()
    : undefined;
  const typeValue = formData.has('type') ? (String(formData.get('type')) as TodoType) : undefined;
  let deadline: string | null | undefined = undefined;
  if (formData.has('deadline')) {
    const rawDeadline = String(formData.get('deadline') ?? '').trim();
    deadline = rawDeadline || null;
  }
  const difficultyRaw = formData.get('difficulty');
  const difficulty = difficultyRaw !== null && difficultyRaw !== undefined && difficultyRaw !== ''
    ? Number(difficultyRaw)
    : undefined;
  const isDone = formData.has('isDone') ? formData.get('isDone') === 'true' : undefined;

  let lifeAreaId: number | undefined = undefined;
  if (formData.has('lifeAreaId')) {
    const rawVal = formData.get('lifeAreaId');
    if (!rawVal || rawVal === '' || rawVal === '0' || rawVal === 'none') {
      const { t } = await getTranslations();
      return {
        errors: {
          lifeAreaId: [t('lifeAreas.selectLifeArea')],
        },
        inputs: {
          id,
          title,
          description,
          type: typeValue,
          deadline,
          difficulty,
          lifeAreaId: null,
        },
        success: false,
      };
    }
    lifeAreaId = Number(rawVal);
  }

  let actions: UpdateTodoData['actions'] = undefined;
  const actionsRaw = formData.get('actions');
  if (actionsRaw) {
    try {
      actions = JSON.parse(String(actionsRaw)) as UpdateTodoData['actions'];
    } catch {
      actions = undefined;
    }
  }

  let disciplines: UpdateTodoData['disciplines'] = undefined;
  const disciplinesRaw = formData.get('disciplines');
  if (disciplinesRaw) {
    try {
      disciplines = JSON.parse(String(disciplinesRaw)) as UpdateTodoData['disciplines'];
    } catch {
      disciplines = undefined;
    }
  }

  if (typeValue === 'Mission' && deadline === null) {
    return {
      errors: {
        deadline: ['Deadline is required for missions.'],
      },
      inputs: {
        id,
        title,
        description,
        type: typeValue,
        deadline,
        difficulty,
        lifeAreaId,
      },
      success: false,
    };
  }

  const updatePayload = {
    id,
    ...(title !== undefined ? { title } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(typeValue !== undefined ? { type: typeValue } : {}),
    ...(deadline !== undefined ? { deadline } : {}),
    ...(difficulty !== undefined ? { difficulty } : {}),
    ...(isDone !== undefined ? { isDone } : {}),
    ...(lifeAreaId !== undefined ? { lifeAreaId } : {}),
    ...(actions !== undefined ? { actions } : {}),
    ...(disciplines !== undefined ? { disciplines } : {}),
  };

  const validation = UpdateTodoSchema(updatePayload);
  if (validation instanceof type.errors) {
    const errors: NonNullable<TodoFormState>['errors'] = {};

    for (const problem of validation) {
      const field = String(problem.path[0] ?? 'general') as
        | 'title'
        | 'description'
        | 'type'
        | 'deadline'
        | 'difficulty'
        | 'lifeAreaId'
        | 'general';

      if (!errors[field]) {
        errors[field] = [];
      }
      errors[field]?.push(problem.message);
    }

    return {
      errors,
      inputs: {
        id,
        title,
        description,
        type: typeValue,
        deadline,
        difficulty,
        lifeAreaId,
      },
      success: false,
    };
  }

  const userId = await tryGetUserId();
  if (userId === null) {
    return {
      errors: { general: ['Your session has expired. Please sign in again.'] },
      inputs: { id, title, description, type: typeValue, deadline, difficulty, lifeAreaId },
      success: false,
    };
  }

  const { t } = await getTranslations();

  const currentTodo = await withRequestContext(async ({ todo }) => {
    return await todo.findById(id, userId);
  });

  if (!currentTodo) {
    return {
      errors: { general: ['Todo not found or not authorized to edit.'] },
      inputs: { id, title, description, type: typeValue, deadline, difficulty, lifeAreaId },
      success: false,
    };
  }

  const effectiveType = (typeValue ?? currentTodo.type) as TodoType;
  const effectiveDifficulty = difficulty !== undefined ? difficulty : (currentTodo.difficulty ?? 1);

  const dbType =
    effectiveType === 'Daily'
      ? DbTodoType.DAILY
      : effectiveType === 'Upcoming'
        ? DbTodoType.UPCOMING
        : DbTodoType.MISSION;

  const existingTodos = await withRequestContext(async ({ todo }) => {
    return await todo.find({ type: dbType, user: userId });
  });

  const capacity = checkCostCapacity(existingTodos, effectiveDifficulty, id);
  if (!capacity.valid) {
    const errorKey =
      effectiveType === 'Daily'
        ? 'todos.dailyCapacityError'
        : effectiveType === 'Upcoming'
          ? 'todos.midtermCapacityError'
          : 'missions.capacityError';

    return {
      errors: {
        difficulty: [t(errorKey, { current: capacity.currentSum })],
      },
      inputs: { id, title, description, type: typeValue, deadline, difficulty: effectiveDifficulty, lifeAreaId },
      success: false,
    };
  }

  let updated;
  try {
    updated = await withRequestContext(async ({ todo }) => {
      return await todo.updateTodo(id, {
        title,
        description,
        type: typeValue,
        deadline,
        difficulty,
        isDone,
        lifeAreaId,
        actions,
        disciplines,
      }, userId);
    });
  } catch (error) {
    const fieldError = lifeAreaFieldError(error);
    if (fieldError) {
      return {
        errors: { lifeAreaId: [fieldError] },
        inputs: { id, title, description, type: typeValue, deadline, difficulty, lifeAreaId },
        success: false,
      };
    }
    throw error;
  }

  if (!updated) {
    return {
      errors: {
        general: ['Todo not found or not authorized to edit.'],
      },
      success: false,
    };
  }

  return {
    success: true,
    todoId: updated.id,
    inputs: {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      type: updated.type,
      deadline: updated.deadline,
      difficulty: updated.difficulty,
      lifeAreaId: updated.lifeArea?.id ?? null,
    },
  };
}

/**
 * Server Action mutation for deleting a Todo.
 * Reads the target id from the submitted form (hidden input).
 */
export async function deleteTodoMutation(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = Number(formData.get('id'));

  if (!id || Number.isNaN(id)) {
    return { success: false, error: 'Invalid todo id' };
  }

  const userId = await tryGetUserId();
  if (userId === null) {
    return { success: false, error: 'Your session has expired. Please sign in again.' };
  }

  return withRequestContext(async ({ todo }) => {
    const success = await todo.deleteTodo(id, userId);
    return success ? { success: true } : { success: false, error: 'Todo not found' };
  });
}

/**
 * Server Action mutation for restoring a deleted Todo from history.
 */
export async function restoreTodoMutation(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = Number(formData.get('id'));

  if (!id || Number.isNaN(id)) {
    return { success: false, error: 'Invalid todo id' };
  }

  const userId = await tryGetUserId();
  if (userId === null) {
    return { success: false, error: 'Your session has expired. Please sign in again.' };
  }

  return withRequestContext(async ({ todo }) => {
    const success = await todo.restoreTodo(id, userId);
    return success ? { success: true } : { success: false, error: 'Todo not found in history' };
  });
}

/**
 * Server Action mutation for permanently deleting a Todo from history.
 */
export async function hardDeleteTodoMutation(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = Number(formData.get('id'));

  if (!id || Number.isNaN(id)) {
    return { success: false, error: 'Invalid todo id' };
  }

  const userId = await tryGetUserId();
  if (userId === null) {
    return { success: false, error: 'Your session has expired. Please sign in again.' };
  }

  return withRequestContext(async ({ todo }) => {
    const success = await todo.hardDeleteTodo(id, userId);
    return success ? { success: true } : { success: false, error: 'Todo not found' };
  });
}

/**
 * Server Action mutation for toggling a Todo's isDone status.
 * Reads the target id from the submitted form (hidden input).
 */
export async function toggleTodoMutation(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = Number(formData.get('id'));

  if (!id || Number.isNaN(id)) {
    return { success: false, error: 'Invalid todo id' };
  }

  const userId = await tryGetUserId();
  if (userId === null) {
    return { success: false, error: 'Your session has expired. Please sign in again.' };
  }

  return withRequestContext(async ({ todo }) => {
    const updated = await todo.toggleDone(id, userId);

    return updated ? { success: true } : { success: false, error: 'Todo not found' };
  });
}

/**
 * Server Action mutation for toggling a mission action item's isDone status.
 * Reads the target id from the submitted form (hidden input).
 */
export async function toggleActionMutation(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const actionId = Number(formData.get('id'));

  if (!actionId || Number.isNaN(actionId)) {
    return { success: false, error: 'Invalid action id' };
  }

  const userId = await tryGetUserId();
  if (userId === null) {
    return { success: false, error: 'Your session has expired. Please sign in again.' };
  }

  return withRequestContext(async ({ todoAction }) => {
    const updated = await todoAction.toggleAction(actionId, userId);

    return updated
      ? { success: true }
      : { success: false, error: 'Action not found' };
  });
}

/**
 * Server Action mutation for recording a discipline's check-in history (I Do / I Don't Do).
 * Reads `id` from a hidden input and `isDone` from the pressed submit button.
 */
export async function recordDisciplineMutation(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const disciplineId = Number(formData.get('id'));

  if (!disciplineId || Number.isNaN(disciplineId)) {
    return { success: false, error: 'Invalid discipline id' };
  }

  const isDone = formData.get('isDone') !== 'false';

  const userId = await tryGetUserId();
  if (userId === null) {
    return { success: false, error: 'Your session has expired. Please sign in again.' };
  }

  return withRequestContext(async ({ todoDiscipline }) => {
    const history = await todoDiscipline.recordHistory(
      disciplineId,
      new Date().toISOString(),
      isDone,
      userId,
    );

    return history
      ? { success: true }
      : { success: false, error: 'Discipline not found' };
  });
}
