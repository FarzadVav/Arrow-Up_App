"use client";

import { ClockIcon } from "lucide-react";
import { ReactElement, useState } from "react";

import TimePicker, { TimePickerProps } from "./TimePicker";
import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import { Button } from "@/features/general/components/ui/Button/Button";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";

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
      <Dialog.Title className="title">{resolvedTitle}</Dialog.Title>
      {resolvedDescription ? (
        <Dialog.Description className="sub-text">
          {resolvedDescription}
        </Dialog.Description>
      ) : null}

      <TimePicker value={draftTime} onChange={setDraftTime} />

      <div className="actions-footer">
        {allowClear && value ? (
          <Button type="button" variant="outline" onClick={handleClear}>
            {t("common.clear")}
          </Button>
        ) : null}
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
