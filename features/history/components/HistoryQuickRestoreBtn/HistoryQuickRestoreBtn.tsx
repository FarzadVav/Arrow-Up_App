"use client";

import { RotateCcwIcon } from "lucide-react";
import { Button } from "@/features/general/components/ui/Button/Button";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";
import { cn } from "cn";

export interface HistoryQuickRestoreBtnProps {
  onRestore: () => void;
  isRestoring?: boolean;
  className?: string;
}

export function HistoryQuickRestoreBtn({
  onRestore,
  isRestoring = false,
  className,
}: HistoryQuickRestoreBtnProps) {
  const { t } = useLocale();

  return (
    <Button
      type="button"
      variant="card"
      size="square"
      isHistory
      onClick={onRestore}
      disabled={isRestoring}
      aria-label={t("common.restore")}
      title={t("common.restore")}
      className={cn("size-11 shrink-0", className)}
    >
      <RotateCcwIcon
        className={cn("size-4", isRestoring && "animate-spin text-foreground/60")}
      />
    </Button>
  );
}

export default HistoryQuickRestoreBtn;
