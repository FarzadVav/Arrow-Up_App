import { type } from 'arktype';

/**
 * ArkType schema for authentication session payload stored in JWT.
 */
export const SessionPayloadSchema = type({
  userId: 'string',
  username: 'string',
  expiresAt: 'Date',
});
export type SessionPayload = typeof SessionPayloadSchema.infer;

/**
 * ArkType schema for authenticated user returned by queries and Route Handlers.
 */
export const AuthUserSchema = type({
  id: 'number',
  username: 'string',
  'email?': 'string | null',
  locale: 'string',
  colorScheme: 'string',
  createdAt: 'string',
});
export type AuthUser = typeof AuthUserSchema.infer;

/**
 * ArkType schema for validating login and registration inputs.
 */
export const LoginInputSchema = type({
  username: 'string >= 3',
  password: 'string >= 6',
});
export type LoginInput = typeof LoginInputSchema.infer;

/**
 * ArkType schema for creating a new user record.
 */
export const CreateUserDataSchema = type({
  username: 'string >= 3',
  password: 'string >= 6',
  'email?': 'string',
  'locale?': 'string',
  'colorScheme?': 'string',
});
export type CreateUserData = typeof CreateUserDataSchema.infer;

/**
 * ArkType schema for updating an existing user record.
 */
export const UpdateUserDataSchema = type({
  'email?': 'string',
  'locale?': 'string',
  'colorScheme?': 'string',
  'password?': 'string >= 6',
});
export type UpdateUserData = typeof UpdateUserDataSchema.infer;

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
