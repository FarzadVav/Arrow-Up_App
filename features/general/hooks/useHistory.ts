'use client';

import useSWR from 'swr';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch history');
  }
  const data = await res.json();
  return (data.items ?? []) as any[];
};

export function useHistory(type: string) {
  const url = `/api/history?type=${encodeURIComponent(type)}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<any[]>(url, fetcher, {
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
