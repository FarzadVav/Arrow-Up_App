import { Suspense } from "react";

import { getTranslations } from "@/features/general/lib/i18n/server";
import TopBar from "@/features/general/components/static/TopBar/TopBar";
import TodosTabs from "@/features/todos/components/TodosTabs/TodosTabs";
import TodosActionBtn from "@/features/todos/components/TodosActionBtn/TodosActionBtn";
import PageWrapper from "@/features/general/components/static/PageWrapper/PageWrapper";
import PageActionBtn from "@/features/general/components/module/PageActionBtn/PageActionBtn";
import PageItemsWrapper from "@/features/general/components/static/PageItemsWrapper/PageItemsWrapper";
import ConnectivityFallback from "@/features/general/components/module/ConnectivityFallback/ConnectivityFallback";

import HelpDialog from "@/features/general/components/module/HelpDialog/HelpDialog";

async function TodosPage() {
  const { t } = await getTranslations();

  return (
    <PageWrapper>
      <TopBar>
        <TopBar.Title asTitle>{t("todos.title")}</TopBar.Title>
        <HelpDialog position="right" />
      </TopBar>

      <PageItemsWrapper>
        <Suspense
          fallback={<ConnectivityFallback message={t("todos.loading")} />}>
          <TodosTabs />
        </Suspense>

        <p className="sub-text w-full text-center">{t("todos.subtitle")}</p>

        <Suspense>
          <TodosActionBtn />
        </Suspense>
      </PageItemsWrapper>
    </PageWrapper>
  );
}

export default TodosPage;
