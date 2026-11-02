import TopBar from "@/features/general/components/statics/TopBar/TopBar";
import PageWrapper from "@/features/general/components/statics/PageWrapper/PageWrapper";
import PageItemsWrapper from "@/features/general/components/statics/PageItemsWrapper/PageItemsWrapper";
import ContentSuspense from "@/features/general/components/modules/ContentSuspense";
import PageActionBtn from "@/features/general/components/modules/PageActionBtn/PageActionBtn";
import HelpDialog from "@/features/general/components/modules/HelpDialog/HelpDialog";
import SkillsAreaList from "@/features/skills/components/statics/SkillsAreaList/SkillsAreaList";
import { getTranslations } from "@/features/general/lib/i18n/server";

export default async function SkillsPage() {
  const { t } = await getTranslations();

  return (
    <PageWrapper>
      <TopBar>
        <TopBar.Title asTitle>{t("skills.title")}</TopBar.Title>
        <HelpDialog position="right" />
      </TopBar>

      <PageItemsWrapper>
        <ContentSuspense fallbackMessage={t("common.loading")}>
          <SkillsAreaList />
        </ContentSuspense>

        <p className="sub-text w-full text-center">
          {t("skills.subtitle")}
        </p>

        <PageActionBtn href="/skills/new">{t("skills.new")}</PageActionBtn>
      </PageItemsWrapper>
    </PageWrapper>
  );
}
