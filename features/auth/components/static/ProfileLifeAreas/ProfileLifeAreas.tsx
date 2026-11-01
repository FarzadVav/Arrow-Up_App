"use client";

import Link from "next/link";
import { ArchiveIcon, GaugeIcon, PlusIcon } from "lucide-react";

import { Button } from "@/features/general/components/ui/Button/Button";
import { useLifeAreas } from "@/features/life-areas/hooks/useLifeAreas";
import EmptyAlert from "@/features/general/components/static/EmptyAlert";
import Skeleton from "@/features/general/components/ui/Skeleton";
import { LifeAreaCard } from "@/features/life-areas/components/LifeAreaCard/LifeAreaCard";
import CardDrawer from "@/features/general/components/ui/CardDrawer/CardDrawer";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";

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

      <div className="w-full rounded-container bg-card p-sm space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-bold">
            <GaugeIcon className="size-3.5" />
            <span>{t("lifeAreas.costUsed")}</span>
          </span>
          <span className="sub-text font-medium">
            {totalCost} / 10
          </span>
        </div>

        <div className="flex items-center gap-1">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                index < totalCost
                  ? totalCost > 10
                    ? "bg-red-500"
                    : "bg-foreground"
                  : "bg-card-thick"
              }`}
            />
          ))}
        </div>
      </div>

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
            <div className="pt-1">
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
