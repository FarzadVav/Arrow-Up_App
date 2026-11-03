'use server';

import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { tryGetUserId } from '@/features/auth/lib/utils';
import type { ActionResult } from '@/features/general/lib/types';
import {
  CreateJournalSchema,
  UpdateJournalSchema,
  type JournalFormState,
} from '../lib/types';

/**
 * Server Action mutation for creating a new Journal entry.
 */
export async function createJournalMutation(
  prevState: JournalFormState,
  formData: FormData,
): Promise<JournalFormState> {
  const title = String(formData.get('title') ?? '').trim();
  const content = String(formData.get('content') ?? '').trim();
  const categoryRaw = formData.get('category') || formData.get('type') || formData.get('categoryId');
  const category = categoryRaw && String(categoryRaw).trim() !== 'none' ? String(categoryRaw).trim() : null;
  const tagRaw = formData.get('tag') || formData.get('tagId');
  const tag = tagRaw && String(tagRaw).trim() && String(tagRaw).trim() !== 'none' ? String(tagRaw).trim() : null;

  const errors: NonNullable<JournalFormState>['errors'] = {};

  if (!category) {
    errors.type = ['Please select a category.'];
  }
  if (!tag) {
    errors.tag = ['Please select a tag.'];
  }

  // Validate form inputs using ArkType CreateJournalSchema
  const validation = CreateJournalSchema({
    title,
    content,
    ...(category ? { type: category, category } : {}),
    ...(tag ? { tag } : {}),
  });

  if (validation instanceof type.errors || Object.keys(errors).length > 0) {
    if (validation instanceof type.errors) {
      for (const problem of validation) {
        const field = String(problem.path[0] ?? 'general') as
          | 'title'
          | 'content'
          | 'type'
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
        type: category ?? undefined,
        category: category ?? undefined,
        tag: tag ?? undefined,
      },
      success: false,
    };
  }

  const userId = await tryGetUserId();
  if (userId === null) {
    return {
      errors: { general: ['Your session has expired. Please sign in again.'] },
      inputs: {
        title,
        content,
        type: category ?? undefined,
        category: category ?? undefined,
        tag: tag ?? undefined,
      },
      success: false,
    };
  }

  const created = await withRequestContext(async ({ journal }) => {
    return await journal.createJournal(
      {
        title,
        content,
        category: category!,
        tag: tag!,
      },
      userId,
    );
  });

  return {
    success: true,
    journalId: created.id,
    inputs: {
      title,
      content,
      type: category ?? undefined,
      category: category ?? undefined,
      tag: tag ?? undefined,
    },
  };
}

/**
 * Server Action mutation for updating an existing Journal entry.
 */
export async function updateJournalMutation(
  prevState: JournalFormState,
  formData: FormData,
): Promise<JournalFormState> {
  const idRaw = formData.get('id') || formData.get('editId');
  const id = Number(idRaw);

  if (!id || isNaN(id)) {
    return {
      errors: {
        general: ['Invalid or missing journal ID.'],
      },
      success: false,
    };
  }

  const title = formData.has('title') ? String(formData.get('title') ?? '').trim() : undefined;
  const content = formData.has('content') ? String(formData.get('content') ?? '').trim() : undefined;
  const categoryRaw = formData.get('category') || formData.get('type') || formData.get('categoryId');
  const category = categoryRaw !== null && categoryRaw !== undefined ? String(categoryRaw).trim() : undefined;
  const tagRaw = formData.get('tag') || formData.get('tagId');
  const tag = tagRaw !== null && tagRaw !== undefined ? String(tagRaw).trim() : undefined;

  const errors: NonNullable<JournalFormState>['errors'] = {};

  if (categoryRaw !== null && categoryRaw !== undefined) {
    if (!category || category === 'none') {
      errors.type = ['Please select a category.'];
    }
  }

  if (tagRaw !== null && tagRaw !== undefined) {
    if (!tag || tag === 'none') {
      errors.tag = ['Please select a tag.'];
    }
  }

  const updatePayload = {
    id,
    ...(title !== undefined ? { title } : {}),
    ...(content !== undefined ? { content } : {}),
    ...(category && category !== 'none' ? { category, type: category } : {}),
    ...(tag && tag !== 'none' ? { tag } : {}),
  };

  const validation = UpdateJournalSchema(updatePayload);
  if (validation instanceof type.errors || Object.keys(errors).length > 0) {
    if (validation instanceof type.errors) {
      for (const problem of validation) {
        const field = String(problem.path[0] ?? 'general') as
          | 'title'
          | 'content'
          | 'type'
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
        id,
        title,
        content,
        type: category,
        tag,
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
        title,
        content,
        type: category,
        tag,
      },
      success: false,
    };
  }

  const updated = await withRequestContext(async ({ journal }) => {
    return await journal.updateJournal(
      id,
      {
        title,
        content,
        category,
        tag,
      },
      userId,
    );
  });

  if (!updated) {
    return {
      errors: {
        general: ['Journal entry not found or unauthorized.'],
      },
      success: false,
    };
  }

  return {
    success: true,
    journalId: id,
    inputs: {
      id,
      title,
      content,
      type: category,
      tag,
    },
  };
}

/**
 * Server Action mutation for deleting a Journal entry.
 */
export async function deleteJournalMutation(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = Number(formData.get('id'));

  if (!id || Number.isNaN(id)) {
    return { success: false, error: 'Invalid journal id' };
  }

  const userId = await tryGetUserId();
  if (userId === null) {
    return { success: false, error: 'Your session has expired. Please sign in again.' };
  }

  return withRequestContext(async ({ journal }) => {
    const success = await journal.deleteJournal(id, userId);
    return success ? { success: true } : { success: false, error: 'Journal not found' };
  });
}

/**
 * Server Action mutation for restoring a deleted Journal from history.
 */
export async function restoreJournalMutation(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = Number(formData.get('id'));

  if (!id || Number.isNaN(id)) {
    return { success: false, error: 'Invalid journal id' };
  }

  const userId = await tryGetUserId();
  if (userId === null) {
    return { success: false, error: 'Your session has expired. Please sign in again.' };
  }

  return withRequestContext(async ({ journal }) => {
    const success = await journal.restoreJournal(id, userId);
    return success ? { success: true } : { success: false, error: 'Journal not found in history' };
  });
}

/**
 * Server Action mutation for permanently deleting a Journal from history.
 */
export async function hardDeleteJournalMutation(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = Number(formData.get('id'));

  if (!id || Number.isNaN(id)) {
    return { success: false, error: 'Invalid journal id' };
  }

  const userId = await tryGetUserId();
  if (userId === null) {
    return { success: false, error: 'Your session has expired. Please sign in again.' };
  }

  return withRequestContext(async ({ journal }) => {
    const success = await journal.hardDeleteJournal(id, userId);
    return success ? { success: true } : { success: false, error: 'Journal not found' };
  });
}

/**
 * Tag CRUD is disabled because journal tags are static system definitions.
 */
export async function createJournalTagMutation(): Promise<{ success: false; errors: { general: string[] } }> {
  return {
    success: false,
    errors: { general: ['Journal tags are static and cannot be created.'] },
  };
}

export async function updateJournalTagMutation(): Promise<{ success: false; errors: { general: string[] } }> {
  return {
    success: false,
    errors: { general: ['Journal tags are static and cannot be modified.'] },
  };
}

export async function deleteJournalTagMutation(): Promise<ActionResult> {
  return {
    success: false,
    error: 'Journal tags are static and cannot be deleted.',
  };
}
