import TopBar from "@/features/general/components/statics/TopBar/TopBar";
import PageWrapper from "@/features/general/components/statics/PageWrapper/PageWrapper";
import PageItemsWrapper from "@/features/general/components/statics/PageItemsWrapper/PageItemsWrapper";
import ContentSuspense from "@/features/general/components/modules/ContentSuspense";
import { getTranslations } from "@/features/general/lib/i18n/server";
import TodosTabs from "@/features/todos/components/statics/TodosTabs/TodosTabs";

export default async function TodosHistoryPage() {
  const { t } = await getTranslations();

  return (
    <PageWrapper>
      <TopBar>
        <TopBar.Btn backIcon href="/todos" position="left" />
        <TopBar.Title asTitle>
          {t("history.title")} - {t("todos.title")}
        </TopBar.Title>
      </TopBar>

      <PageItemsWrapper className="history-page">
        <ContentSuspense fallbackMessage={t("todos.loading")}>
          <TodosTabs isHistory={true} />
        </ContentSuspense>

        <p className="sub-text w-full text-center">{t("history.subtitle")}</p>
      </PageItemsWrapper>
    </PageWrapper>
  );
}
