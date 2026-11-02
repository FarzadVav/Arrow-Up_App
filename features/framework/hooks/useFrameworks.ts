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

export function useFrameworks(lifeAreaId?: number | null) {
  const endpoint =
    lifeAreaId !== undefined && lifeAreaId !== null
      ? `/api/framework?lifeAreaId=${lifeAreaId}`
      : '/api/framework';

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
