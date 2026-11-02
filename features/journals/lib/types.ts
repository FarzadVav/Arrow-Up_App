export type {
  JournalCategory,
  JournalType,
  Journal,
  CreateJournalData,
  UpdateJournalData,
  JournalTag,
  CreateJournalTagData,
  UpdateJournalTagData,
} from './schemas';
export {
  JournalCategorySchema,
  JournalTypeSchema,
  JournalSchema,
  CreateJournalSchema,
  UpdateJournalSchema,
  JournalTagSchema,
  CreateJournalTagSchema,
  UpdateJournalTagSchema,
} from './schemas';

import type { JournalCategory } from './schemas';

export type JournalsStats = {
  counts: Record<JournalCategory, number>;
  total: number;
};

/**
 * Journal category definition with associated tags.
 */
export type JournalCategoryDefinition = {
  name: JournalCategory;
  tags: string[];
};

/**
 * Form state for Base UI and React 19 useActionState form handling.
 */
export type JournalFormState = {
  errors?: {
    title?: string[];
    content?: string[];
    type?: string[];
    tag?: string[];
    general?: string[];
  };
  message?: string;
  inputs?: {
    id?: number;
    title?: string;
    content?: string;
    type?: JournalCategory;
    tag?: string | null;
  };
  success?: boolean;
  journalId?: number;
} | null;

export type JournalTagFormState = {
  errors?: {
    title?: string[];
    category?: string[];
    general?: string[];
  };
  message?: string;
  inputs?: {
    id?: number;
    title?: string;
    category?: JournalCategory;
  };
  success?: boolean;
  tagId?: number;
} | null;
