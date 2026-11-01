"use client";

import { Loader2 } from "lucide-react";

import { useLocale } from "../LocaleProvider/LocaleProvider";

interface ConnectivityFallbackProps {
  message?: string;
}

export default function ConnectivityFallback({
  message,
}: ConnectivityFallbackProps) {
  const { t } = useLocale();

  return (
    <div
      role="status"
      className="w-full py-8 flex items-center justify-center gap-2 text-xs"
    >
      <Loader2 className="size-4 animate-spin" />
      <span>{message ?? t("common.loading")}</span>
    </div>
  );
}
