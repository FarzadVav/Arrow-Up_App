"use client";

import Link from "next/link";
import { ArchiveIcon, PlusIcon } from "lucide-react";

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
                icon={<ArchiveIcon className="size-4 text-foreground/70" />}
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
