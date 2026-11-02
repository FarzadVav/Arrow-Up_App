import 'server-only';
import crypto from 'node:crypto';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT, jwtVerify } from 'jose';

import { AuthenticationError } from '@/features/general/lib/utils';
import { getSessionQuery, getCurrentUserQuery } from '../api/queries';
import type { AuthUser, SessionPayload } from './types';

// ==========================================
// Passwords
// ==========================================

/**
 * Hashes a plain-text password using Node.js crypto scrypt.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a plain-text password against a stored password.
 * Supports both hashed passwords (salt:hash) and plain text (for initial seed data).
 */
export function verifyPassword(password: string, stored: string): boolean {
  if (!stored) {
    return false;
  }

  // Fallback for plain-text seed credentials (e.g. 'password123')
  if (!stored.includes(':')) {
    return password === stored;
  }

  const [salt, key] = stored.split(':');
  if (!salt || !key) {
    return false;
  }

  try {
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

// ==========================================
// Session
// ==========================================

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) {
  throw new Error(
    'SESSION_SECRET is not set. A committed default would let anyone forge a session cookie for any user.',
  );
}
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch {
    console.log('Failed to verify session');
  }
}

export async function setSession(payload: Omit<SessionPayload, 'expiresAt'>) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ ...payload, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function expandSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  const payload = await decrypt(session);

  if (!session || !payload) {
    return null;
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

// ==========================================
// Actor & Authorization
// ==========================================

/**
 * Resolves the acting user for the current request, memoized per request so a
 * single server action does not re-decrypt the session cookie repeatedly.
 */
export const getUserId = cache(async (): Promise<number | null> => {
  const session = await getSessionQuery();
  if (!session?.userId) {
    return null;
  }

  const userId = Number(session.userId);
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return null;
  }

  return userId;
});

/**
 * Route handlers and server queries: a missing session is an error condition.
 */
export async function requireUserId(): Promise<number> {
  const userId = await getUserId();
  if (userId === null) {
    throw new AuthenticationError();
  }

  return userId;
}

/**
 * Server Actions: returns null instead of throwing so the caller can surface the
 * failure through its own form state instead of an unhandled action rejection.
 */
export async function tryGetUserId(): Promise<number | null> {
  return getUserId();
}

// ==========================================
// DAL (Data Access Layer)
// ==========================================

/**
 * Verifies that the user has a valid active session.
 * If not authenticated, redirects directly to /login.
 */
export const verifySession = cache(async () => {
  const session = await getSessionQuery();
  if (!session?.userId) {
    redirect('/login');
  }

  return { isAuth: true, userId: session.userId, username: session.username };
});

/**
 * Retrieves the current user from the database via UserRepository (wrapped with React cache).
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  return getCurrentUserQuery();
});
