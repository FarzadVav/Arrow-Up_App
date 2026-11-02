export type {
  Framework,
  CreateFrameworkData,
  UpdateFrameworkData,
  FrameworkTag,
  CreateFrameworkTagData,
  UpdateFrameworkTagData,
} from './schemas';
export {
  FrameworkLifeAreaSummarySchema,
  FrameworkHistoryItemSchema,
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
    description?: string[];
    lifeAreaId?: string[];
    tag?: string[];
    general?: string[];
  };
  inputs?: {
    title?: string;
    description?: string;
    lifeAreaId?: number | null;
    tag?: string | null;
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
