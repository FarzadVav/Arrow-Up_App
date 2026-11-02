"use client";

import Link from "next/link";
import { ArchiveIcon, GaugeIcon, PlusIcon } from "lucide-react";

import { Button } from "@/features/general/components/ui/Button/Button";
import { useLifeAreas } from "@/features/life-areas/hooks/useLifeAreas";
import EmptyAlert from "@/features/general/components/statics/EmptyAlert";
import Skeleton from "@/features/general/components/ui/Skeleton";
import { LifeAreaCard } from "@/features/life-areas/components/modules/LifeAreaCard/LifeAreaCard";
import CardDrawer from "@/features/general/components/ui/CardDrawer/CardDrawer";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";
import TimeAndEnergyCostCard from "@/features/general/components/modules/TimeAndEnergyCostCard/TimeAndEnergyCostCard";

export function ProfileLifeAreas() {
  const { t } = useLocale();
  const { lifeAreas, isLoading } = useLifeAreas();

  const activeLifeAreas = lifeAreas.filter((area) => area.active !== false);
  const notActiveLifeAreas = lifeAreas.filter((area) => area.active === false);
  const totalCost = activeLifeAreas.reduce(
    (acc, area) => acc + (area.difficulty ?? 0),
    0,
  );

  return (
    <div className="w-full space-y-sm">
      <div className="flex items-center justify-between">
        <p className="title">{t("lifeAreas.title")}</p>

        {lifeAreas.length ? (
          <Button
            type="button"
            variant="card"
            nativeButton={false}
            render={
              <Link href={"/profile/new-life-area"}>
                <PlusIcon />
                <span>{t("common.add")}</span>
              </Link>
            }
          />
        ) : null}
      </div>

      <TimeAndEnergyCostCard
        totalCost={totalCost}
        title={t("lifeAreas.costUsed")}
      />

      {isLoading ? (
        <Skeleton />
      ) : lifeAreas.length === 0 ? (
        <EmptyAlert
          alert={t("lifeAreas.empty")}
          href="/profile/new-life-area"
        />
      ) : (
        <>
          {activeLifeAreas.length === 0 ? (
            <EmptyAlert
              alert={t("lifeAreas.empty")}
              href="/profile/new-life-area"
            />
          ) : (
            activeLifeAreas.map((area) => (
              <LifeAreaCard key={area.id} lifeArea={area} />
            ))
          )}

          {notActiveLifeAreas.length > 0 && (
            <div className="pt-xs">
              <CardDrawer
                title={t("lifeAreas.notActiveTitle")}
                icon={<ArchiveIcon />}
                description={`${notActiveLifeAreas.length}`}
                content={
                  <div className="space-y-sm">
                    {notActiveLifeAreas.map((area) => (
                      <LifeAreaCard key={area.id} lifeArea={area} />
                    ))}
                  </div>
                }
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ProfileLifeAreas;
