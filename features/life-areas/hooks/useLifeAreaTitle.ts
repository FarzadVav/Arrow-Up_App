'use client';

import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";
import { useLifeAreas } from "./useLifeAreas";

/**
 * Resolves the heading for an area page; null is the General area.
 */
export function useLifeAreaTitle(lifeAreaId: number | null, unknownLabel: string) {
  const { t } = useLocale();
  const { lifeAreas, isLoading } = useLifeAreas();

  if (lifeAreaId === null) return t("common.general");

  const area = lifeAreas.find((item) => item.id === lifeAreaId);
  if (area) return area.title;

  return isLoading ? t("common.loading") : unknownLabel;
}
