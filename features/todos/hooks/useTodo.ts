'use client';

import useSWR from 'swr';
import type { Todo } from '../lib/types';

const todoFetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch todo');
  }
  const data = await res.json();
  return (data.todo ?? null) as Todo | null;
};

export function useTodo(id: number | null | undefined) {
  const url = id ? `/api/todos/${id}` : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<Todo | null>(
    url,
    todoFetcher,
    {
      revalidateOnFocus: true,
    },
  );

  return {
    todo: data,
    isLoading: Boolean(id) && isLoading,
    isValidating,
    error,
    mutate,
  };
}
