"use client";

import useSWR from 'swr';
import type { Skill } from '../lib/types';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch skill');
  }
  const data = await res.json();
  return data.skill as Skill;
};

export function useSkill(id: number | null) {
  const { data: skill = null, error, isLoading, mutate } = useSWR<Skill | null>(
    id ? `/api/skills/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
    },
  );

  return {
    skill,
    isLoading,
    error,
    mutate,
  };
}
