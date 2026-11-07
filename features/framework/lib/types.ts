export type {
  Framework,
  FrameworkPractice,
  FrameworkPracticeInput,
  CreateFrameworkData,
  UpdateFrameworkData,
  FrameworkTag,
  CreateFrameworkTagData,
  UpdateFrameworkTagData,
} from './schemas';
export {
  FrameworkLifeAreaSummarySchema,
  FrameworkTagSummarySchema,
  FrameworkHistoryItemSchema,
  FrameworkPracticeSchema,
  FrameworkPracticeInputSchema,
  FrameworkSchema,
  CreateFrameworkSchema,
  UpdateFrameworkSchema,
  FrameworkTagSchema,
  CreateFrameworkTagSchema,
  UpdateFrameworkTagSchema,
} from './schemas';

export type FrameworkFormState = {
  errors?: {
    title?: string[];
    content?: string[];
    lifeAreaId?: string[];
    tag?: string[];
    tagId?: string[];
    practices?: string[];
    general?: string[];
  };
  inputs?: {
    title?: string;
    content?: string;
    lifeAreaId?: number | null;
    tagId?: number | null;
    tag?: string | null;
    practices?: Array<{ id?: number; title: string }>;
  };
  success?: boolean;
  frameworkId?: number;
} | null | undefined;

export type FrameworkTagFormState = {
  errors?: {
    title?: string[];
    lifeAreaId?: string[];
    general?: string[];
  };
  message?: string;
  inputs?: {
    id?: number;
    title?: string;
    lifeAreaId?: number | null;
  };
  success?: boolean;
  tagId?: number;
} | null;
