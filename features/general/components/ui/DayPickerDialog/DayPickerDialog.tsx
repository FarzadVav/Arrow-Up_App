"use client";

import { ReactElement, useState } from "react";
import { CalendarDaysIcon } from "lucide-react";
import { enUS } from "@daypicker/persian";

import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import { Button } from "@/features/general/components/ui/Button/Button";
import DayPicker, { DayPickerProps } from "./DayPicker";
import { formatPersianDate as formatPersianDateUtil } from "@/features/general/lib/utils";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";

export function formatPersianDate(date: Date | null): string {
  return formatPersianDateUtil(date);
}

export type DayPickerDialogProps = {
  value: Date | null;
  onChange: (date: Date | null) => void;
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
  dir?: "ltr" | "rtl";
  locale?: typeof enUS;
  formatDate?: (date: Date | null) => string;
};

function LocalDayPickerDialog({
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
  showIcon = false,
  className = "w-full justify-start rounded-component",
  dir,
  locale = enUS,
  formatDate,
}: DayPickerDialogProps) {
  const { formatDate: localeFormatDate, t, locale: activeLocale } = useLocale();
  const effectiveDir = dir ?? (activeLocale === "fa" ? "rtl" : "ltr");
  const resolvedLabel = label ?? t("common.deadline");
  const formatDateValue =
    formatDate ??
    ((date: Date | null) => localeFormatDate(date, t("common.notSet")));
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const handleSelectDate = (selectedDate: Date | null) => {
    onChange(selectedDate);
    handleOpenChange(false);
  };

  const computedTrigger = trigger || (
    <Button
      type="button"
      variant="outline"
      className={`${className} ${showIcon ? "gap-2" : ""}`}>
      {showIcon && <CalendarDaysIcon className="opacity-70" />}
      <span>
        {resolvedLabel}: {formatDateValue(value)}
      </span>
    </Button>
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      trigger={computedTrigger}
      nativeButton={nativeButton}>
      {title ? (
        <>
          <Dialog.Title className="title">{title}</Dialog.Title>
          {description ? (
            <Dialog.Description className="sub-text">
              {description}
            </Dialog.Description>
          ) : null}
        </>
      ) : (
        <Dialog.Title className="sr-only">
          {t("common.selectDate")}
        </Dialog.Title>
      )}

      <DayPicker
        dir={effectiveDir}
        locale={locale}
        value={value}
        onChange={handleSelectDate}
      />

      <div className="actions-footer">
        {allowClear && value !== null ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSelectDate(null)}>
            {t("common.clear")}
          </Button>
        ) : (
          <div />
        )}

        <Dialog.Close
          render={
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}>
              {t("common.close")}
            </Button>
          }
        />
      </div>
    </Dialog>
  );
}

const DayPickerDialog = Object.assign(LocalDayPickerDialog, {
  Title: Dialog.Title,
  Description: Dialog.Description,
  Close: Dialog.Close,
  Trigger: Dialog.Trigger,
  Picker: DayPicker,
});

export default DayPickerDialog;
export type { DayPickerProps };
