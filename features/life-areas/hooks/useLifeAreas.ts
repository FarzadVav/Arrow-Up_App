"use client";

import useSWR from 'swr';

import type { LifeArea } from '../lib/types';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch life areas');
  }
  const data = await res.json();
  return (data.lifeAreas || []) as LifeArea[];
};

export function useLifeAreas() {
  const { data: lifeAreas = [], error, isLoading, mutate } = useSWR<LifeArea[]>(
    '/api/life-areas',
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    },
  );

  return {
    lifeAreas,
    isLoading,
    error,
    mutate,
  };
}
