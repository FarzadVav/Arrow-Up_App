import { HistoryIcon } from "lucide-react";
import TopBar from "@/features/general/components/statics/TopBar/TopBar";
import PageWrapper from "@/features/general/components/statics/PageWrapper/PageWrapper";
import PageItemsWrapper from "@/features/general/components/statics/PageItemsWrapper/PageItemsWrapper";
import ContentSuspense from "@/features/general/components/modules/ContentSuspense";
import PageActionBtn from "@/features/general/components/modules/PageActionBtn/PageActionBtn";
import HelpDialog from "@/features/general/components/modules/HelpDialog/HelpDialog";
import FrameworksAreaList from "@/features/framework/components/statics/FrameworksAreaList/FrameworksAreaList";
import { getTranslations } from "@/features/general/lib/i18n/server";

export default async function FrameworkPage() {
  const { t } = await getTranslations();

  return (
    <PageWrapper>
      <TopBar>
        <TopBar.Btn
          position="left"
          href="/history?tab=framework"
          aria-label={t("common.history")}
        >
          <HistoryIcon />
        </TopBar.Btn>
        <TopBar.Title asTitle>{t("framework.title")}</TopBar.Title>
        <HelpDialog position="right" />
      </TopBar>

      <PageItemsWrapper>
        <ContentSuspense fallbackMessage={t("common.loading")}>
          <FrameworksAreaList />
        </ContentSuspense>

        <p className="sub-text w-full text-center">
          {t("framework.subtitle")}
        </p>

        <PageActionBtn href="/framework/new">{t("framework.new")}</PageActionBtn>
      </PageItemsWrapper>
    </PageWrapper>
  );
}
