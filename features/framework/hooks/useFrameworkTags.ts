'use client';

import useSWR from 'swr';
import type { FrameworkTag } from '../lib/types';

/**
 * lifeAreaId undefined fetches every tag, null scopes to the General area.
 */
function tagsUrl(lifeAreaId?: number | null) {
  if (lifeAreaId === undefined) return '/api/framework/tags';
  return `/api/framework/tags?lifeAreaId=${lifeAreaId ?? 'none'}`;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch framework tags');
  }
  const data = await res.json();
  return (data.tags ?? []) as FrameworkTag[];
};

export function useFrameworkTags(lifeAreaId?: number | null) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    FrameworkTag[]
  >(tagsUrl(lifeAreaId), fetcher, {
    revalidateOnFocus: true,
  });

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
    throw new Error('Failed to fetch framework tag');
  }
  const data = await res.json();
  return (data.tag ?? null) as FrameworkTag | null;
};

export function useFrameworkTag(id: number | null) {
  const url = id ? `/api/framework/tags/${id}` : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<
    FrameworkTag | null
  >(url, tagFetcher);

  return {
    tag: data ?? null,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
