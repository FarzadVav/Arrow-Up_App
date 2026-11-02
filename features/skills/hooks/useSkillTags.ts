'use client';

import useSWR from 'swr';
import type { SkillTag } from '../lib/types';

/**
 * lifeAreaId undefined fetches every tag, null scopes to the General area.
 */
function tagsUrl(lifeAreaId?: number | null) {
  if (lifeAreaId === undefined) return '/api/skills/tags';
  return `/api/skills/tags?lifeAreaId=${lifeAreaId ?? 'none'}`;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch skill tags');
  }
  const data = await res.json();
  return (data.tags ?? []) as SkillTag[];
};

export function useSkillTags(lifeAreaId?: number | null) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<SkillTag[]>(
    tagsUrl(lifeAreaId),
    fetcher,
    {
      revalidateOnFocus: true,
    },
  );

  return {
    tags: data ?? [],
    isLoading,
    isValidating,
    error,
    mutate,
  };
}

const tagFetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch skill tag');
  }
  const data = await res.json();
  return (data.tag ?? null) as SkillTag | null;
};

export function useSkillTag(id: number | null) {
  const url = id ? `/api/skills/tags/${id}` : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<
    SkillTag | null
  >(url, tagFetcher);

  return {
    tag: data ?? null,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
