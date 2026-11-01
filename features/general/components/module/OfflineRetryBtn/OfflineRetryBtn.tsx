"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/features/general/components/ui/Button/Button";
import { useLocale } from "../LocaleProvider/LocaleProvider";

type OfflineRetryBtnProps = {
  retryText?: string;
};

export function OfflineRetryBtn({ retryText }: OfflineRetryBtnProps) {
  const { t } = useLocale();
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      window.location.reload();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    window.location.reload();
  };

  return (
    <Button
      variant="primary"
      onClick={handleRetry}
      disabled={isRetrying}
      className="mt-md w-full h-10 rounded-component text-xs sm:text-sm font-semibold flex items-center justify-center gap-2">
      <RefreshCw className={`size-4 ${isRetrying ? "animate-spin" : ""}`} />
      <span>{retryText || t("offline.retry")}</span>
    </Button>
  );
}

export default OfflineRetryBtn;
