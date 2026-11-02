"use client";

import { createContext, PropsWithChildren, useContext, useMemo } from "react";

import { Locale } from "@/features/general/lib/i18n/config";
import { Dictionary, translate } from "@/features/general/lib/i18n/dictionary";
import {
  formatDateForLocale,
  formatDateTimeForLocale,
  formatDeadlineForLocale,
  formatTimeForLocale,
} from "@/features/general/lib/i18n/dates";

type LocaleContextValue = {
  locale: Locale;
  dictionary: Dictionary;
  t: (key: string, vars?: Record<string, string | number>) => string;
  formatDate: (
    value: Date | string | number | null | undefined,
    fallback?: string,
  ) => string;
  formatTime: (
    value: Date | string | number | null | undefined,
    fallback?: string,
  ) => string;
  formatDateTime: (
    value: Date | string | number | null | undefined,
    separator?: string,
    fallback?: string,
  ) => string;
  formatDeadline: (
    deadline: string | null | undefined,
    isDaily?: boolean,
    fallback?: string,
  ) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function LocaleProvider({
  locale,
  dictionary,
  children,
}: PropsWithChildren<{ locale: Locale; dictionary: Dictionary }>) {
  const value = useMemo<LocaleContextValue>(() => {
    const t = (key: string, vars?: Record<string, string | number>) =>
      translate(dictionary, key, vars);

    return {
      locale,
      dictionary,
      t,
      formatDate: (dateValue, fallback = "") =>
        formatDateForLocale(locale, dateValue, fallback),
      formatTime: (timeValue, fallback = "") =>
        formatTimeForLocale(locale, timeValue, fallback),
      formatDateTime: (dateValue, separator = " ", fallback = "") =>
        formatDateTimeForLocale(locale, dateValue, separator, fallback),
      formatDeadline: (
        deadline,
        isDaily = false,
        fallback = t("common.notSet"),
      ) =>
        formatDeadlineForLocale(
          locale,
          deadline,
          isDaily,
          t("dates.to"),
          fallback,
        ),
    };
  }, [locale, dictionary]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }

  return context;
}

export default LocaleProvider;
export { useLocale };
