"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TagIcon } from "lucide-react";
import { useJournals, useJournalTags } from "../../hooks";
import {
  JournalCategory,
  JournalCategoryDefinition,
  JournalType,
  getJournalCategory,
} from "../../types";
import JournalCard from "../JournalCard/JournalCard";
import TopBar from "@/features/general/components/static/TopBar/TopBar";
import HelpDialog from "@/features/general/components/module/HelpDialog/HelpDialog";
import PageActionBtn from "@/features/general/components/module/PageActionBtn/PageActionBtn";
import PageWrapper from "@/features/general/components/static/PageWrapper/PageWrapper";
import PageItemsWrapper from "@/features/general/components/static/PageItemsWrapper/PageItemsWrapper";
import EmptyAlert from "@/features/general/components/static/EmptyAlert";
import Skeleton from "@/features/general/components/ui/Skeleton";
import SlideTabs, { SlideTabItem } from "@/features/general/components/ui/SlideTabs";
import ReorderList from "@/features/general/components/ui/ReorderList";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";

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

  const categoryDefinition = useMemo(() => {
    if (typeof category === "object" && category !== null && "name" in category) {
      return category;
    }
    return (
      getJournalCategory(category) ?? {
        name: (category as JournalCategory) || "Logs",
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
  const { t } = useLocale();

  const allTagNames = useMemo(() => {
    const names = new Set<string>();
    categoryDefinition.tags.forEach((tag) => names.add(tag));
    dbTags.forEach((tag) => names.add(tag.title));
    return Array.from(names);
  }, [categoryDefinition.tags, dbTags]);

  const filterTabs: SlideTabItem[] = useMemo(() => {
    return [
      {
        id: "all",
        label: t("common.all"),
      },
      ...allTagNames.map((tagName) => ({
        id: tagName.toLowerCase(),
        label: tagName,
      })),
      {
        id: "tags-page",
        label: t("common.tags"),
        href: `/journals/${categoryName.toLowerCase()}/tags`,
        icon: <TagIcon />,
      },
    ];
  }, [allTagNames, categoryName, t]);

  const filteredJournals = useMemo(() => {
    if (activeTag === "all") return journals;
    return journals.filter(
      (j) => j.tag?.toLowerCase() === activeTag.toLowerCase(),
    );
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
          onTabChange={(id) => {
            if (id !== "tags-page") {
              setActiveTag(id);
            }
          }}
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
                    )}${activeTag !== "all" && activeTag !== "tags-page" ? `&tag=${encodeURIComponent(activeTag)}` : ""}`}
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
          )}${activeTag !== "all" && activeTag !== "tags-page" ? `&tag=${encodeURIComponent(activeTag)}` : ""}`}
        >
          {t("journals.new")}
        </PageActionBtn>
      </PageItemsWrapper>
    </PageWrapper>
  );
}
