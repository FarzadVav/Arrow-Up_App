'use client';

import useSWR from 'swr';
import type { HistoryItem } from '@/features/history/components/HistoryCard/HistoryCard';

const fetcher = async (url: string): Promise<HistoryItem[]> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch history');
  }
  const data = await res.json();
  return (data.items ?? []) as HistoryItem[];
};

export function useHistory(type: string) {
  const url = `/api/history?type=${encodeURIComponent(type)}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<HistoryItem[]>(url, fetcher, {
    revalidateOnFocus: true,
  });

  const items = data ?? [];

  return {
    items,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
