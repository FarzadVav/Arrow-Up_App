import { Suspense } from "react";

import TopBar from "@/features/general/components/static/TopBar/TopBar";
import PageActionBtn from "@/features/general/components/module/PageActionBtn/PageActionBtn";
import PageWrapper from "@/features/general/components/static/PageWrapper/PageWrapper";
import PageItemsWrapper from "@/features/general/components/static/PageItemsWrapper/PageItemsWrapper";
import ConnectivityFallback from "@/features/general/components/module/ConnectivityFallback/ConnectivityFallback";
import JournalsCategoryList from "@/features/journals/components/JournalsCategoryList/JournalsCategoryList";
import { getTranslations } from "@/features/general/lib/i18n/server";

import HelpDialog from "@/features/general/components/module/HelpDialog/HelpDialog";

async function JournalsPage() {
  const { t } = await getTranslations();

  return (
    <PageWrapper>
      <TopBar>
        <TopBar.Title asTitle>{t("journals.title")}</TopBar.Title>
        <HelpDialog position="right" />
      </TopBar>

      <PageItemsWrapper>
        <Suspense
          fallback={
            <ConnectivityFallback message={t("journals.loading")} />
          }
        >
          <JournalsCategoryList />
        </Suspense>

        <p className="sub-text w-full text-center">
          {t("journals.subtitle")}
        </p>

        <PageActionBtn href="/journals/new">{t("journals.new")}</PageActionBtn>
      </PageItemsWrapper>
    </PageWrapper>
  );
}

export default JournalsPage;
