'use server';

import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { TodoType as DbTodoType } from '@/db/entities/enums';
import { tryGetUserId } from '@/features/auth/lib/actor';
import { lifeAreaFieldError } from '@/features/life-areas/lib/lifeAreaFieldError';
import { getTranslations } from '@/features/general/lib/i18n/server';
import { checkCostCapacity } from '@/features/general/lib/costCapacity';
import { CreateTodoSchema, type TodoFormState, type TodoType, type CreateTodoData } from '../types';

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

  // Enforce required deadline for Mission todos
  if (typeValue === 'Mission' && !deadline) {
    return {
      errors: {
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

  // Validate form inputs using ArkType CreateTodoSchema
  const validation = CreateTodoSchema({
    title,
    ...(description ? { description } : {}),
    type: typeValue,
    deadline,
    difficulty,
    ...(lifeAreaId !== undefined ? { lifeAreaId } : {}),
    ...(actions && actions.length > 0 ? { actions } : {}),
    ...(disciplines && disciplines.length > 0 ? { disciplines } : {}),
  });

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

  // Validate cost capacity for the selected category (Daily, Upcoming, or Mission)
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
          lifeAreaId,
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
