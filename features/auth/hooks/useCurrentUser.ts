'use client';

import useSWR from 'swr';
import type { AuthUser } from '../lib/types';

const fetcher = async (url: string): Promise<{ user: AuthUser | null }> => {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 401) {
      return { user: null };
    }
    throw new Error(`Failed to fetch current user (status: ${res.status})`);
  }

  return res.json();
};

/**
 * Client-side SWR hook to fetch and reactively manage the current authenticated user.
 */
export function useCurrentUser() {
  const { data, error, isLoading, mutate } = useSWR<{ user: AuthUser | null }>(
    '/api/auth/me',
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );

  return {
    user: data?.user ?? null,
    isLoading,
    isError: Boolean(error),
    mutate,
  };
}
