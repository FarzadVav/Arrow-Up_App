"use client";

import { cn } from "cn";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import SelectDialog from "../../ui/SelectDialog";
import { useLocale } from "../LocaleProvider/LocaleProvider";

type ThemeSwitcherProps = {
  className?: string;
};

function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { t } = useLocale();

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  const items = [
    { value: "light", label: t("colorScheme.light") },
    { value: "dark", label: t("colorScheme.dark") },
    { value: "system", label: t("colorScheme.system") },
  ];

  return (
    <SelectDialog
      items={items}
      title={t("profile.colorScheme")}
      className={cn("w-1/2", className)}
      value={mounted ? theme : undefined}
      placeholder={t("profile.colorScheme")}
      onChange={(nextValue) => {
        if (nextValue) {
          setTheme(nextValue);
        }
      }}
    />
  );
}

export default ThemeSwitcher;
