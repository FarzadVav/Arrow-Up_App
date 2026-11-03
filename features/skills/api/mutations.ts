'use server';

import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { tryGetUserId } from '@/features/auth/lib/utils';
import { lifeAreaFieldError } from '@/features/life-areas/lib/utils';
import { parseLifeAreaSlug } from '@/features/general/lib/utils';
import type { ActionResult } from '@/features/general/lib/types';
import {
  CreateSkillSchema,
  UpdateSkillSchema,
  CreateSkillTagSchema,
  UpdateSkillTagSchema,
} from '../lib/schemas';
import type { SkillFormState, SkillTagFormState } from '../lib/types';

function readLifeAreaId(formData: FormData): number | null {
  return parseLifeAreaSlug(String(formData.get('lifeAreaId') ?? '')) ?? null;
}

export async function createSkillMutation(
  prevState: SkillFormState,
  formData: FormData,
): Promise<SkillFormState> {
  const title = String(formData.get('title') ?? '').trim();
  const content = String(formData.get('content') ?? '');
  const lifeAreaId = parseLifeAreaSlug(String(formData.get('lifeAreaId') ?? '')) ?? null;
  const rawTag = formData.get('tagId') ?? formData.get('tag');
  const tagId = rawTag && !isNaN(Number(rawTag)) && Number(rawTag) > 0 ? Number(rawTag) : undefined;
  const tag = rawTag && String(rawTag).trim() && String(rawTag).trim() !== 'none' ? String(rawTag).trim() : null;

  const errors: NonNullable<SkillFormState>['errors'] = {};

  if (!lifeAreaId || lifeAreaId <= 0) {
    errors.lifeAreaId = ['Please select a life area.'];
  }
  if (!tagId && !tag) {
    errors.tag = ['Please select a tag.'];
  }

  const validation = CreateSkillSchema({
    title,
    content,
    lifeAreaId: lifeAreaId ?? 0,
    ...(tagId ? { tagId } : tag ? { tag } : {}),
  });

  if (validation instanceof type.errors || Object.keys(errors).length > 0) {
    if (validation instanceof type.errors) {
      for (const problem of validation) {
        const field = String(problem.path[0] ?? 'general') as
          | 'title'
          | 'content'
          | 'lifeAreaId'
          | 'tag'
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
        content,
        lifeAreaId,
        tagId: tagId ?? null,
        tag,
      },
      success: false,
    };
  }

  const userId = await tryGetUserId();
  if (userId === null) {
    return {
      errors: { general: ['Your session has expired. Please sign in again.'] },
      inputs: { title, content, lifeAreaId, tagId: tagId ?? null, tag },
      success: false,
    };
  }

  const inputs = { title, content, lifeAreaId, tagId: tagId ?? null, tag };

  try {
    const created = await withRequestContext(async ({ skill }) => {
      return await skill.createSkill({ title, content, lifeAreaId: lifeAreaId!, tagId, tag: tag ?? undefined }, userId);
    });

    return {
      success: true,
      skillId: created.id,
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

export async function updateSkillMutation(
  prevState: SkillFormState,
  formData: FormData,
): Promise<SkillFormState> {
  const idRaw = formData.get('id');
  const id = idRaw ? Number(idRaw) : NaN;
  const title = String(formData.get('title') ?? '').trim();
  const content = String(formData.get('content') ?? '');
  const lifeAreaId = parseLifeAreaSlug(String(formData.get('lifeAreaId') ?? '')) ?? null;
  const rawTag = formData.get('tagId') ?? formData.get('tag');
  const tagId = rawTag && !isNaN(Number(rawTag)) && Number(rawTag) > 0 ? Number(rawTag) : undefined;
  const tag = rawTag && String(rawTag).trim() && String(rawTag).trim() !== 'none' ? String(rawTag).trim() : null;

  if (!id || Number.isNaN(id)) {
    return {
      errors: { general: ['Invalid skill id'] },
      success: false,
    };
  }

  const errors: NonNullable<SkillFormState>['errors'] = {};

  if (!lifeAreaId || lifeAreaId <= 0) {
    errors.lifeAreaId = ['Please select a life area.'];
  }
  if (!tagId && !tag) {
    errors.tag = ['Please select a tag.'];
  }

  const validation = UpdateSkillSchema({
    id,
    title: title || undefined,
    content,
    lifeAreaId: lifeAreaId ?? undefined,
    ...(tagId ? { tagId } : tag ? { tag } : {}),
  });

  if (validation instanceof type.errors || Object.keys(errors).length > 0) {
    if (validation instanceof type.errors) {
      for (const problem of validation) {
        const field = String(problem.path[0] ?? 'general') as
          | 'title'
          | 'content'
          | 'lifeAreaId'
          | 'tag'
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
        content,
        lifeAreaId,
        tagId: tagId ?? null,
        tag,
      },
      success: false,
    };
  }

  const userId = await tryGetUserId();
  if (userId === null) {
    return {
      errors: { general: ['Your session has expired. Please sign in again.'] },
      inputs: { title, content, lifeAreaId, tagId: tagId ?? null, tag },
      success: false,
    };
  }

  const inputs = { title, content, lifeAreaId, tagId: tagId ?? null, tag };

  try {
    const updated = await withRequestContext(async ({ skill }) => {
      return await skill.updateSkill(
        id,
        {
          ...(title ? { title } : {}),
          content,
          lifeAreaId: lifeAreaId ?? undefined,
          tagId,
          tag: tag ?? undefined,
        },
        userId,
      );
    });

    if (!updated) {
      return {
        errors: { general: ['Skill not found or unauthorized'] },
        inputs,
        success: false,
      };
    }

    return {
      success: true,
      skillId: updated.id,
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

export async function deleteSkillMutation(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = Number(formData.get('id'));

  if (!id || Number.isNaN(id)) {
    return { success: false, error: 'Invalid skill id' };
  }

  const userId = await tryGetUserId();
  if (userId === null) {
    return { success: false, error: 'Your session has expired. Please sign in again.' };
  }

  try {
    const success = await withRequestContext(async ({ skill }) => {
      return await skill.deleteSkill(id, userId);
    });
    return success ? { success: true } : { success: false, error: 'Skill not found' };
  } catch (error) {
    console.error('Failed to delete skill:', error);
    return { success: false, error: 'Failed to delete skill' };
  }
}

export async function restoreSkillMutation(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = Number(formData.get('id'));

  if (!id || Number.isNaN(id)) {
    return { success: false, error: 'Invalid skill id' };
  }

  const userId = await tryGetUserId();
  if (userId === null) {
    return { success: false, error: 'Your session has expired. Please sign in again.' };
  }

  try {
    const success = await withRequestContext(async ({ skill }) => {
      return await skill.restoreSkill(id, userId);
    });
    return success ? { success: true } : { success: false, error: 'Skill not found in history' };
  } catch (error) {
    console.error('Failed to restore skill:', error);
    return { success: false, error: 'Failed to restore skill' };
  }
}

export async function hardDeleteSkillMutation(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = Number(formData.get('id'));

  if (!id || Number.isNaN(id)) {
    return { success: false, error: 'Invalid skill id' };
  }

  const userId = await tryGetUserId();
  if (userId === null) {
    return { success: false, error: 'Your session has expired. Please sign in again.' };
  }

  try {
    const success = await withRequestContext(async ({ skill }) => {
      return await skill.hardDeleteSkill(id, userId);
    });
    return success ? { success: true } : { success: false, error: 'Skill not found' };
  } catch (error) {
    console.error('Failed to hard delete skill:', error);
    return { success: false, error: 'Failed to delete skill' };
  }
}

export async function createSkillTagMutation(
  prevState: SkillTagFormState,
  formData: FormData,
): Promise<SkillTagFormState> {
  const title = String(formData.get('title') ?? '').trim();
  const lifeAreaId = readLifeAreaId(formData);

  const errors: NonNullable<SkillTagFormState>['errors'] = {};

  if (!lifeAreaId || lifeAreaId <= 0) {
    errors.lifeAreaId = ['Please select a life area.'];
  }

  const validation = CreateSkillTagSchema({ title, lifeAreaId: lifeAreaId ?? 0 });

  if (validation instanceof type.errors || Object.keys(errors).length > 0) {
    if (validation instanceof type.errors) {
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
    const tag = await withRequestContext(async ({ skillTag }) => {
      return await skillTag.createTag({ title, lifeAreaId: lifeAreaId! }, userId);
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

export async function updateSkillTagMutation(
  prevState: SkillTagFormState,
  formData: FormData,
): Promise<SkillTagFormState> {
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

  if (lifeAreaId === null) {
    return {
      errors: { lifeAreaId: ['Please select a life area.'] },
      inputs: { id, ...(title !== undefined ? { title } : {}) },
      success: false,
    };
  }

  const validation = UpdateSkillTagSchema({
    id,
    ...(title !== undefined ? { title } : {}),
    ...(lifeAreaId !== undefined ? { lifeAreaId } : {}),
  });

  if (validation instanceof type.errors) {
    const errors: NonNullable<SkillTagFormState>['errors'] = {};

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
    const updated = await withRequestContext(async ({ skillTag }) => {
      return await skillTag.updateTag(
        id,
        {
          id,
          ...(title !== undefined ? { title } : {}),
          ...(lifeAreaId !== undefined ? { lifeAreaId: lifeAreaId! } : {}),
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
          ...(lifeAreaId !== undefined ? { lifeAreaId: lifeAreaId! } : {}),
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
          ...(lifeAreaId !== undefined ? { lifeAreaId: lifeAreaId! } : {}),
        },
        success: false,
      };
    }
    throw error;
  }
}

export async function deleteSkillTagMutation(
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

  return withRequestContext(async ({ skillTag }) => {
    const success = await skillTag.deleteTag(id, userId);
    return success ? { success: true } : { success: false, error: 'Tag not found' };
  });
}
