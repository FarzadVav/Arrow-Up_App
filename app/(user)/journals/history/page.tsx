import TopBar from "@/features/general/components/statics/TopBar/TopBar";
import PageWrapper from "@/features/general/components/statics/PageWrapper/PageWrapper";
import PageItemsWrapper from "@/features/general/components/statics/PageItemsWrapper/PageItemsWrapper";
import ContentSuspense from "@/features/general/components/modules/ContentSuspense";
import JournalsCategoryList from "@/features/journals/components/statics/JournalsCategoryList/JournalsCategoryList";
import { getTranslations } from "@/features/general/lib/i18n/server";

export default async function JournalsHistoryPage() {
  const { t } = await getTranslations();

  return (
    <PageWrapper>
      <TopBar>
        <TopBar.Btn backIcon href="/journals" position="left" />
        <TopBar.Title asTitle>
          {t("history.title")} - {t("journals.title")}
        </TopBar.Title>
      </TopBar>

      <PageItemsWrapper className="history-page">
        <ContentSuspense fallbackMessage={t("journals.loading")}>
          <JournalsCategoryList isHistory={true} />
        </ContentSuspense>

        <p className="sub-text w-full text-center">{t("history.subtitle")}</p>
      </PageItemsWrapper>
    </PageWrapper>
  );
}
