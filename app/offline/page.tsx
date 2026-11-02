import { WifiOff } from "lucide-react";
import { getTranslations } from "@/features/general/lib/i18n/server";
import OfflineRetryBtn from "@/features/general/components/modules/OfflineRetryBtn/OfflineRetryBtn";

export default async function OfflinePage() {
  const { t } = await getTranslations();

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-sm">
      <div className="w-full max-w-sm rounded-container bg-card p-md sm:p-md flex flex-col items-center text-center shadow-lg">
        <div className="size-16 rounded-container bg-card-thick flex items-center justify-center mb-md">
          <WifiOff />
        </div>

        <h1 className="text-xl font-bold">
          {t("offline.title")}
        </h1>

        <p className="mt-xs text-xs sm:text-sm leading-relaxed">
          {t("offline.description")}
        </p>

        <OfflineRetryBtn retryText={t("offline.retry")} />
      </div>
    </main>
  );
}
