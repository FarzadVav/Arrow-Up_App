import { Suspense } from "react";

import TopBar from "@/features/general/components/static/TopBar/TopBar";
import PageWrapper from "@/features/general/components/static/PageWrapper/PageWrapper";
import PageItemsWrapper from "@/features/general/components/static/PageItemsWrapper/PageItemsWrapper";
import ConnectivityFallback from "@/features/general/components/module/ConnectivityFallback/ConnectivityFallback";
import PageActionBtn from "@/features/general/components/module/PageActionBtn/PageActionBtn";
import HelpDialog from "@/features/general/components/module/HelpDialog/HelpDialog";
import FrameworksAreaList from "@/features/framework/components/FrameworksAreaList/FrameworksAreaList";
import { getTranslations } from "@/features/general/lib/i18n/server";

export default async function HabitsPage() {
  const { t } = await getTranslations();

  return (
    <PageWrapper>
      <TopBar>
        <TopBar.Title asTitle>{t("framework.title")}</TopBar.Title>
        <HelpDialog position="right" />
      </TopBar>

      <PageItemsWrapper>
        <Suspense fallback={<ConnectivityFallback message={t("common.loading")} />}>
          <FrameworksAreaList />
        </Suspense>

        <p className="sub-text w-full text-center">
          {t("framework.subtitle")}
        </p>

        <PageActionBtn href="/framework/new">{t("framework.new")}</PageActionBtn>
      </PageItemsWrapper>
    </PageWrapper>
  );
}
