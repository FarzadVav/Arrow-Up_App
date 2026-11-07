"use client";

import { useState } from "react";
import {
  CalendarDaysIcon,
  ClockIcon,
  CompassIcon,
  FileTextIcon,
  GaugeIcon,
  LoaderIcon,
  Repeat2Icon,
  RotateCcwIcon,
  TagIcon,
  TargetIcon,
  Trash2Icon,
} from "lucide-react";
import CardDrawer from "@/features/general/components/ui/CardDrawer/CardDrawer";
import { Button } from "@/features/general/components/ui/Button/Button";
import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import { RichTextResult } from "@/features/general/components/ui/RichTextEditor";
import { stripHtml } from "@/features/general/lib/utils";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";
import { cn } from "cn";

export type HistoryItem = {
  id: number;
  title: string;
  description?: string;
  content?: string;
  deadline?: string | null;
  difficulty?: number;
  deletedAt?: string | null;
  lifeArea?: { title: string };
  category?: string | { nameEn: string; nameFa: string; slug?: string };
  tag?: string | { nameEn: string; nameFa: string; title?: string };
  actions?: Array<{ id: number; title: string; isDone: boolean }>;
  disciplines?: Array<{ id: number; title: string }>;
  practices?: Array<{ id: number; title: string }>;
  [key: string]: unknown;
};

export interface HistoryCardProps {
  item: HistoryItem;
  type: "daily" | "upcoming" | "missions" | "framework" | "journals";
  onMutated?: () => void;
}

