import { Suspense } from "react";
import { notFound } from "next/navigation";

import ConnectivityFallback from "@/features/general/components/modules/ConnectivityFallback/ConnectivityFallback";
import FrameworkAreaView from "@/features/framework/components/modules/FrameworkAreaView/FrameworkAreaView";
import { parseLifeAreaSlug } from "@/features/general/lib/utils";
import { getTranslations } from "@/features/general/lib/i18n/server";

type PageProps = {
  params: Promise<{ area: string }>;
};

export default async function FrameworkAreaPage({ params }: PageProps) {
  const { area: rawSlug } = await params;
  const lifeAreaId = parseLifeAreaSlug(rawSlug);

  if (lifeAreaId === undefined) {
    notFound();
  }

  const { t } = await getTranslations();

  return (
    <Suspense fallback={<ConnectivityFallback message={t("common.loading")} />}>
      <FrameworkAreaView lifeAreaId={lifeAreaId} />
    </Suspense>
  );
}
