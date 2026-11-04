import { HistoryIcon } from "lucide-react";
import TopBar from "@/features/general/components/statics/TopBar/TopBar";
import PageActionBtn from "@/features/general/components/modules/PageActionBtn/PageActionBtn";
import PageWrapper from "@/features/general/components/statics/PageWrapper/PageWrapper";
import PageItemsWrapper from "@/features/general/components/statics/PageItemsWrapper/PageItemsWrapper";
import ContentSuspense from "@/features/general/components/modules/ContentSuspense";
import JournalsCategoryList from "@/features/journals/components/statics/JournalsCategoryList/JournalsCategoryList";
import HelpDialog from "@/features/general/components/modules/HelpDialog/HelpDialog";
import { getTranslations } from "@/features/general/lib/i18n/server";

export default async function JournalsPage() {
  const { t } = await getTranslations();

  return (
    <PageWrapper>
      <TopBar>
        <TopBar.Btn
          position="left"
          href="/journals/history"
          aria-label={t("common.history")}
        >
          <HistoryIcon />
        </TopBar.Btn>
        <TopBar.Title asTitle>{t("journals.title")}</TopBar.Title>
        <HelpDialog position="right" />
      </TopBar>

      <PageItemsWrapper>
        <ContentSuspense fallbackMessage={t("journals.loading")}>
          <JournalsCategoryList />
        </ContentSuspense>

        <p className="sub-text w-full text-center">
          {t("journals.subtitle")}
        </p>

        <PageActionBtn href="/journals/new">{t("journals.new")}</PageActionBtn>
      </PageItemsWrapper>
    </PageWrapper>
  );
}
