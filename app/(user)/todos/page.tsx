import { Suspense } from "react";
import TopBar from "@/features/general/components/statics/TopBar/TopBar";
import TodosTabs from "@/features/todos/components/statics/TodosTabs/TodosTabs";
import TodosActionBtn from "@/features/todos/components/modules/TodosActionBtn/TodosActionBtn";
import PageWrapper from "@/features/general/components/statics/PageWrapper/PageWrapper";
import PageItemsWrapper from "@/features/general/components/statics/PageItemsWrapper/PageItemsWrapper";
import ContentSuspense from "@/features/general/components/modules/ContentSuspense";
import HelpDialog from "@/features/general/components/modules/HelpDialog/HelpDialog";
import { getTranslations } from "@/features/general/lib/i18n/server";

export default async function TodosPage() {
  const { t } = await getTranslations();

  return (
    <PageWrapper>
      <TopBar>
        <TopBar.Title asTitle>{t("todos.title")}</TopBar.Title>
        <HelpDialog position="right" />
      </TopBar>

      <PageItemsWrapper>
        <ContentSuspense fallbackMessage={t("todos.loading")}>
          <TodosTabs />
        </ContentSuspense>

        <p className="sub-text w-full text-center">{t("todos.subtitle")}</p>

        <Suspense>
          <TodosActionBtn />
        </Suspense>
      </PageItemsWrapper>
    </PageWrapper>
  );
}
