'use server';

import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { tryGetUserId } from '@/features/auth/lib/utils';
import { getTranslations } from '@/features/general/lib/i18n/server';
import { checkCostCapacity } from '@/features/general/lib/utils';
import type { ActionResult } from '@/features/general/lib/types';
import { CreateLifeAreaSchema, UpdateLifeAreaSchema } from '../lib/schemas';
import type { LifeAreaFormState } from '../lib/types';

/**
 * Server Action mutation for creating a Life Area from a client-side form.
 */
export async function createLifeAreaMutation(
  prevState: LifeAreaFormState,
  formData: FormData,
): Promise<LifeAreaFormState> {
  const title = String(formData.get('title') ?? '').trim();
  const vision = String(formData.get('vision') ?? '');
  const activeRaw = formData.get('active');
  const active = activeRaw !== null ? activeRaw === 'true' || activeRaw === 'on' : true;
  const difficultyRaw = formData.get('difficulty');
  const difficulty = difficultyRaw ? Number(difficultyRaw) : 1;

  const validation = CreateLifeAreaSchema({ title, vision, active, difficulty });

  if (validation instanceof type.errors) {
    const errors: NonNullable<LifeAreaFormState>['errors'] = {};

    for (const problem of validation) {
      const field = String(problem.path[0] ?? 'general') as
        | 'title'
        | 'vision'
        | 'active'
        | 'difficulty'
        | 'general';

      if (!errors[field]) {
        errors[field] = [];
      }
      errors[field]?.push(problem.message);
    }

    return {
      errors,
      inputs: { title, vision, active, difficulty },
      success: false,
    };
  }

  const userId = await tryGetUserId();
  if (userId === null) {
    return {
      errors: { general: ['Your session has expired. Please sign in again.'] },
      inputs: { title, vision, active, difficulty },
      success: false,
    };
  }

  const { t } = await getTranslations();

  // Validate cost capacity across active life areas
  if (active) {
    const existingAreas = await withRequestContext(async ({ lifeArea }) => {
      return await lifeArea.findAllLifeAreas(userId);
    });
    const activeAreas = existingAreas.filter((a) => a.active !== false);
    const capacity = checkCostCapacity(activeAreas, difficulty);

    if (!capacity.valid) {
      return {
        errors: {
          difficulty: [
            t('lifeAreas.capacityError', { current: capacity.currentSum }),
          ],
        },
        inputs: { title, vision, active, difficulty },
        success: false,
      };
    }
  }

  const created = await withRequestContext(async ({ lifeArea }) => {
    return await lifeArea.createLifeArea({ title, vision, active, difficulty }, userId);
  });

  return {
    success: true,
    lifeAreaId: created.id,
    inputs: { title, vision, active, difficulty },
  };
}

/**
 * Server Action mutation for updating an existing Life Area from a client-side form.
 */
export async function updateLifeAreaMutation(
  prevState: LifeAreaFormState,
  formData: FormData,
): Promise<LifeAreaFormState> {
  const idRaw = formData.get('id') || formData.get('editId');
  const id = Number(idRaw);
  const title = String(formData.get('title') ?? '').trim();
  const vision = String(formData.get('vision') ?? '');
  const activeRaw = formData.get('active');
  const active = activeRaw !== null ? activeRaw === 'true' || activeRaw === 'on' : undefined;
  const difficultyRaw = formData.get('difficulty');
  const difficulty = difficultyRaw !== null && difficultyRaw !== undefined && difficultyRaw !== ''
    ? Number(difficultyRaw)
    : undefined;

  if (!id || Number.isNaN(id)) {
    return {
      errors: { general: ['Invalid or missing life area ID.'] },
      inputs: { title, vision, ...(active !== undefined ? { active } : {}), ...(difficulty !== undefined ? { difficulty } : {}) },
      success: false,
    };
  }

  const validation = UpdateLifeAreaSchema({
    id,
    title,
    vision,
    ...(active !== undefined ? { active } : {}),
    ...(difficulty !== undefined ? { difficulty } : {}),
  });

  if (validation instanceof type.errors) {
    const errors: NonNullable<LifeAreaFormState>['errors'] = {};

    for (const problem of validation) {
      const field = String(problem.path[0] ?? 'general') as
        | 'title'
        | 'vision'
        | 'active'
        | 'difficulty'
        | 'general';

      if (!errors[field]) {
        errors[field] = [];
      }
      errors[field]?.push(problem.message);
    }

    return {
      errors,
      inputs: { title, vision, ...(active !== undefined ? { active } : {}), ...(difficulty !== undefined ? { difficulty } : {}) },
      success: false,
    };
  }

  const userId = await tryGetUserId();
  if (userId === null) {
    return {
      errors: { general: ['Your session has expired. Please sign in again.'] },
      inputs: { title, vision, ...(active !== undefined ? { active } : {}), ...(difficulty !== undefined ? { difficulty } : {}) },
      success: false,
    };
  }

  const { t } = await getTranslations();

  // Validate cost capacity across active life areas if this area will be active
  const existingAreas = await withRequestContext(async ({ lifeArea }) => {
    return await lifeArea.findAllLifeAreas(userId);
  });
  const currentArea = existingAreas.find((a) => a.id === id);
  const targetActive = active !== undefined ? active : (currentArea?.active ?? true);
  const targetDifficulty = difficulty !== undefined ? difficulty : (currentArea?.difficulty ?? 1);

  if (targetActive) {
    const activeAreas = existingAreas.filter((a) => a.active !== false);
    const capacity = checkCostCapacity(activeAreas, targetDifficulty, id);

    if (!capacity.valid) {
      return {
        errors: {
          difficulty: [
            t('lifeAreas.capacityError', { current: capacity.currentSum }),
          ],
        },
        inputs: { title, vision, ...(active !== undefined ? { active } : {}), difficulty: targetDifficulty },
        success: false,
      };
    }
  }

  const updated = await withRequestContext(async ({ lifeArea }) => {
    return await lifeArea.updateLifeArea(
      id,
      {
        title,
        vision,
        ...(active !== undefined ? { active } : {}),
        ...(difficulty !== undefined ? { difficulty } : {}),
      },
      userId,
    );
  });

  if (!updated) {
    return {
      errors: { general: ['Life area not found or unauthorized.'] },
      inputs: { title, vision, ...(active !== undefined ? { active } : {}), ...(difficulty !== undefined ? { difficulty } : {}) },
      success: false,
    };
  }

  return {
    success: true,
    lifeAreaId: updated.id,
    inputs: { title, vision, active: updated.active, difficulty: updated.difficulty },
  };
}

/**
 * Server Action mutation for deleting a Life Area.
 * Reads the target id from the submitted form (hidden input).
 */
export async function deleteLifeAreaMutation(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = Number(formData.get('id'));

  if (!id || Number.isNaN(id)) {
    return { success: false, error: 'Invalid life area id' };
  }

  const userId = await tryGetUserId();
  if (userId === null) {
    return { success: false, error: 'Your session has expired. Please sign in again.' };
  }

  return withRequestContext(async ({ lifeArea }) => {
    const success = await lifeArea.deleteLifeArea(id, userId);
    return success
      ? { success: true }
      : { success: false, error: 'Life area not found' };
  });
}
