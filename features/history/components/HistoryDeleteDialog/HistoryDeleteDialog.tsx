"use client";

import { LoaderIcon } from "lucide-react";
import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import { Button } from "@/features/general/components/ui/Button/Button";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";

export interface HistoryDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function HistoryDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: HistoryDeleteDialogProps) {
  const { t } = useLocale();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          isHistory
          onClick={() => onOpenChange(false)}
          disabled={isDeleting}
        >
          {t("common.cancel")}
        </Button>
        <Button
          type="button"
          variant="primary"
          isHistory
          onClick={onConfirm}
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
  );
}

export default HistoryDeleteDialog;
