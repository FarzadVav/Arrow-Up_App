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
          <span className="flex items-center gap-1">
            <CalendarDaysIcon className="size-3.5" />
            {formatDate(journal.createdAt)}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ClockIcon className="size-3.5" />
            {formatTime(journal.createdAt)}
          </span>
          {journal.tag && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1 text-foreground/80 font-medium">
                <TagIcon className="size-3" />
                {journal.tag}
              </span>
            </>
          )}
        </div>
      }
      icon={
        <div className="size-8 rounded-container bg-foreground/10 flex items-center justify-center shrink-0">
          <FileTextIcon className="size-4 text-foreground" />
        </div>
      }
      editHref={`/journals/new?editId=${journal.id}`}
      content={
        <div className="space-y-4">
          <div
            className={cn(
              "grid gap-2",
              journal.tag ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3",
            )}>
            <div className="rounded-container bg-background p-sm">
              <div className="flex items-center gap-2 sub-text">
                <FileTextIcon className="size-4" />
                <span>{t("common.category")}</span>
              </div>
              <p className="mt-2 font-medium">
                {journal.type || t("common.general")}
              </p>
            </div>

            {journal.tag && (
              <div className="rounded-container bg-background p-sm">
                <div className="flex items-center gap-2 sub-text">
                  <TagIcon className="size-4" />
                  <span>{t("common.tag")}</span>
                </div>
                <p className="mt-2 font-medium">{journal.tag}</p>
              </div>
            )}

            <div className="rounded-container bg-background p-sm">
              <div className="flex items-center gap-2 sub-text">
                <CalendarDaysIcon className="size-4" />
                <span>{t("common.date")}</span>
              </div>
              <p className="mt-2 font-medium">
                {formatDate(journal.createdAt)}
              </p>
            </div>

            <div className="rounded-container bg-background p-sm">
              <div className="flex items-center gap-2 sub-text">
                <ClockIcon className="size-4" />
                <span>{t("common.time")}</span>
              </div>
              <p className="mt-2 font-medium">
                {formatTime(journal.createdAt)}
              </p>
            </div>
          </div>

          <section className="space-y-2">
            <div className="flex items-center gap-2 sub-text">
              <FileTextIcon className="size-4" />
              <span className="font-bold">{t("common.content")}</span>
            </div>

            <RichTextResult
              content={journal.content}
              placeholder={t("journals.contentPlaceholder")}
              containerClassName="bg-background p-4"
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
                className="size-10 justify-center text-foreground/70 hover:text-foreground"
                aria-label={t("common.delete")}>
                <Trash2Icon className="size-4" />
              </Button>
            }
          />
        </form>
      }
    />
  );
}

export default JournalCard;
