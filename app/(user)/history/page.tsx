import { Suspense } from "react";
import TopBar from "@/features/general/components/statics/TopBar/TopBar";
import PageWrapper from "@/features/general/components/statics/PageWrapper/PageWrapper";
import PageItemsWrapper from "@/features/general/components/statics/PageItemsWrapper/PageItemsWrapper";
import ContentSuspense from "@/features/general/components/modules/ContentSuspense";
import { getTranslations } from "@/features/general/lib/i18n/server";
import HistoryTabs from "@/features/history/components/HistoryTabs/HistoryTabs";

export default async function HistoryPage() {
  const { t } = await getTranslations();

  return (
    <PageWrapper>
      <TopBar>
        <TopBar.Btn backIcon goBack position="left" />
        <TopBar.Title asTitle>{t("history.title")}</TopBar.Title>
      </TopBar>

      <PageItemsWrapper>
        <ContentSuspense fallbackMessage={t("common.loading")}>
          <Suspense>
            <HistoryTabs />
          </Suspense>
        </ContentSuspense>

        <p className="sub-text w-full text-center">
          {t("history.subtitle")}
        </p>
      </PageItemsWrapper>
    </PageWrapper>
  );
}
