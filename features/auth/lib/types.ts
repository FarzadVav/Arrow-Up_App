export type {
  SessionPayload,
  AuthUser,
  LoginInput,
  CreateUserData,
  UpdateUserData,
} from './schemas';

export type LoginFormState =
  | {
      errors?: {
        username?: string[];
        password?: string[];
      };
      message?: string;
      inputs?: {
        username?: string;
      };
      success?: boolean;
    }
  | undefined;

export type LogoutFormState =
  | {
      message?: string;
      success?: boolean;
    }
  | undefined;
