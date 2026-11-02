"use client";

import { useEffect, useState, useActionState } from "react";
import Field from "@/features/general/components/ui/Field";
import { Trash2Icon, LoaderIcon, GaugeIcon } from "lucide-react";

import type { LifeArea } from "../../types";
import { useLifeAreas } from "../../hooks/useLifeAreas";
import { deleteLifeAreaMutation } from "../../mutations";
import CardDrawer from "@/features/general/components/ui/CardDrawer/CardDrawer";
import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import { Button } from "@/features/general/components/ui/Button/Button";
import { RichTextResult } from "@/features/general/components/ui/RichTextEditor";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";

export interface LifeAreaCardProps {
  lifeArea: LifeArea;
}

export function LifeAreaCard({ lifeArea }: LifeAreaCardProps) {
  const { t } = useLocale();
  const { mutate } = useLifeAreas();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteState, deleteLifeAreaAction, isDeleting] = useActionState(
    deleteLifeAreaMutation,
    undefined,
  );

  useEffect(() => {
    if (!deleteState?.success) return;

    mutate();
  }, [deleteState, mutate]);

  const costValue = lifeArea.difficulty ?? 1;

  return (
    <>
      <CardDrawer
        title={lifeArea.title}
        editHref={`/profile/new-life-area?editId=${lifeArea.id}`}
        badge={
          <span
            className="inline-flex items-center gap-xs rounded-full bg-card-thick px-xs py-xs text-xs font-semibold sub-text"
            title={`${t("lifeAreas.difficulty")}: ${costValue}`}>
            <GaugeIcon className="size-3.5" />
            <span>{costValue}</span>
          </span>
        }
        content={
          <div className="space-y-sm">
            <div className="rounded-component bg-background p-sm">
              <div className="flex items-center gap-xs sub-text">
                <GaugeIcon className="size-4" />
                <span className="text-xs">{t("lifeAreas.difficulty")}</span>
              </div>
              <p className="mt-xs font-medium">{costValue} / 10</p>
            </div>

            <RichTextResult
              content={lifeArea.vision}
              placeholder={t("lifeAreas.visionPlaceholder")}
            />
          </div>
        }
        actions={
          <Button
            type="button"
            variant="card"
            size={"square"}
            disabled={isDeleting}
            aria-label={t("common.delete")}
            onClick={() => setDeleteDialogOpen(true)}>
            <Trash2Icon />
          </Button>
        }
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Title className="title">
          {t("lifeAreas.deleteConfirm")}
        </Dialog.Title>
        <Dialog.Description className="sub-text">
          {t("lifeAreas.deleteDesc")?.replace("{title}", lifeArea.title)}
        </Dialog.Description>

        <div className="actions-footer">
          <Dialog.Close
            render={
              <Button type="button" variant="ghost" disabled={isDeleting}>
                {t("common.cancel")}
              </Button>
            }
          />
          <form
            action={deleteLifeAreaAction}
            onSubmit={() => setDeleteDialogOpen(false)}>
            <Field type="hidden" name="id" value={lifeArea.id} />
            <Button
              type="submit"
              variant="primary"
              disabled={isDeleting}
              >
              {isDeleting ? (
                <span className="flex items-center gap-xs">
                  <LoaderIcon className="animate-spin" />
                  <span>{t("common.loading")}</span>
                </span>
              ) : (
                <span>{t("common.delete")}</span>
              )}
            </Button>
          </form>
        </div>
      </Dialog>
    </>
  );
}

export default LifeAreaCard;