export function HistoryCard({ item, type, onMutated }: HistoryCardProps) {
  const { t, formatDateTime, formatDeadline, locale } = useLocale();
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleRestore = async () => {
    if (isRestoring) return;
    setIsRestoring(true);
    try {
      const res = await fetch("/api/history/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, type }),
      });
      const data = await res.json();
      if (data.success) {
        onMutated?.();
      }
    } catch (err) {
      console.error("Failed to restore entity:", err);
    } finally {
      setIsRestoring(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/history/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, type }),
      });
      const data = await res.json();
      if (data.success) {
        setDeleteDialogOpen(false);
        onMutated?.();
      }
    } catch (err) {
      console.error("Failed to permanently delete entity:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Determine icon & preview
  let icon = <ClockIcon />;
  let subtitle = item.lifeArea?.title ?? "";
  let descriptionPreview = "";

  if (type === "daily") {
    icon = <ClockIcon />;
    descriptionPreview = stripHtml(item.description || "");
  } else if (type === "upcoming") {
    icon = <CalendarDaysIcon />;
    descriptionPreview = stripHtml(item.description || "");
  } else if (type === "missions") {
    icon = <TargetIcon />;
    descriptionPreview = stripHtml(item.description || "");
  } else if (type === "framework") {
    icon = <Repeat2Icon />;
    descriptionPreview = stripHtml(item.content || item.description || "");
  } else if (type === "journals") {
    icon = <FileTextIcon />;
    descriptionPreview = stripHtml(item.content || "");
    subtitle = item.category
      ? typeof item.category === "object"
        ? locale === "fa"
          ? item.category.nameFa
          : item.category.nameEn
        : String(item.category)
      : String(item.type ?? "");
  }

  const tagLabel = item.tag
    ? typeof item.tag === "object"
      ? locale === "fa"
        ? item.tag.nameFa
        : item.tag.nameEn
      : String(item.tag)
    : "";

  const deletedDateStr = item.deletedAt ? formatDateTime(item.deletedAt) : "";

  return (
    <>
      <div className="flex items-center gap-xs w-full">
        <div className="flex-1 min-w-0">
          <CardDrawer
            title={item.title}
            description={descriptionPreview || subtitle}
            date={
              deletedDateStr ? (
                <span className="text-xs sub-text">
                  {t("history.deletedAt")}: {deletedDateStr}
                </span>
              ) : undefined
            }
            icon={
              <div className="size-8 rounded-component bg-foreground/10 flex items-center justify-center shrink-0">
                {icon}
              </div>
            }
            content={
              <div className="space-y-sm">
                <div className="flex items-center gap-sm flex-wrap sub-text text-xs">
                  {item.lifeArea?.title && (
                    <span className="flex items-center gap-xs">
                      <CompassIcon className="size-3.5" />
                      <span>{item.lifeArea.title}</span>
                    </span>
                  )}
                  {tagLabel && (
                    <span className="flex items-center gap-xs">
                      <TagIcon className="size-3.5" />
                      <span>{tagLabel}</span>
                    </span>
                  )}
                  {item.deadline && (
                    <span className="flex items-center gap-xs">
                      <CalendarDaysIcon className="size-3.5" />
                      <span>{formatDeadline(item.deadline, type === "daily")}</span>
                    </span>
                  )}
                  {item.difficulty && (
                    <span className="flex items-center gap-xs">
                      <GaugeIcon className="size-3.5" />
                      <span>{item.difficulty}</span>
                    </span>
                  )}
                </div>

                {/* Content / Notes */}
                {(item.description || item.content) && (
                  <RichTextResult
                    content={item.content || item.description}
                    containerClassName="bg-background/60 p-sm rounded-component"
                  />
                )}

                {/* Framework practices if framework */}
                {type === "framework" && item.practices && item.practices.length > 0 && (
                  <div className="space-y-xs">
                    <span className="font-semibold text-xs sub-text">{t("framework.practices")}</span>
                    <div className="space-y-xs">
                      {item.practices.map((practice) => (
                        <div
                          key={practice.id}
                          className="flex items-center gap-xs rounded-component bg-background/40 p-xs text-xs"
                        >
                          <span className="flex-1">
                            {practice.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mission Actions / Disciplines if mission */}
                {type === "missions" && item.actions && item.actions.length > 0 && (
                  <div className="space-y-xs">
                    <span className="font-semibold text-xs sub-text">{t("missions.actions")}</span>
                    <div className="space-y-xs">
                      {item.actions.map((act) => (
                        <div
                          key={act.id}
                          className="flex items-center gap-xs rounded-component bg-background/40 p-xs text-xs"
                        >
                          <span className={cn("flex-1", act.isDone && "line-through text-foreground/50")}>
                            {act.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            }
            actions={
              <div className="flex items-center gap-xs">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleRestore}
                  disabled={isRestoring}
                  className="gap-xs"
                >
                  {isRestoring ? (
                    <LoaderIcon className="size-4 animate-spin" />
                  ) : (
                    <RotateCcwIcon className="size-4" />
                  )}
                  <span>{t("common.restore")}</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={isDeleting}
                  className="text-red-500 hover:text-red-600"
                  aria-label={t("common.permanentDelete")}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
            }
          />
        </div>

        {/* Quick Restore Button on Card */}
        <Button
          type="button"
          variant="card"
          size="square"
          onClick={handleRestore}
          disabled={isRestoring}
          aria-label={t("common.restore")}
          title={t("common.restore")}
          className="size-11 shrink-0"
        >
          <RotateCcwIcon className={cn("size-4", isRestoring && "animate-spin text-foreground/60")} />
        </Button>
      </div>

      {/* Permanent Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Title className="title">
          {t("common.permanentDelete")}
        </Dialog.Title>
        <Dialog.Description className="sub-text">
          {t("common.permanentDeleteConfirm")}
        </Dialog.Description>

        <div className="actions-footer">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handlePermanentDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <span className="flex items-center gap-xs">
                <LoaderIcon className="size-4 animate-spin" />
                <span>{t("common.loading")}</span>
              </span>
            ) : (
              <span>{t("common.delete")}</span>
            )}
          </Button>
        </div>
      </Dialog>
    </>
  );
}

export default HistoryCard;
