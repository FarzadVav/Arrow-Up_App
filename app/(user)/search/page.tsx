import { Suspense } from "react";
import PageWrapper from "@/features/general/components/statics/PageWrapper/PageWrapper";
import PageItemsWrapper from "@/features/general/components/statics/PageItemsWrapper/PageItemsWrapper";
import TopBar from "@/features/general/components/statics/TopBar/TopBar";
import HelpDialog from "@/features/general/components/modules/HelpDialog/HelpDialog";
import Skeleton from "@/features/general/components/ui/Skeleton";
import { getTranslations } from "@/features/general/lib/i18n/server";
import { SearchModule } from "@/features/search";

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; tab?: string; filter?: string }>;
}) {
  const sp = await searchParams;
  const { t } = await getTranslations();

  return (
    <PageWrapper>
      <TopBar>
        <TopBar.Btn backIcon href="/profile" position="left" />
        <TopBar.Title asTitle>{t("search.title")}</TopBar.Title>
        <HelpDialog position="right" />
      </TopBar>

      <PageItemsWrapper>
        <Suspense
          fallback={
            <div className="w-full space-y-sm">
              <Skeleton count={3} />
            </div>
          }>
          <SearchModule
            initialQuery={sp?.q}
            initialTab={sp?.tab}
            initialFilter={sp?.filter}
          />
        </Suspense>

        <p className="sub-text w-full text-center">{t("search.subtitle")}</p>
      </PageItemsWrapper>
    </PageWrapper>
  );
}
