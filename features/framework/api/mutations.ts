'use server';

import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { tryGetUserId } from '@/features/auth/lib/utils';
import { lifeAreaFieldError } from '@/features/life-areas/lib/utils';
import { parseLifeAreaSlug } from '@/features/general/lib/utils';
import type { ActionResult } from '@/features/general/lib/types';
import {
  CreateFrameworkSchema,
  UpdateFrameworkSchema,
  CreateFrameworkTagSchema,
  UpdateFrameworkTagSchema,
} from '../lib/schemas';
import type { FrameworkFormState, FrameworkTagFormState } from '../lib/types';

function readLifeAreaId(formData: FormData): number | null {
  return parseLifeAreaSlug(String(formData.get('lifeAreaId') ?? '')) ?? null;
}

export async function createFrameworkMutation(
  prevState: FrameworkFormState,
  formData: FormData,
): Promise<FrameworkFormState> {
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const lifeAreaId = parseLifeAreaSlug(String(formData.get('lifeAreaId') ?? '')) ?? null;
  const rawTag = formData.get('tag');
  const tag = rawTag && String(rawTag).trim() ? String(rawTag).trim() : null;

  const validation = CreateFrameworkSchema({
    title,
    ...(description ? { description } : {}),
    lifeAreaId,
    tag,
  });

  if (validation instanceof type.errors) {
    const errors: NonNullable<FrameworkFormState>['errors'] = {};

    for (const problem of validation) {
      const field = String(problem.path[0] ?? 'general') as
        | 'title'
        | 'description'
        | 'lifeAreaId'
        | 'tag'
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
        lifeAreaId,
        tag,
      },
      success: false,
    };
  }

  const userId = await tryGetUserId();
  if (userId === null) {
    return {
      errors: { general: ['Your session has expired. Please sign in again.'] },
      inputs: { title, description, lifeAreaId, tag },
      success: false,
    };
  }

  const inputs = { title, description, lifeAreaId, tag };

  try {
    const created = await withRequestContext(async ({ framework }) => {
      return await framework.createFramework({ title, description, lifeAreaId, tag }, userId);
    });

    return {
      success: true,
      frameworkId: created.id,
      inputs,
    };
  } catch (error) {
    const fieldError = lifeAreaFieldError(error);
    if (fieldError) {
      return { errors: { lifeAreaId: [fieldError] }, inputs, success: false };
    }
    throw error;
  }
}

export async function updateFrameworkMutation(
  prevState: FrameworkFormState,
  formData: FormData,
): Promise<FrameworkFormState> {
  const idRaw = formData.get('id');
  const id = idRaw ? Number(idRaw) : NaN;
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const lifeAreaId = parseLifeAreaSlug(String(formData.get('lifeAreaId') ?? '')) ?? null;
  const rawTag = formData.get('tag');
  const tag = rawTag && String(rawTag).trim() ? String(rawTag).trim() : null;

  if (!id || Number.isNaN(id)) {
    return {
      errors: { general: ['Invalid framework id'] },
      success: false,
    };
  }

  const validation = UpdateFrameworkSchema({
    id,
    title: title || undefined,
    ...(description ? { description } : {}),
    lifeAreaId,
    tag,
  });

  if (validation instanceof type.errors) {
    const errors: NonNullable<FrameworkFormState>['errors'] = {};

    for (const problem of validation) {
      const field = String(problem.path[0] ?? 'general') as
        | 'title'
        | 'description'
        | 'lifeAreaId'
        | 'tag'
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
        lifeAreaId,
        tag,
      },
      success: false,
    };
  }

  const userId = await tryGetUserId();
  if (userId === null) {
    return {
      errors: { general: ['Your session has expired. Please sign in again.'] },
      inputs: { title, description, lifeAreaId, tag },
      success: false,
    };
  }

  const inputs = { title, description, lifeAreaId, tag };

  try {
    const updated = await withRequestContext(async ({ framework }) => {
      return await framework.updateFramework(
        id,
        {
          ...(title ? { title } : {}),
          ...(description ? { description } : {}),
          lifeAreaId,
          tag,
        },
        userId,
      );
    });

    if (!updated) {
      return {
        errors: { general: ['Framework not found or unauthorized'] },
        inputs,
        success: false,
      };
    }

    return {
      success: true,
      frameworkId: updated.id,
      inputs,
    };
  } catch (error) {
    const fieldError = lifeAreaFieldError(error);
    if (fieldError) {
      return { errors: { lifeAreaId: [fieldError] }, inputs, success: false };
    }
    throw error;
  }
}

export async function deleteFrameworkMutation(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = Number(formData.get('id'));

  if (!id || Number.isNaN(id)) {
    return { success: false, error: 'Invalid framework id' };
  }

  const userId = await tryGetUserId();
  if (userId === null) {
    return { success: false, error: 'Your session has expired. Please sign in again.' };
  }

  try {
    const success = await withRequestContext(async ({ framework }) => {
      return await framework.deleteFramework(id, userId);
    });
    return success ? { success: true } : { success: false, error: 'Framework not found' };
  } catch (error) {
    console.error('Failed to delete framework:', error);
    return { success: false, error: 'Failed to delete framework' };
  }
}

