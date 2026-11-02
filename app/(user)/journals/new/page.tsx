import { Suspense } from "react";
import { getTranslations } from "@/features/general/lib/i18n/server";
import ConnectivityFallback from "@/features/general/components/modules/ConnectivityFallback/ConnectivityFallback";
import JournalForm from "@/features/journals/components/modules/JournalForm/JournalForm";

export default async function NewJournalPage() {
  const { t } = await getTranslations();

  return (
    <Suspense
      fallback={<ConnectivityFallback message={t("common.loading")} />}
    >
      <JournalForm />
    </Suspense>
  );
}
