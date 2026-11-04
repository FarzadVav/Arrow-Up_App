"use client";

import { useEffect, useActionState } from "react";
import { cn } from "cn";
import Field from "@/features/general/components/ui/Field";
import {
  CalendarDaysIcon,
  ClockIcon,
  FileTextIcon,
  TagIcon,
  Trash2Icon,
} from "lucide-react";

import type { Journal } from "@/features/journals/lib/types";
import { deleteJournalMutation } from "@/features/journals/api/mutations";
import CardDrawer from "@/features/general/components/ui/CardDrawer/CardDrawer";
import { Button } from "@/features/general/components/ui/Button/Button";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";
import { stripHtml } from "@/features/general/lib/utils";
import { RichTextResult } from "@/features/general/components/ui/RichTextEditor";
import {
  useHistoryActions,
  HistoryDrawerActions,
  HistoryDeleteDialog,
  HistoryQuickRestoreBtn,
} from "@/features/history";

export type JournalCardProps = {
  journal: Journal;
  isHistory?: boolean;
  onDeleted?: () => void;
  onMutated?: () => void;
};

export function JournalCard({
  journal,
  isHistory = false,
  onDeleted,
  onMutated,
}: JournalCardProps) {
  const { formatDate, formatTime, formatDateTime, t, locale } = useLocale();

  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteJournalMutation,
    undefined,
  );

  useEffect(() => {
    if (deleteState?.success) {
      onDeleted?.();
      onMutated?.();
    }
  }, [deleteState, onDeleted, onMutated]);

  const historyActions = useHistoryActions({
    id: journal.id,
    type: "journals",
    onMutated: onMutated || onDeleted,
  });

  const tagName = journal.tag
    ? typeof journal.tag === "object"
      ? locale === "fa"
        ? journal.tag.nameFa
        : journal.tag.nameEn
      : String(journal.tag)
    : null;

  const categoryName = journal.category
    ? typeof journal.category === "object"
      ? locale === "fa"
        ? journal.category.nameFa
        : journal.category.nameEn
      : String(journal.category)
    : journal.type
      ? t(`journals.categories.${journal.type.toLowerCase()}`) || journal.type
      : t("common.general");

  const deletedDateStr = journal.deletedAt
    ? formatDateTime(journal.deletedAt)
    : "";

  const cardDate =
    isHistory && deletedDateStr ? (
      <span className="text-xs sub-text">
        {t("history.deletedAt")}: {deletedDateStr}
      </span>
    ) : (
      <div className="flex items-center gap-xs flex-wrap">
        <span className="flex items-center gap-xs">
          <CalendarDaysIcon />
          {formatDate(journal.createdAt)}
        </span>
        <span>•</span>
        <span className="flex items-center gap-xs">
          <ClockIcon />
          {formatTime(journal.createdAt)}
        </span>
        {tagName && (
          <>
            <span>•</span>
            <span className="flex items-center gap-xs font-medium">
              <TagIcon />
              {tagName}
            </span>
          </>
        )}
      </div>
    );

  const drawerActions = isHistory ? (
    <HistoryDrawerActions
      onRestore={historyActions.handleRestore}
      onRequestDelete={() => historyActions.setDeleteDialogOpen(true)}
      isRestoring={historyActions.isRestoring}
      isDeleting={historyActions.isDeleting}
    />
  ) : (
    <form action={deleteAction} className="flex-1">
      <Field type="hidden" name="id" value={journal.id} />
      <Button
        type="submit"
        variant="card"
        className="w-full justify-center text-destructive"
        disabled={isDeleting}>
        <Trash2Icon />
        <span>{isDeleting ? t("common.loading") : t("common.delete")}</span>
      </Button>
    </form>
  );

  const cardElement = (
    <CardDrawer
      title={journal.title}
      description={stripHtml(journal.content)}
      date={cardDate}
      icon={
        <div className="size-8 rounded-component bg-foreground/10 flex items-center justify-center shrink-0">
          <FileTextIcon />
        </div>
      }
      editHref={isHistory ? undefined : `/journals/new?editId=${journal.id}`}
      isHistory={isHistory}
      content={
        <div className="space-y-sm">
          <div
            className={cn(
              "grid gap-xs",
              tagName ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3",
            )}>
            <div className="rounded-component bg-background p-sm">
              <div className="flex items-center gap-xs sub-text">
                <FileTextIcon />
                <span>{t("common.category")}</span>
              </div>
              <p className="mt-xs font-medium">{categoryName}</p>
            </div>

            {tagName && (
              <div className="rounded-component bg-background p-sm">
                <div className="flex items-center gap-xs sub-text">
                  <TagIcon />
                  <span>{t("common.tag")}</span>
                </div>
                <p className="mt-xs font-medium">{tagName}</p>
              </div>
            )}

            <div className="rounded-component bg-background p-sm">
              <div className="flex items-center gap-xs sub-text">
                <CalendarDaysIcon />
                <span>{t("common.date")}</span>
              </div>
              <p className="mt-xs font-medium">
                {formatDate(journal.createdAt)}
              </p>
            </div>

            <div className="rounded-component bg-background p-sm">
              <div className="flex items-center gap-xs sub-text">
                <ClockIcon />
                <span>{t("common.time")}</span>
              </div>
              <p className="mt-xs font-medium">
                {formatTime(journal.createdAt)}
              </p>
            </div>
          </div>

          <RichTextResult content={journal.content} />
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

export default JournalCard;
