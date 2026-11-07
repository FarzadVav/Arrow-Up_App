"use client";

import { useMemo } from "react";
import {
  CalendarDaysIcon,
  CompassIcon,
  Repeat2Icon,
  TagIcon,
  Trash2Icon,
} from "lucide-react";
import type { Framework } from "@/features/framework/lib/types";
import CardDrawer from "@/features/general/components/ui/CardDrawer/CardDrawer";
import { RichTextResult } from "@/features/general/components/ui/RichTextEditor";
import { stripHtml } from "@/features/general/lib/utils";
import { Button } from "@/features/general/components/ui/Button/Button";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";
import {
  useHistoryActions,
  HistoryDrawerActions,
  HistoryDeleteDialog,
  HistoryQuickRestoreBtn,
} from "@/features/history";

export interface FrameworkCardProps {
  framework: Framework;
  isHistory?: boolean;
  onEdit?: (framework: Framework) => void;
  onRequestDelete?: (id: number) => void;
  onRecorded?: () => void;
  onMutated?: () => void;
}

export function FrameworkCard({
  framework,
  isHistory = false,
  onRequestDelete,
  onMutated,
}: FrameworkCardProps) {
  const { t, formatDate, formatDateTime } = useLocale();

  const historyActions = useHistoryActions({
    id: framework.id,
    type: "framework",
    onMutated,
  });

  const completedCount = useMemo(() => {
    return (framework.history || []).filter((h) => h.isDone).length;
  }, [framework.history]);

  const deletedDateStr = framework.deletedAt
    ? formatDateTime(framework.deletedAt)
    : "";

  const cardDate =
    isHistory && deletedDateStr ? (
      <span className="text-xs sub-text">
        {t("history.deletedAt")}: {deletedDateStr}
      </span>
    ) : undefined;

  const drawerActions = isHistory ? (
    <HistoryDrawerActions
      onRestore={historyActions.handleRestore}
      onRequestDelete={() => historyActions.setDeleteDialogOpen(true)}
      isRestoring={historyActions.isRestoring}
      isDeleting={historyActions.isDeleting}
    />
  ) : (
    <Button
      type="button"
      variant="card"
      size={"square"}
      aria-label={t("common.delete")}
      onClick={() => onRequestDelete?.(framework.id)}>
      <Trash2Icon />
    </Button>
  );

  const cardElement = (
    <CardDrawer
      title={framework.title}
      description={stripHtml(framework.content)}
      date={cardDate}
      icon={
        <div className="size-8 rounded-component bg-foreground/10 flex items-center justify-center shrink-0">
          <Repeat2Icon />
        </div>
      }
      editHref={isHistory ? undefined : `/framework/new?editId=${framework.id}`}
      isHistory={isHistory}
      content={
        <div className="space-y-sm">
          <div className="flex items-center gap-sm flex-wrap sub-text">
            <span className="flex items-center gap-xs">
              <CompassIcon />
              <span>{framework.lifeArea?.title ?? t("common.abandoned")}</span>
            </span>

            {framework.lifeAreaId && framework.tag && (
              <span className="flex items-center gap-xs">
                <TagIcon />
                <span>{framework.tag}</span>
              </span>
            )}
          </div>

          {framework.content && (
            <RichTextResult
              content={framework.content}
              containerClassName="rounded-component bg-background/60 p-sm"
            />
          )}

          {/* Practices Section */}
          {framework.practices && framework.practices.length > 0 && (
            <section className="space-y-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold">
                  {t("framework.practices")}
                </h4>
                <span className="sub-text">{framework.practices.length}</span>
              </div>

              <div className="space-y-xs">
                {framework.practices.map((practice) => (
                  <div
                    key={practice.id}
                    className="flex items-center gap-sm rounded-component bg-background p-sm">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-component bg-card text-xs">
                      <Repeat2Icon className="size-3.5" />
                    </div>
                    <p className="text-sm font-medium flex-1 truncate">
                      {practice.title}
                    </p>
                  </div>
                ))}
              </div>
            </section>
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
      actions={drawerActions}
    />
  );

  return (
    <>
      {isHistory ? (
        <div className="flex items-center gap-xs w-full">
          <div className="flex-1 min-w-0">{cardElement}</div>
          <HistoryQuickRestoreBtn
            onRestore={historyActions.handleRestore}
            isRestoring={historyActions.isRestoring}
          />
        </div>
      ) : (
        cardElement
      )}

      {isHistory && (
        <HistoryDeleteDialog
          open={historyActions.deleteDialogOpen}
          onOpenChange={historyActions.setDeleteDialogOpen}
          onConfirm={historyActions.handlePermanentDelete}
          isDeleting={historyActions.isDeleting}
        />
      )}
    </>
  );
}

export default FrameworkCard;
