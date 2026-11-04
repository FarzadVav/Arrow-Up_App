"use client";

import useSWR from 'swr';
import type { Framework } from '../lib/types';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch frameworks');
  }
  const data = await res.json();
  return (data.frameworks || []) as Framework[];
};

export function useFrameworks(
  lifeAreaId?: number | null,
  options?: { isHistory?: boolean } | boolean,
) {
  const isHistory = typeof options === 'boolean' ? options : options?.isHistory ?? false;
  const params = new URLSearchParams();

  if (lifeAreaId !== undefined && lifeAreaId !== null) {
    params.set('lifeAreaId', String(lifeAreaId));
  }
  if (isHistory) {
    params.set('history', 'true');
  }

  const queryString = params.toString();
  const endpoint = `/api/framework${queryString ? `?${queryString}` : ''}`;

  const { data: frameworks = [], error, isLoading, mutate } = useSWR<Framework[]>(
    endpoint,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    },
  );

  return {
    frameworks,
    isLoading,
    error,
    mutate,
  };
}
