export type {
  Skill,
  CreateSkillData,
  UpdateSkillData,
  SkillTag,
  CreateSkillTagData,
  UpdateSkillTagData,
} from './schemas';
export {
  SkillLifeAreaSummarySchema,
  SkillSchema,
  CreateSkillSchema,
  UpdateSkillSchema,
  SkillTagSchema,
  CreateSkillTagSchema,
  UpdateSkillTagSchema,
} from './schemas';

export type SkillFormState = {
  errors?: {
    title?: string[];
    content?: string[];
    lifeAreaId?: string[];
    tag?: string[];
    general?: string[];
  };
  inputs?: {
    title?: string;
    content?: string;
    lifeAreaId?: number | null;
    tag?: string | null;
  };
  success?: boolean;
  skillId?: number;
} | null | undefined;

export type SkillTagFormState = {
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
