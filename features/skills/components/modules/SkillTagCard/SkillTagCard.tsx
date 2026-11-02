"use client";

import Link from "next/link";
import { TagIcon, Trash2Icon, PencilIcon } from "lucide-react";
import type { SkillTag } from "@/features/skills/lib/types";
import { UNSET_LIFE_AREA_SLUG } from "@/features/general/lib/utils";
import CardView from "@/features/general/components/ui/CardView/CardView";
import { Button } from "@/features/general/components/ui/Button/Button";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";

export interface SkillTagCardProps {
  tag: SkillTag;
  onRequestDelete: (id: number) => void;
}

export function SkillTagCard({ tag, onRequestDelete }: SkillTagCardProps) {
  const { t, formatDate } = useLocale();
  const areaSlug = tag.lifeAreaId ?? UNSET_LIFE_AREA_SLUG;

  return (
    <div className="w-full flex items-center gap-xs">
      <div className="flex-1 min-w-0">
        <CardView
          title={tag.title}
          description={tag.createdAt ? formatDate(tag.createdAt) : undefined}
          icon={
            <div className="size-8 rounded-component bg-foreground/10 flex items-center justify-center shrink-0">
              <TagIcon />
            </div>
          }
        />
      </div>

      <div className="flex items-center gap-xs shrink-0">
        <Button
          nativeButton={false}
          render={
            <Link href={`/skills/${areaSlug}/tags/new?editId=${tag.id}`} />
          }
          variant="card"
          size={"square"}
          className="size-10 justify-center"
          aria-label={t("common.edit")}>
          <PencilIcon />
        </Button>

        <Button
          type="button"
          variant="card"
          size={"square"}
          className="size-10 justify-center"
          aria-label={t("common.delete")}
          onClick={() => onRequestDelete(tag.id)}>
          <Trash2Icon />
        </Button>
      </div>
    </div>
  );
}

export default SkillTagCard;
