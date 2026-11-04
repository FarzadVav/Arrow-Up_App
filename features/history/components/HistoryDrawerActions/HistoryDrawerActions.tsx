"use client";

import { RotateCcwIcon, Trash2Icon, LoaderIcon } from "lucide-react";
import { Button } from "@/features/general/components/ui/Button/Button";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";

export interface HistoryDrawerActionsProps {
  onRestore: () => void;
  onRequestDelete: () => void;
  isRestoring?: boolean;
  isDeleting?: boolean;
}

export function HistoryDrawerActions({
  onRestore,
  onRequestDelete,
  isRestoring = false,
  isDeleting = false,
}: HistoryDrawerActionsProps) {
  const { t } = useLocale();

  return (
    <div className="flex items-center gap-xs">
      <Button
        type="button"
        variant="primary"
        isHistory
        onClick={onRestore}
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
        isHistory
        onClick={onRequestDelete}
        disabled={isDeleting}
        className="text-red-500 hover:text-red-600"
        aria-label={t("common.permanentDelete")}
      >
        <Trash2Icon className="size-4" />
      </Button>
    </div>
  );
}

export default HistoryDrawerActions;
