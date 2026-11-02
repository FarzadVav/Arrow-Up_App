import { Suspense } from "react";
import { getTranslations } from "@/features/general/lib/i18n/server";
import ConnectivityFallback from "@/features/general/components/modules/ConnectivityFallback/ConnectivityFallback";
import { SkillForm } from "@/features/skills/components";

export default async function NewSkillPage() {
  const { t } = await getTranslations();

  return (
    <Suspense
      fallback={<ConnectivityFallback message={t("common.loading")} />}
    >
      <SkillForm />
    </Suspense>
  );
}
