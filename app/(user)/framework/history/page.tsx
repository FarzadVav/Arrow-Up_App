import TopBar from "@/features/general/components/statics/TopBar/TopBar";
import PageWrapper from "@/features/general/components/statics/PageWrapper/PageWrapper";
import PageItemsWrapper from "@/features/general/components/statics/PageItemsWrapper/PageItemsWrapper";
import ContentSuspense from "@/features/general/components/modules/ContentSuspense";
import FrameworksAreaList from "@/features/framework/components/statics/FrameworksAreaList/FrameworksAreaList";
import { getTranslations } from "@/features/general/lib/i18n/server";

export default async function FrameworkHistoryPage() {
  const { t } = await getTranslations();

  return (
    <PageWrapper>
      <TopBar>
        <TopBar.Btn backIcon href="/framework" position="left" />
        <TopBar.Title asTitle>
          {t("history.title")} - {t("framework.title")}
        </TopBar.Title>
      </TopBar>

      <PageItemsWrapper className="history-page">
        <ContentSuspense fallbackMessage={t("common.loading")}>
          <FrameworksAreaList isHistory={true} />
        </ContentSuspense>

        <p className="sub-text w-full text-center">{t("history.subtitle")}</p>
      </PageItemsWrapper>
    </PageWrapper>
  );
}
