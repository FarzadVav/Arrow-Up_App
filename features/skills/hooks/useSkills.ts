"use client";

import useSWR from 'swr';
import type { Skill } from '../lib/types';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch skills');
  }
  const data = await res.json();
  return (data.skills || []) as Skill[];
};

export function useSkills(lifeAreaId?: number | null) {
  const endpoint = lifeAreaId ? `/api/skills?lifeAreaId=${lifeAreaId}` : '/api/skills';

  const { data: skills = [], error, isLoading, mutate } = useSWR<Skill[]>(
    endpoint,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    },
  );

  return {
    skills,
    isLoading,
    error,
    mutate,
  };
}
