"use client";

import "@daypicker/react/style.css";
import { ComponentProps } from "react";
import { DayPicker as GregorianDayPicker } from "@daypicker/react";
import { DayPicker as PersianDayPicker, enUS } from "@daypicker/persian";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";

import "./datepicker.css";
import { cn } from "cn";

export type DayPickerProps = Omit<
  ComponentProps<typeof PersianDayPicker>,
  "mode" | "selected" | "onSelect"
> & {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
};

export default function DayPicker({
  dir,
  value,
  onChange,
  className,
  animate = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  locale: _locale,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  numerals: _numerals,
  ...rest
}: DayPickerProps) {
  const { locale } = useLocale();
  const effectiveDir = dir ?? (locale === "fa" ? "rtl" : "ltr");

  const sharedProps = {
    mode: "single" as const,
    dir: effectiveDir,
    animate,
    selected: value ?? undefined,
    onSelect: (date: Date | undefined) => {
      onChange?.(date ?? null);
    },
    className: cn("mx-auto", className),
    ...rest,
  };

  if (locale === "fa") {
    return (
      <PersianDayPicker
        locale={enUS}
        numerals="latn"
        {...(sharedProps as ComponentProps<typeof PersianDayPicker>)}
      />
    );
  }

  return (
    <GregorianDayPicker
      {...(sharedProps as ComponentProps<typeof GregorianDayPicker>)}
    />
  );
}
