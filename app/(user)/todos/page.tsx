import { Suspense } from "react";

import { getTranslations } from "@/features/general/lib/i18n/server";
import TopBar from "@/features/general/components/statics/TopBar/TopBar";
import TodosTabs from "@/features/todos/components/statics/TodosTabs/TodosTabs";
import TodosActionBtn from "@/features/todos/components/modules/TodosActionBtn/TodosActionBtn";
import PageWrapper from "@/features/general/components/statics/PageWrapper/PageWrapper";
import PageActionBtn from "@/features/general/components/modules/PageActionBtn/PageActionBtn";
import PageItemsWrapper from "@/features/general/components/statics/PageItemsWrapper/PageItemsWrapper";
import ConnectivityFallback from "@/features/general/components/modules/ConnectivityFallback/ConnectivityFallback";

import HelpDialog from "@/features/general/components/modules/HelpDialog/HelpDialog";

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
