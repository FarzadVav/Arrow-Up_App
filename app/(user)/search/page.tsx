import PageWrapper from "@/features/general/components/static/PageWrapper/PageWrapper";
import TopBar from "@/features/general/components/static/TopBar/TopBar";
import { getTranslations } from "@/features/general/lib/i18n/server";

import HelpDialog from "@/features/general/components/module/HelpDialog/HelpDialog";

async function SearchPage() {
  const { t } = await getTranslations();

  return (
    <PageWrapper>
      <TopBar>
        <TopBar.Title asTitle>{t("search.title")}</TopBar.Title>
        <TopBar.Btn backIcon href="/profile" position="left" />
        <HelpDialog position="right" />
      </TopBar>
      <div className="flex flex-1 items-center justify-center p-md text-center sub-text">
        {t("search.title")}
      </div>
    </PageWrapper>
  );
}

export default SearchPage;
