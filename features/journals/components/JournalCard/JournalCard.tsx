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

import { Journal } from "../../types";
import { deleteJournalMutation } from "../../mutations";
import Drawer from "@/features/general/components/ui/Drawer/Drawer";
import CardDrawer from "@/features/general/components/ui/CardDrawer/CardDrawer";
import { Button } from "@/features/general/components/ui/Button/Button";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";
import { stripHtml } from "@/features/general/lib/richText";
import { RichTextResult } from "@/features/general/components/ui/RichTextEditor";

type JournalCardProps = {
  journal: Journal;
  onDeleted?: () => void;
};

function JournalCard({ journal, onDeleted }: JournalCardProps) {
  const { formatDate, formatTime, t } = useLocale();

  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteJournalMutation,
    undefined,
  );

  useEffect(() => {
    if (deleteState?.success) {
      onDeleted?.();
    }
  }, [deleteState, onDeleted]);

  return (
    <CardDrawer
      title={journal.title}
      description={stripHtml(journal.content)}
      date={
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
          {journal.tag && (
            <>
              <span>•</span>
              <span className="flex items-center gap-xs font-medium">
                <TagIcon />
                {journal.tag}
              </span>
            </>
          )}
        </div>
      }
      icon={
        <div className="size-8 rounded-component bg-foreground/10 flex items-center justify-center shrink-0">
          <FileTextIcon />
        </div>
      }
      editHref={`/journals/new?editId=${journal.id}`}
      content={
        <div className="space-y-sm">
          <div
            className={cn(
              "grid gap-xs",
              journal.tag ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3",
            )}>
            <div className="rounded-component bg-background p-sm">
              <div className="flex items-center gap-xs sub-text">
                <FileTextIcon />
                <span>{t("common.category")}</span>
              </div>
              <p className="mt-xs font-medium">
                {journal.type || t("common.general")}
              </p>
            </div>

            {journal.tag && (
              <div className="rounded-component bg-background p-sm">
                <div className="flex items-center gap-xs sub-text">
                  <TagIcon />
                  <span>{t("common.tag")}</span>
                </div>
                <p className="mt-xs font-medium">{journal.tag}</p>
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

          <section className="space-y-xs">
            <div className="flex items-center gap-xs sub-text">
              <FileTextIcon />
              <span className="font-bold">{t("common.content")}</span>
            </div>

            <RichTextResult
              content={journal.content}
              placeholder={t("journals.contentPlaceholder")}
              containerClassName="bg-background p-sm"
            />
          </section>
        </div>
      }
      actions={
        <form action={deleteAction}>
          <Field type="hidden" name="id" value={journal.id} />
          <Drawer.Close
            render={
              <Button
                type="submit"
                variant="card"
                size={"square"}
                disabled={isDeleting}
                className="size-10 justify-center"
                aria-label={t("common.delete")}>
                <Trash2Icon />
              </Button>
            }
          />
        </form>
      }
    />
  );
}

export default JournalCard;
