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

type JournalCategoryViewProps = {
  category: JournalCategoryDefinition | JournalType;
  title: string;
};

export default function JournalCategoryView({
  category,
  title,
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
  } = useJournals(categoryName);

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

  return (
    <PageWrapper>
      <TopBar>
        <TopBar.Title asTitle>{title}</TopBar.Title>
        <TopBar.Btn backIcon href="/journals" position="left" />
        <HelpDialog position="right" />
      </TopBar>

      <PageItemsWrapper>
        <SlideTabs
          tabs={filterTabs}
          activeId={activeTag}
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
                      activeTag !== "all"
                        ? t("journals.noJournalsWithTag")
                        : t("journals.noJournalsInCategory")
                    }
                    description={t("journals.subtitle")}
                    href={`/journals/new?category=${encodeURIComponent(
                      categoryName.toLowerCase(),
                    )}${activeTag !== "all" ? `&tag=${encodeURIComponent(activeTag)}` : ""}`}
                    className="p-md"
                  />
                ) : (
                  <ReorderList
                    items={filteredJournals}
                    entity="journals"
                    revalidate={revalidateJournals}
                    renderItem={(journal) => (
                      <JournalCard
                        journal={journal}
                        onDeleted={revalidateJournals}
                      />
                    )}
                  />
                )}
              </>
            )}
          </div>
        </SlideTabs>

        <PageActionBtn
          href={`/journals/new?category=${encodeURIComponent(
            categoryName.toLowerCase(),
          )}${activeTag !== "all" ? `&tag=${encodeURIComponent(activeTag)}` : ""}`}
        >
          {t("journals.new")}
        </PageActionBtn>
      </PageItemsWrapper>
    </PageWrapper>
  );
}
