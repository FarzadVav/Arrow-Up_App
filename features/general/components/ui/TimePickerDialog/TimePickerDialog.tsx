"use client";

import { ReactElement, useState } from "react";
import { ClockIcon } from "lucide-react";
import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import { Button } from "@/features/general/components/ui/Button/Button";
import TimePicker, { TimePickerProps } from "./TimePicker";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";

export type TimePickerDialogProps = {
  value: string | null;
  onChange: (time: string | null) => void;
  allowClear?: boolean;
  trigger?: ReactElement;
  nativeButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  label?: string;
  title?: string;
  description?: string;
  showIcon?: boolean;
  className?: string;
};

function LocalTimePickerDialog({
  value,
  onChange,
  allowClear = false,
  trigger,
  nativeButton,
  open,
  onOpenChange,
  label,
  title,
  description,
  showIcon = true,
  className = "w-full justify-start rounded-component",
}: TimePickerDialogProps) {
  const { t } = useLocale();
  const resolvedLabel = label ?? t("common.deadline");
  const resolvedTitle = title ?? t("timePicker.title");
  const resolvedDescription = description ?? t("timePicker.description");
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const [draftTime, setDraftTime] = useState(value || "12:00");

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen && value) {
      setDraftTime(value);
    }
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const handleConfirm = () => {
    onChange(draftTime);
    handleOpenChange(false);
  };

  const handleClear = () => {
    onChange(null);
    handleOpenChange(false);
  };

  const displayTime = value ? value : t("common.notSet");

  const computedTrigger = trigger || (
    <Button
      type="button"
      variant="outline"
      className={`${className} ${showIcon ? "gap-xs" : ""}`}
    >
      {showIcon && <ClockIcon className="opacity-70" />}
      <span>
        {resolvedLabel}: {displayTime}
      </span>
    </Button>
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      trigger={computedTrigger}
      nativeButton={nativeButton}>
      <div className="w-80 max-w-full space-y-sm">
        <div>
          <Dialog.Title className="title">{resolvedTitle}</Dialog.Title>
          {resolvedDescription ? (
            <Dialog.Description className="sub-text mt-xs">
              {resolvedDescription}
            </Dialog.Description>
          ) : null}
        </div>

        <TimePicker value={draftTime} onChange={setDraftTime} />

        <div className="flex items-center justify-between gap-sm pt-xs">
          {allowClear && value ? (
            <Button type="button" variant="outline" onClick={handleClear}>
              {t("common.clear")}
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-xs">
            <Dialog.Close
              render={
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleOpenChange(false)}>
                  {t("common.cancel")}
                </Button>
              }
            />

            <Button type="button" variant="primary" onClick={handleConfirm}>
              {t("common.confirm")}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

const TimePickerDialog = Object.assign(LocalTimePickerDialog, {
  Title: Dialog.Title,
  Description: Dialog.Description,
  Close: Dialog.Close,
  Trigger: Dialog.Trigger,
  Picker: TimePicker,
});

export default TimePickerDialog;
export type { TimePickerProps };
