"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CompassIcon, FolderOpenIcon, type LucideIcon } from "lucide-react";

import { useLifeAreas } from "@/features/life-areas/hooks/useLifeAreas";
import { useFrameworks } from "@/features/framework/hooks";
import { UNSET_LIFE_AREA_SLUG } from "@/features/general/lib/utils";
import CardView from "@/features/general/components/ui/CardView/CardView";
import EmptyAlert from "@/features/general/components/statics/EmptyAlert";
import Skeleton from "@/features/general/components/ui/Skeleton";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";
import { stripHtml } from "@/features/general/lib/utils";

export interface FrameworksAreaListProps {
  isHistory?: boolean;
}

export function FrameworksAreaList({ isHistory = false }: FrameworksAreaListProps) {
  const { t } = useLocale();
  const { lifeAreas, isLoading: isLoadingAreas } = useLifeAreas();
  const { frameworks, isLoading: isLoadingFrameworks } = useFrameworks(
    undefined,
    { isHistory },
  );

  const countByArea = useMemo(() => {
    const counts = new Map<number, number>();
    let abandoned = 0;

    frameworks.forEach((framework) => {
      const areaId = framework.lifeAreaId ?? framework.lifeArea?.id;
      if (areaId) {
        counts.set(areaId, (counts.get(areaId) ?? 0) + 1);
      } else {
        abandoned += 1;
      }
    });

    return { counts, abandoned };
  }, [frameworks]);

  const isLoading =
    (isLoadingAreas || isLoadingFrameworks) && lifeAreas.length === 0;

  const renderCard = (
    key: string,
    href: string,
    Icon: LucideIcon,
    title: string,
    description: string,
    count: number,
  ) => (
    <Link key={key} href={href} className="block">
      <CardView
        isHistory={isHistory}
        icon={
          <div className="size-10 rounded-full bg-foreground/5 flex items-center justify-center shrink-0">
            <Icon />
          </div>
        }
        title={title}
        description={description}
        date={
          <span>
            {count} {t("framework.countSuffix")}
          </span>
        }
      />
    </Link>
  );

  if (isLoading) {
    return (
      <div className="w-full space-y-sm">
        <Skeleton count={3} />
      </div>
    );
  }

  if (isHistory && frameworks.length === 0) {
    return <EmptyAlert alert={t("history.empty")} className="p-md" />;
  }

  const getAreaHref = (id: number | string) =>
    isHistory ? `/framework/history/${id}` : `/framework/${id}`;

  return (
    <div className="w-full flex flex-col gap-sm">
      {!isHistory && lifeAreas.length === 0 && (
        <EmptyAlert
          alert={t("lifeAreas.empty")}
          description={t("lifeAreas.subtitle")}
          href="/profile/new-life-area"
          className="p-md"
        />
      )}

      {lifeAreas.map((area) =>
        renderCard(
          String(area.id),
          getAreaHref(area.id),
          CompassIcon,
          area.title,
          stripHtml(area.vision) || t("framework.areaDesc"),
          countByArea.counts.get(area.id) ?? 0,
        ),
      )}

      {countByArea.abandoned > 0 &&
        renderCard(
          UNSET_LIFE_AREA_SLUG,
          getAreaHref(UNSET_LIFE_AREA_SLUG),
          FolderOpenIcon,
          t("common.abandoned"),
          t("framework.abandonedDesc"),
          countByArea.abandoned,
        )}
    </div>
  );
}

export default FrameworksAreaList;
