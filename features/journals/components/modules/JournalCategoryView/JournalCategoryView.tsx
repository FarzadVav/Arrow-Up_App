"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useJournals, useJournalTags } from "@/features/journals/hooks";
import type {
  JournalCategory,
  JournalCategoryDefinition,
  JournalType,
} from "@/features/journals/lib/types";
import {
  getJournalCategory,
  getCategoryStaticTags,
} from "@/features/journals/lib/utils";
import JournalCard from "../JournalCard/JournalCard";
import TopBar from "@/features/general/components/statics/TopBar/TopBar";
import HelpDialog from "@/features/general/components/modules/HelpDialog/HelpDialog";
import PageActionBtn from "@/features/general/components/modules/PageActionBtn/PageActionBtn";
import PageWrapper from "@/features/general/components/statics/PageWrapper/PageWrapper";
import PageItemsWrapper from "@/features/general/components/statics/PageItemsWrapper/PageItemsWrapper";
import EmptyAlert from "@/features/general/components/statics/EmptyAlert";
import Skeleton from "@/features/general/components/ui/Skeleton";
import SlideTabs, { SlideTabItem } from "@/features/general/components/ui/SlideTabs";
import ReorderList from "@/features/general/components/ui/ReorderList";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";

export type JournalCategoryViewProps = {
  category: JournalCategoryDefinition | JournalType;
  title: string;
  isHistory?: boolean;
};

export function JournalCategoryView({
  category,
  title,
  isHistory = false,
}: JournalCategoryViewProps) {
  const searchParams = useSearchParams();
  const initialTag = searchParams.get("tag")?.toLowerCase() || "all";
  const [activeTag, setActiveTag] = useState<string>(initialTag);

  const { t, locale } = useLocale();

  const categoryDefinition = useMemo(() => {
    if (typeof category === "object" && category !== null && "name" in category) {
      return category;
    }
    return (
      getJournalCategory(category) ?? {
        name: (category as JournalCategory) || "Logs",
        slug: "logs",
        nameEn: "Logs",
        nameFa: "گزارش‌ها",
        tags: [],
      }
    );
  }, [category]);

  const categoryName = categoryDefinition.name;
  const {
    journals,
    isLoading,
    mutate: revalidateJournals,
  } = useJournals(categoryName, undefined, { isHistory });

  const { tags: dbTags } = useJournalTags(categoryName);
  const staticFallbackTags = useMemo(
    () => getCategoryStaticTags(categoryName),
    [categoryName],
  );

  const tagsList = useMemo(() => {
    if (dbTags && dbTags.length > 0) return dbTags;
    return staticFallbackTags;
  }, [dbTags, staticFallbackTags]);

  const filterTabs: SlideTabItem[] = useMemo(() => {
    return [
      {
        id: "all",
        label: t("common.all"),
      },
      ...tagsList.map((tag) => ({
        id: tag.slug.toLowerCase(),
        label: locale === "fa" ? tag.nameFa : tag.nameEn,
      })),
    ];
  }, [tagsList, locale, t]);

  const filteredJournals = useMemo(() => {
    if (activeTag === "all") return journals;
    return journals.filter((j) => {
      const tagSlug = j.tag?.slug?.toLowerCase();
      const tagId = String(j.tag?.id);
      const tagNameEn = j.tag?.nameEn?.toLowerCase();
      return (
        tagSlug === activeTag ||
        tagId === activeTag ||
        tagNameEn === activeTag
      );
    });
  }, [journals, activeTag]);

  const backHref = isHistory ? "/journals/history" : "/journals";

  return (
    <PageWrapper className={isHistory ? "history-page" : undefined}>
      <TopBar>
        <TopBar.Title asTitle>
          {isHistory ? `${t("history.title")} - ${title}` : title}
        </TopBar.Title>
        <TopBar.Btn backIcon href={backHref} position="left" />
        <HelpDialog position="right" />
      </TopBar>

      <PageItemsWrapper>
        <SlideTabs
          tabs={filterTabs}
          activeId={activeTag}
          isHistory={isHistory}
          onTabChange={setActiveTag}
          headerClassName="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-xs gap-xs"
          tabClassName="shrink-0 flex-none"
          between={
            <div className="w-full flex items-center justify-between pb-xs text-xs">
              <span className="font-semibold">{title}</span>
              <span>
                {filteredJournals.length} {t("profile.total")}
              </span>
            </div>
          }
        >
          <div className="w-full space-y-sm">
            {isLoading && journals.length === 0 ? (
              <Skeleton count={3} />
            ) : (
              <>
                {filteredJournals.length === 0 ? (
                  <EmptyAlert
                    alert={
                      isHistory
                        ? t("history.empty")
                        : activeTag !== "all"
                          ? t("journals.noJournalsWithTag")
                          : t("journals.noJournalsInCategory")
                    }
                    description={isHistory ? undefined : t("journals.subtitle")}
                    href={
                      isHistory
                        ? undefined
                        : `/journals/new?category=${encodeURIComponent(
                            categoryName.toLowerCase(),
                          )}${activeTag !== "all" ? `&tag=${encodeURIComponent(activeTag)}` : ""}`
                    }
                    className="p-md"
                  />
                ) : isHistory ? (
                  <div className="w-full space-y-sm">
                    {filteredJournals.map((journal) => (
                      <JournalCard
                        key={journal.id}
                        journal={journal}
                        isHistory={isHistory}
                        onDeleted={revalidateJournals}
                        onMutated={revalidateJournals}
                      />
                    ))}
                  </div>
                ) : (
                  <ReorderList
                    items={filteredJournals}
                    entity="journals"
                    revalidate={revalidateJournals}
                    renderItem={(journal) => (
                      <JournalCard
                        journal={journal}
                        isHistory={isHistory}
                        onDeleted={revalidateJournals}
                        onMutated={revalidateJournals}
                      />
                    )}
                  />
                )}
              </>
            )}
          </div>
        </SlideTabs>

        {!isHistory && (
          <PageActionBtn
            href={`/journals/new?category=${encodeURIComponent(
              categoryName.toLowerCase(),
            )}${activeTag !== "all" ? `&tag=${encodeURIComponent(activeTag)}` : ""}`}
          >
            {t("journals.new")}
          </PageActionBtn>
        )}
      </PageItemsWrapper>
    </PageWrapper>
  );
}

export default JournalCategoryView;
