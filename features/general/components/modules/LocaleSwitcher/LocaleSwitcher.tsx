"use client";

import { cn } from "cn";

import SelectDialog from "../../ui/SelectDialog";
import { Locale } from "@/features/general/lib/i18n/config";
import { useLocale } from "../LocaleProvider/LocaleProvider";
import { changeLocale } from "@/features/general/api/functions";

type LocaleSwitcherProps = {
  className?: string;
};

function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const { locale, t } = useLocale();

  const items = [
    { value: "en" as const, label: t("language.english") },
    { value: "fa" as const, label: t("language.persian") },
  ];

  return (
    <SelectDialog
      items={items}
      value={locale}
      title={t("profile.language")}
      className={cn("w-1/2", className)}
      placeholder={t("profile.language")}
      onChange={(nextValue) => {
        if (nextValue) {
          changeLocale(nextValue as Locale);
        }
      }}
    />
  );
}

export default LocaleSwitcher;
