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
  JournalCategoryNameSchema as JournalCategorySchema,
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
  slug?: string;
  nameEn?: string;
  nameFa?: string;
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
    category?: string[];
    tag?: string[];
    general?: string[];
  };
  message?: string;
  inputs?: {
    id?: number;
    title?: string;
    content?: string;
    type?: string;
    category?: string;
    categoryId?: number;
    tag?: string | number | null;
    tagId?: number;
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
    category?: string;
  };
  success?: boolean;
  tagId?: number;
} | null;
