import { WifiOff } from "lucide-react";
import { getTranslations } from "@/features/general/lib/i18n/server";
import OfflineRetryBtn from "@/features/general/components/module/OfflineRetryBtn/OfflineRetryBtn";

export default async function OfflinePage() {
  const { t } = await getTranslations();

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-container bg-card border border-foreground/15 p-md sm:p-8 flex flex-col items-center text-center shadow-lg">
        <div className="size-16 rounded-container bg-card-thick border border-foreground/10 flex items-center justify-center mb-5 text-foreground">
          <WifiOff className="size-8" />
        </div>

        <h1 className="text-xl font-bold text-foreground">
          {t("offline.title")}
        </h1>

        <p className="mt-2 text-xs sm:text-sm text-foreground/60 leading-relaxed">
          {t("offline.description")}
        </p>

        <OfflineRetryBtn retryText={t("offline.retry")} />
      </div>
    </main>
  );
}
