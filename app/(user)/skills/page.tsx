import { Suspense } from "react";

import TopBar from "@/features/general/components/static/TopBar/TopBar";
import PageWrapper from "@/features/general/components/static/PageWrapper/PageWrapper";
import PageItemsWrapper from "@/features/general/components/static/PageItemsWrapper/PageItemsWrapper";
import ConnectivityFallback from "@/features/general/components/module/ConnectivityFallback/ConnectivityFallback";
import PageActionBtn from "@/features/general/components/module/PageActionBtn/PageActionBtn";
import HelpDialog from "@/features/general/components/module/HelpDialog/HelpDialog";
import SkillsAreaList from "@/features/skills/components/SkillsAreaList/SkillsAreaList";
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
        <Suspense fallback={<ConnectivityFallback message={t("common.loading")} />}>
          <SkillsAreaList />
        </Suspense>

        <p className="sub-text w-full text-center">
          {t("skills.subtitle")}
        </p>

        <PageActionBtn href="/skills/new">{t("skills.new")}</PageActionBtn>
      </PageItemsWrapper>
    </PageWrapper>
  );
}
