"use client";

import useSWR from 'swr';
import type { Framework } from '../lib/types';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch framework');
  }
  const data = await res.json();
  return data.framework as Framework;
};

export function useFramework(id: number | null) {
  const { data: framework = null, error, isLoading, mutate } = useSWR<Framework | null>(
    id ? `/api/framework/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
    },
  );

  return {
    framework,
    isLoading,
    error,
    mutate,
  };
}
