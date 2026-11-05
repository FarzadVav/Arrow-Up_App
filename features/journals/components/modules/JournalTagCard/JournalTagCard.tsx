"use client";

import Link from "next/link";
import { TagIcon, Trash2Icon, PencilIcon } from "lucide-react";
import type { JournalTag } from "@/features/journals/lib/types";
import CardView from "@/features/general/components/ui/CardView/CardView";
import { Button } from "@/features/general/components/ui/Button/Button";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";

export interface JournalTagCardProps {
  tag: JournalTag;
  category: string;
  isHistory?: boolean;
  onRequestDelete: (id: number) => void;
}

export function JournalTagCard({
  tag,
  category,
  isHistory,
  onRequestDelete,
}: JournalTagCardProps) {
  const { t, formatDate } = useLocale();

  return (
    <CardView
      isHistory={isHistory}
      title={tag.title}
      description={tag.createdAt ? formatDate(tag.createdAt) : undefined}
      icon={
        <div className="size-8 rounded-component bg-foreground/10 flex items-center justify-center shrink-0">
          <TagIcon />
        </div>
      }
      swipeActions={
        <div className="flex items-center gap-xs">
          <Button
            nativeButton={false}
            isHistory={isHistory}
            render={
              <Link
                href={`/journals/${category.toLowerCase()}/tags/new?editId=${tag.id}`}
              />
            }
            variant="card"
            size={"square"}
            className="size-10 justify-center"
            aria-label={t("common.edit")}>
            <PencilIcon />
          </Button>

          <Button
            type="button"
            isHistory={isHistory}
            variant="card"
            size={"square"}
            className="size-10 justify-center"
            aria-label={t("common.delete")}
            onClick={() => onRequestDelete(tag.id)}>
            <Trash2Icon />
          </Button>
        </div>
      }
    />
  );
}

export default JournalTagCard;