export async function recordFrameworkMutation(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = Number(formData.get('id'));

  if (!id || Number.isNaN(id)) {
    return { success: false, error: 'Invalid framework id' };
  }

  const isDone = formData.get('isDone') !== 'false';
  const date = new Date().toISOString();

  const userId = await tryGetUserId();
  if (userId === null) {
    return { success: false, error: 'Your session has expired. Please sign in again.' };
  }

  try {
    const history = await withRequestContext(async ({ framework }) => {
      return await framework.recordHistory(id, date, isDone, userId);
    });

    return history ? { success: true } : { success: false, error: 'Framework not found' };
  } catch (error) {
    console.error('Failed to record framework:', error);
    return { success: false, error: 'Failed to record framework' };
  }
}

export async function createFrameworkTagMutation(
  prevState: FrameworkTagFormState,
  formData: FormData,
): Promise<FrameworkTagFormState> {
  const title = String(formData.get('title') ?? '').trim();
  const lifeAreaId = readLifeAreaId(formData);

  const validation = CreateFrameworkTagSchema({ title, lifeAreaId });

  if (validation instanceof type.errors) {
    const errors: NonNullable<FrameworkTagFormState>['errors'] = {};

    for (const problem of validation) {
      const field = String(problem.path[0] ?? 'general') as
        | 'title'
        | 'lifeAreaId'
        | 'general';

      if (!errors[field]) {
        errors[field] = [];
      }
      errors[field]?.push(problem.message);
    }

    return { errors, inputs: { title, lifeAreaId }, success: false };
  }

  const userId = await tryGetUserId();
  if (userId === null) {
    return {
      errors: { general: ['Your session has expired. Please sign in again.'] },
      inputs: { title, lifeAreaId },
      success: false,
    };
  }

  try {
    const tag = await withRequestContext(async ({ frameworkTag }) => {
      return await frameworkTag.createTag({ title, lifeAreaId }, userId);
    });

    return {
      success: true,
      tagId: tag.id,
      inputs: { title: tag.title, lifeAreaId },
    };
  } catch (error) {
    const fieldError = lifeAreaFieldError(error);
    if (fieldError) {
      return {
        errors: { lifeAreaId: [fieldError] },
        inputs: { title, lifeAreaId },
        success: false,
      };
    }
    throw error;
  }
}

export async function updateFrameworkTagMutation(
  prevState: FrameworkTagFormState,
  formData: FormData,
): Promise<FrameworkTagFormState> {
  const id = Number(formData.get('id') ?? formData.get('editId'));

  if (!id || Number.isNaN(id)) {
    return { errors: { general: ['Invalid or missing tag ID.'] }, success: false };
  }

  const title = formData.has('title')
    ? String(formData.get('title') ?? '').trim()
    : undefined;
  const lifeAreaId = formData.has('lifeAreaId')
    ? readLifeAreaId(formData)
    : undefined;

  const validation = UpdateFrameworkTagSchema({
    id,
    ...(title !== undefined ? { title } : {}),
    ...(lifeAreaId !== undefined ? { lifeAreaId } : {}),
  });

  if (validation instanceof type.errors) {
    const errors: NonNullable<FrameworkTagFormState>['errors'] = {};

    for (const problem of validation) {
      const field = String(problem.path[0] ?? 'general') as
        | 'title'
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
        ...(title !== undefined ? { title } : {}),
        ...(lifeAreaId !== undefined ? { lifeAreaId } : {}),
      },
      success: false,
    };
  }

  const userId = await tryGetUserId();
  if (userId === null) {
    return {
      errors: { general: ['Your session has expired. Please sign in again.'] },
      inputs: {
        id,
        ...(title !== undefined ? { title } : {}),
        ...(lifeAreaId !== undefined ? { lifeAreaId } : {}),
      },
      success: false,
    };
  }

  try {
    const updated = await withRequestContext(async ({ frameworkTag }) => {
      return await frameworkTag.updateTag(
        id,
        {
          id,
          ...(title !== undefined ? { title } : {}),
          ...(lifeAreaId !== undefined ? { lifeAreaId } : {}),
        },
        userId,
      );
    });

    if (!updated) {
      return {
        errors: { general: ['Tag not found or unauthorized.'] },
        inputs: {
          id,
          ...(title !== undefined ? { title } : {}),
          ...(lifeAreaId !== undefined ? { lifeAreaId } : {}),
        },
        success: false,
      };
    }

    return {
      success: true,
      tagId: updated.id,
      inputs: {
        id: updated.id,
        title: updated.title,
        lifeAreaId: updated.lifeArea?.id ?? null,
      },
    };
  } catch (error) {
    const fieldError = lifeAreaFieldError(error);
    if (fieldError) {
      return {
        errors: { lifeAreaId: [fieldError] },
        inputs: {
          id,
          ...(title !== undefined ? { title } : {}),
          ...(lifeAreaId !== undefined ? { lifeAreaId } : {}),
        },
        success: false,
      };
    }
    throw error;
  }
}

export async function deleteFrameworkTagMutation(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = Number(formData.get('id'));

  if (!id || Number.isNaN(id)) {
    return { success: false, error: 'Invalid tag id' };
  }

  const userId = await tryGetUserId();
  if (userId === null) {
    return {
      success: false,
      error: 'Your session has expired. Please sign in again.',
    };
  }

  return withRequestContext(async ({ frameworkTag }) => {
    const success = await frameworkTag.deleteTag(id, userId);
    return success ? { success: true } : { success: false, error: 'Tag not found' };
  });
}
