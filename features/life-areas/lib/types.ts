export type {
  LifeArea,
  CreateLifeAreaData,
  UpdateLifeAreaData,
} from './schemas';
export {
  LifeAreaSchema,
  CreateLifeAreaSchema,
  UpdateLifeAreaSchema,
} from './schemas';

export type LifeAreaFormState = {
  errors?: {
    title?: string[];
    vision?: string[];
    active?: string[];
    difficulty?: string[];
    general?: string[];
  };
  inputs?: {
    title?: string;
    vision?: string;
    active?: boolean;
    difficulty?: number;
  };
  success?: boolean;
  lifeAreaId?: number;
} | null | undefined;
