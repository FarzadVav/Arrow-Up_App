"use client";

import { useEffect, useState, useActionState } from "react";
import Field from "@/features/general/components/ui/Field";
import { Trash2Icon, LoaderIcon } from "lucide-react";

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

  return (
    <>
      <CardDrawer
        title={lifeArea.title}
        editHref={`/profile/new-life-area?editId=${lifeArea.id}`}
        content={
          <RichTextResult
            content={lifeArea.vision}
            placeholder={t("lifeAreas.visionPlaceholder")}
          />
        }
        actions={
          <Button
            type="button"
            variant="card"
            size={"square"}
            disabled={isDeleting}
            aria-label={t("common.delete")}
            onClick={() => setDeleteDialogOpen(true)}>
            <Trash2Icon className="size-4" />
          </Button>
        }
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <div className="p-1 space-y-4">
          <div>
            <Dialog.Title className="font-bold">
              {t("lifeAreas.deleteConfirm")}
            </Dialog.Title>
            <Dialog.Description className="sub-text text-xs mt-1">
              {t("lifeAreas.deleteDesc")?.replace("{title}", lifeArea.title)}
            </Dialog.Description>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
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
                className="bg-red-600 text-white hover:bg-red-700">
                {isDeleting ? (
                  <span className="flex items-center gap-xs">
                    <LoaderIcon className="size-4 animate-spin" />
                    <span>{t("common.loading")}</span>
                  </span>
                ) : (
                  <span>{t("common.delete")}</span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </Dialog>
    </>
  );
}

export default LifeAreaCard;
