'use client';

import useSWR from 'swr';
import type { Todo, TodoType } from '../lib/types';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch todos');
  }
  const data = await res.json();
  return (data.todos ?? []) as Todo[];
};

export function useTodos(
  type?: TodoType | 'all' | string,
  options?: { isHistory?: boolean } | boolean,
) {
  const isHistory = typeof options === 'boolean' ? options : options?.isHistory ?? false;
  const params = new URLSearchParams();

  if (type && type !== 'all') {
    params.set('type', type);
  }
  if (isHistory) {
    params.set('history', 'true');
  }

  const queryString = params.toString();
  const url = `/api/todos${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<Todo[]>(url, fetcher, {
    revalidateOnFocus: true,
  });

  const todos = data ?? [];

  return {
    todos,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
