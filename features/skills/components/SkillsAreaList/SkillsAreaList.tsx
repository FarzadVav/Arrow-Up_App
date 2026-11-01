"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CompassIcon, FolderOpenIcon, type LucideIcon } from "lucide-react";

import { useLifeAreas } from "@/features/life-areas/hooks/useLifeAreas";
import { useSkills } from "../../hooks/useSkills";
import { UNSET_LIFE_AREA_SLUG } from "@/features/general/lib/lifeAreaSlug";
import CardView from "@/features/general/components/ui/CardView/CardView";
import EmptyAlert from "@/features/general/components/static/EmptyAlert";
import Skeleton from "@/features/general/components/ui/Skeleton";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";
import { stripHtml } from "@/features/general/lib/richText";

export function SkillsAreaList() {
  const { t } = useLocale();
  const { lifeAreas, isLoading: isLoadingAreas } = useLifeAreas();
  const { skills, isLoading: isLoadingSkills } = useSkills();

  const countByArea = useMemo(() => {
    const counts = new Map<number, number>();
    let general = 0;

    skills.forEach((skill) => {
      if (skill.lifeAreaId) {
        counts.set(skill.lifeAreaId, (counts.get(skill.lifeAreaId) ?? 0) + 1);
      } else {
        general += 1;
      }
    });

    return { counts, general };
  }, [skills]);

  const isLoading =
    (isLoadingAreas || isLoadingSkills) && lifeAreas.length === 0;

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
        icon={
          <div className="size-10 rounded-full bg-foreground/5 flex items-center justify-center shrink-0">
            <Icon />
          </div>
        }
        title={title}
        description={description}
        date={
          <span>
            {count} {t("skills.countSuffix")}
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

  return (
    <div className="w-full flex flex-col gap-sm">
      {lifeAreas.length === 0 && (
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
          `/skills/${area.id}`,
          CompassIcon,
          area.title,
          stripHtml(area.vision) || t("skills.areaDesc"),
          countByArea.counts.get(area.id) ?? 0,
        ),
      )}

      {countByArea.general > 0 &&
        renderCard(
          UNSET_LIFE_AREA_SLUG,
          `/skills/${UNSET_LIFE_AREA_SLUG}`,
          FolderOpenIcon,
          t("common.general"),
          t("skills.generalDesc"),
          countByArea.general,
        )}
    </div>
  );
}

export default SkillsAreaList;
