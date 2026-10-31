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
        <div className="size-8 rounded-container bg-foreground/10 flex items-center justify-center shrink-0">
          <Repeat2Icon className="size-4 text-foreground" />
        </div>
      }
      editHref={`/framework/new?editId=${framework.id}`}
      content={
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap sub-text text-xs">
            <span className="flex items-center gap-1.5">
              <CompassIcon className="size-3 text-foreground/60" />
              <span>{framework.lifeArea?.title ?? t("common.notSet")}</span>
            </span>

            {framework.tag && (
              <span className="flex items-center gap-1.5">
                <TagIcon className="size-3 text-foreground/60" />
                <span>{framework.tag}</span>
              </span>
            )}
          </div>

          {framework.description && (
            <RichTextResult
              content={framework.description}
              containerClassName="rounded-container bg-background/60 p-4 border border-foreground/10"
            />
          )}

          {/* Recent History summary */}
          {framework.history && framework.history.length > 0 && (
            <div className="rounded-container bg-card p-4 border border-foreground/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground">
                  {t("framework.historyTitle")}
                </h4>
                <span className="text-xs sub-text">
                  {completedCount} / {framework.history.length}{" "}
                  {t("common.done")}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto scrollbar-thin">
                {[...framework.history]
                  .reverse()
                  .slice(0, 14)
                  .map((entry) => (
                    <span
                      key={entry.id}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${
                        entry.isDone
                          ? "bg-foreground/10 text-foreground"
                          : "bg-destructive/10 text-destructive line-through"
                      }`}>
                      <CalendarDaysIcon className="size-3" />
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
          <Trash2Icon className="size-4 text-destructive" />
        </Button>
      }
    />
  );
}

export default FrameworkCard;
