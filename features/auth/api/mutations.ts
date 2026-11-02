'use server';

import { type } from 'arktype';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { withRequestContext } from '@/db';
import { setSession, deleteSession } from '../lib/utils';
import { LOCALE_COOKIE } from '@/features/general/lib/i18n/config';
import { LoginInputSchema } from '../lib/schemas';
import type { LoginFormState } from '../lib/types';

export async function loginMutation(
  prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const cookieStore = await cookies();
  const currentLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const isEn = currentLocale === 'en';

  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  const validation = LoginInputSchema({ username, password });
  if (validation instanceof type.errors) {
    const errors: NonNullable<LoginFormState>['errors'] = {};

    for (const problem of validation) {
      const field = String(problem.path[0] ?? '') as 'username' | 'password';
      if (field === 'username' || field === 'password') {
        if (!errors[field]) {
          errors[field] = [];
        }
        const msg = isEn
          ? problem.message
          : field === 'username'
            ? username.length === 0
              ? 'نام کاربری الزامی است.'
              : 'نام کاربری باید حداقل ۳ کاراکتر باشد.'
            : password.length === 0
              ? 'رمز عبور الزامی است.'
              : 'رمز عبور باید حداقل ۶ کاراکتر باشد.';
        errors[field]?.push(msg);
      }
    }

    return {
      errors,
      inputs: { username },
    };
  }

  const result = await withRequestContext(async ({ user }) => {
    return await user.loginOrCreate(username, password, {
      locale: isEn ? 'en' : 'fa',
    });
  });

  if (result.status === 'INVALID_CREDENTIALS' || !result.user) {
    return {
      message: isEn
        ? 'Invalid username or password.'
        : 'نام کاربری یا رمز عبور اشتباه است.',
      inputs: { username },
    };
  }

  await setSession({
    userId: String(result.user.id),
    username: result.user.username,
  });

  redirect('/profile');
}

/**
 * Server Action mutation for terminating user session and logging out.
 * Directly invokable by client-side forms.
 */
export async function logoutMutation(): Promise<void> {
  await deleteSession();
  redirect('/login');
}
