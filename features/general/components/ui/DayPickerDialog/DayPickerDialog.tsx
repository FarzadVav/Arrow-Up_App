"use client";

import { cn } from "cn";
import { enUS } from "@daypicker/persian";
import { ReactElement, useState } from "react";
import { CalendarDaysIcon } from "lucide-react";

import DayPicker, { DayPickerProps } from "./DayPicker";
import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import { Button } from "@/features/general/components/ui/Button/Button";
import { formatPersianDate as formatPersianDateUtil } from "@/features/general/lib/utils";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";

export function formatPersianDate(date: Date | null): string {
  return formatPersianDateUtil(date);
}

export type DayPickerDialogProps = {
  value: Date | null;
  onChange: (date: Date | null) => void;
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
  allowClear?: boolean;
};

function LocalDayPickerDialog({
  value,
  onChange,
  trigger,
  nativeButton,
  open,
  onOpenChange,
  label,
  title,
  description,
  showIcon = false,
  className,
  dir,
  locale = enUS,
  formatDate,
  allowClear = false,
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

  const handleClear = () => {
    onChange(null);
  };

  const computedTrigger = trigger || (
    <Button
      type="button"
      size={"full"}
      variant="outline"
      className={cn(
        "justify-between",
        className
      )}>
      {showIcon && <CalendarDaysIcon />}
      <span>
        {resolvedLabel}: {formatDateValue(value)}
      </span>
    </Button>
  );

  return (
    <Dialog
      open={isOpen}
      trigger={computedTrigger}
      onOpenChange={handleOpenChange}
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
        value={value}
        locale={locale}
        dir={effectiveDir}
        onChange={handleSelectDate}
      />

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
              onClick={() => handleOpenChange(false)}>
              {t("common.confirm")}
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
