'use server';

import { type } from 'arktype';
import { withRequestContext } from '@/db';
import { tryGetUserId } from '@/features/auth/lib/utils';
import type { ActionResult } from '@/features/general/lib/types';
import {
  CreateJournalSchema,
  UpdateJournalSchema,
  CreateJournalTagSchema,
  UpdateJournalTagSchema,
  type JournalFormState,
  type JournalTagFormState,
  type JournalCategory,
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
  const category = String(formData.get('type') ?? 'Logs') as JournalCategory;
  const rawTag = formData.get('tag');
  const tag = rawTag && String(rawTag).trim() ? String(rawTag).trim() : null;

  // Validate form inputs using ArkType CreateJournalSchema
  const validation = CreateJournalSchema({
    title,
    content,
    type: category,
    tag,
  });

  if (validation instanceof type.errors) {
    const errors: NonNullable<JournalFormState>['errors'] = {};

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

    return {
      errors,
      inputs: {
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
        title,
        content,
        type: category,
        tag,
      },
      success: false,
    };
  }

  const created = await withRequestContext(async ({ journal }) => {
    return await journal.createJournal(
      {
        title,
        content,
        type: category,
        tag,
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
      type: category,
      tag,
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
  const category = formData.has('type') ? (String(formData.get('type')) as JournalCategory) : undefined;
  const tag = formData.has('tag')
    ? (formData.get('tag') ? String(formData.get('tag')).trim() : null)
    : undefined;

  const updatePayload = {
    id,
    ...(title !== undefined ? { title } : {}),
    ...(content !== undefined ? { content } : {}),
    ...(category !== undefined ? { type: category } : {}),
    ...(tag !== undefined ? { tag } : {}),
  };

  const validation = UpdateJournalSchema(updatePayload);
  if (validation instanceof type.errors) {
    const errors: NonNullable<JournalFormState>['errors'] = {};

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
        type: category,
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
 * Server Action mutation for creating a new Journal tag.
 */
export async function createJournalTagMutation(
  prevState: JournalTagFormState,
  formData: FormData,
): Promise<JournalTagFormState> {
  const title = String(formData.get('title') ?? '').trim();
  const category = String(formData.get('category') ?? 'Logs') as JournalCategory;

  const validation = CreateJournalTagSchema({
    title,
    category,
  });

  if (validation instanceof type.errors) {
    const errors: NonNullable<JournalTagFormState>['errors'] = {};

    for (const problem of validation) {
      const field = String(problem.path[0] ?? 'general') as
        | 'title'
        | 'category'
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
        category,
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
        category,
      },
      success: false,
    };
  }

  const created = await withRequestContext(async ({ journalTag }) => {
    return await journalTag.createTag(
      {
        title,
        category,
      },
      userId,
    );
  });

  return {
    success: true,
    tagId: created.id,
    inputs: {
      title,
      category,
    },
  };
}

/**
 * Server Action mutation for updating a Journal tag.
 */
export async function updateJournalTagMutation(
  prevState: JournalTagFormState,
  formData: FormData,
): Promise<JournalTagFormState> {
  const idRaw = formData.get('id') || formData.get('editId');
  const id = Number(idRaw);

  if (!id || isNaN(id)) {
    return {
      errors: {
        general: ['Invalid or missing tag ID.'],
      },
      success: false,
    };
  }

  const title = formData.has('title')
    ? String(formData.get('title') ?? '').trim()
    : undefined;
  const category = formData.has('category')
    ? (String(formData.get('category')) as JournalCategory)
    : undefined;

  const updatePayload = {
    id,
    ...(title !== undefined ? { title } : {}),
    ...(category !== undefined ? { category } : {}),
  };

  const validation = UpdateJournalTagSchema(updatePayload);
  if (validation instanceof type.errors) {
    const errors: NonNullable<JournalTagFormState>['errors'] = {};

    for (const problem of validation) {
      const field = String(problem.path[0] ?? 'general') as
        | 'title'
        | 'category'
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
        category,
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
        category,
      },
      success: false,
    };
  }

  const updated = await withRequestContext(async ({ journalTag }) => {
    return await journalTag.updateTag(
      id,
      {
        id,
        title,
        category,
      },
      userId,
    );
  });

  if (!updated) {
    return {
      errors: {
        general: ['Tag not found or unauthorized.'],
      },
      success: false,
    };
  }

  return {
    success: true,
    tagId: id,
    inputs: {
      id,
      title,
      category,
    },
  };
}

/**
 * Server Action mutation for deleting a Journal tag.
 */
export async function deleteJournalTagMutation(
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

  return withRequestContext(async ({ journalTag }) => {
    const success = await journalTag.deleteTag(id, userId);
    return success
      ? { success: true }
      : { success: false, error: 'Tag not found' };
  });
}
