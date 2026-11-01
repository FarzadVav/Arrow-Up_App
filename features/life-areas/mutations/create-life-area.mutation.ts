'use server';

import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { tryGetUserId } from '@/features/auth/lib/actor';
import { getTranslations } from '@/features/general/lib/i18n/server';
import { checkCostCapacity } from '@/features/general/lib/costCapacity';
import { CreateLifeAreaSchema, type LifeAreaFormState } from '../types';

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
