import { Suspense } from "react";
import { getTranslations } from "@/features/general/lib/i18n/server";
import ConnectivityFallback from "@/features/general/components/modules/ConnectivityFallback/ConnectivityFallback";
import { FrameworkForm } from "@/features/framework/components";

export default async function NewHabitPage() {
  const { t } = await getTranslations();

  return (
    <Suspense
      fallback={<ConnectivityFallback message={t("common.loading")} />}
    >
      <FrameworkForm />
    </Suspense>
  );
}
