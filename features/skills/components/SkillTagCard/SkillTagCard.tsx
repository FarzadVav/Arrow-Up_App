"use client";

import Link from "next/link";
import { TagIcon, Trash2Icon, PencilIcon } from "lucide-react";
import type { SkillTag } from "../../types";
import { UNSET_LIFE_AREA_SLUG } from "@/features/general/lib/lifeAreaSlug";
import CardView from "@/features/general/components/ui/CardView/CardView";
import { Button } from "@/features/general/components/ui/Button/Button";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";

export interface SkillTagCardProps {
  tag: SkillTag;
  onRequestDelete: (id: number) => void;
}

export function SkillTagCard({ tag, onRequestDelete }: SkillTagCardProps) {
  const { t, formatDate } = useLocale();
  const areaSlug = tag.lifeAreaId ?? UNSET_LIFE_AREA_SLUG;

  return (
    <div className="w-full flex items-center gap-2">
      <div className="flex-1 min-w-0">
        <CardView
          title={tag.title}
          description={tag.createdAt ? formatDate(tag.createdAt) : undefined}
          icon={
            <div className="size-8 rounded-container bg-foreground/10 flex items-center justify-center shrink-0">
              <TagIcon className="size-4 text-foreground" />
            </div>
          }
        />
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          nativeButton={false}
          render={
            <Link href={`/skills/${areaSlug}/tags/new?editId=${tag.id}`} />
          }
          variant="card"
          size={"square"}
          className="size-10 justify-center"
          aria-label={t("common.edit")}>
          <PencilIcon className="size-4 text-foreground/70" />
        </Button>

        <Button
          type="button"
          variant="card"
          size={"square"}
          className="size-10 justify-center text-foreground/70 hover:text-foreground"
          aria-label={t("common.delete")}
          onClick={() => onRequestDelete(tag.id)}>
          <Trash2Icon className="size-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

export default SkillTagCard;
