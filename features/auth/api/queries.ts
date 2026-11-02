import 'server-only';
import { cookies } from 'next/headers';
import { withRequestContext } from '@/db';

import type { AuthUser } from '../lib/types';
import { decrypt, getUserId } from '../lib/utils';

export type SessionQueryResult = {
  isAuth: boolean;
  userId: string;
  username: string;
} | null;

/**
 * Retrieves the current session data from HTTP cookies.
 */
export async function getSessionQuery(): Promise<SessionQueryResult> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  if (!sessionCookie) {
    return null;
  }

  const payload = await decrypt(sessionCookie);
  if (!payload?.userId) {
    return null;
  }

  return {
    isAuth: true,
    userId: String(payload.userId),
    username: String(payload.username ?? ''),
  };
}

export async function getCurrentUserQuery(): Promise<AuthUser | null> {
  const userId = await getUserId();
  if (userId === null) {
    return null;
  }

  return withRequestContext(async ({ user }) => {
    const record = await user.findSelf(userId);
    if (!record) {
      return null;
    }

    return {
      id: record.id,
      username: record.username,
      email: record.email ?? null,
      locale: record.locale,
      colorScheme: record.colorScheme,
      createdAt: record.createdAt.toISOString(),
    };
  });
}
