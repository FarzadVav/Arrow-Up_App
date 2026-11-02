"use client";

import { useMemo } from "react";
import {
  CalendarDaysIcon,
  CompassIcon,
  Repeat2Icon,
  TagIcon,
  Trash2Icon,
} from "lucide-react";
import type { Framework } from "../../types";
import CardDrawer from "@/features/general/components/ui/CardDrawer/CardDrawer";
import { RichTextResult } from "@/features/general/components/ui/RichTextEditor";
import { stripHtml } from "@/features/general/lib/richText";
import { Button } from "@/features/general/components/ui/Button/Button";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";

export interface FrameworkCardProps {
  framework: Framework;
  onEdit?: (framework: Framework) => void;
  onRequestDelete: (id: number) => void;
  onRecorded?: () => void;
}

export function FrameworkCard({
  framework,
  onRequestDelete,
}: FrameworkCardProps) {
  const { t, formatDate } = useLocale();

  const completedCount = useMemo(() => {
    return (framework.history || []).filter((h) => h.isDone).length;
  }, [framework.history]);

  return (
    <CardDrawer
      title={framework.title}
      description={stripHtml(framework.description)}
      icon={
        <div className="size-8 rounded-component bg-foreground/10 flex items-center justify-center shrink-0">
          <Repeat2Icon />
        </div>
      }
      editHref={`/framework/new?editId=${framework.id}`}
      content={
        <div className="space-y-sm">
          <div className="flex items-center gap-sm flex-wrap sub-text">
            <span className="flex items-center gap-xs">
              <CompassIcon />
              <span>{framework.lifeArea?.title ?? t("common.notSet")}</span>
            </span>

            {framework.tag && (
              <span className="flex items-center gap-xs">
                <TagIcon />
                <span>{framework.tag}</span>
              </span>
            )}
          </div>

          {framework.description && (
            <RichTextResult
              content={framework.description}
              containerClassName="rounded-component bg-background/60 p-sm"
            />
          )}

          {/* Recent History summary */}
          {framework.history && framework.history.length > 0 && (
            <div className="rounded-component bg-card p-sm space-y-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold">
                  {t("framework.historyTitle")}
                </h4>
                <span className="sub-text">
                  {completedCount} / {framework.history.length}{" "}
                  {t("common.done")}
                </span>
              </div>

              <div className="flex flex-wrap gap-xs max-h-36 overflow-y-auto scrollbar-thin">
                {[...framework.history]
                  .reverse()
                  .slice(0, 14)
                  .map((entry) => (
                    <span
                      key={entry.id}
                      className={`inline-flex items-center gap-xs px-xs py-xs rounded-md text-xs font-medium ${
                        entry.isDone
                          ? "bg-foreground/10"
                          : "bg-card-thick text-foreground/60 line-through"
                      }`}>
                      <CalendarDaysIcon />
                      <span>{formatDate(entry.date)}</span>
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      }
      actions={
        <Button
          type="button"
          variant="card"
          size={"square"}
          aria-label={t("common.delete")}
          onClick={() => onRequestDelete(framework.id)}>
          <Trash2Icon />
        </Button>
      }
    />
  );
}

export default FrameworkCard;
