'use client';

import useSWR from 'swr';
import type { JournalTag, JournalCategory } from '../lib/types';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch journal tags');
  }
  const data = await res.json();
  return (data.tags ?? []) as JournalTag[];
};

export function useJournalTags(category?: JournalCategory | string) {
  const queryParam = category ? `?category=${encodeURIComponent(category)}` : '';
  const url = `/api/journals/tags${queryParam}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<JournalTag[]>(
    url,
    fetcher,
    {
      revalidateOnFocus: true,
    },
  );

  const tags = data ?? [];

  return {
    tags,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}

const tagFetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch journal tag');
  }
  const data = await res.json();
  return (data.tag ?? null) as JournalTag | null;
};

export function useJournalTag(id: number | null) {
  const url = id ? `/api/journals/tags/${id}` : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<JournalTag | null>(
    url,
    tagFetcher,
  );

  return {
    tag: data ?? null,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
