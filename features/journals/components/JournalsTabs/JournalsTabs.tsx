"use client";

import { useSearchParams } from "next/navigation";
import { JOURNAL_CATEGORIES } from "../../types";
import { useJournals } from "../../hooks";
import JournalCard from "../JournalCard/JournalCard";
import SlideTabs, { SlideTabItem } from "@/features/general/components/ui/SlideTabs";
import EmptyAlert from "@/features/general/components/static/EmptyAlert";
import Skeleton from "@/features/general/components/ui/Skeleton";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";

function JournalsTabs() {
  const sp = useSearchParams();
  const tab = sp.get("tab");
  const activeTab = (tab || "all").toLowerCase();

  const {
    journals: currentJournals,
    isLoading,
    mutate: revalidateJournals,
  } = useJournals(activeTab);
  const { t } = useLocale();

  const tabs: SlideTabItem[] = [
    {
      id: "all",
      label: t("common.all"),
      href: "?tab=all",
    },
    ...JOURNAL_CATEGORIES.map((cat) => ({
      id: cat.name.toLowerCase(),
      label: t(`journals.categories.${cat.name.toLowerCase()}`),
      href: `?tab=${encodeURIComponent(cat.name.toLowerCase())}`,
    })),
  ];

  return (
    <SlideTabs
      tabs={tabs}
      activeId={activeTab}
      headerClassName="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5 gap-xs"
      tabClassName="shrink-0 flex-none"
    >
      <div className="w-full space-y-sm">
        {isLoading && currentJournals.length === 0 ? (
          <Skeleton count={3} />
        ) : (
          <>
            {currentJournals.map((journal) => (
              <JournalCard
                key={journal.id}
                journal={journal}
                onDeleted={revalidateJournals}
              />
            ))}

            {currentJournals.length === 0 && (
              <EmptyAlert
                alert={
                  activeTab !== "all"
                    ? t("journals.noJournalsInCategory")
                    : t("journals.noJournals")
                }
                alertClassName="sub-text font-normal"
                href={
                  activeTab !== "all"
                    ? `/journals/new?category=${encodeURIComponent(activeTab)}`
                    : "/journals/new"
                }
              />
            )}
          </>
        )}
      </div>
    </SlideTabs>
  );
}

export default JournalsTabs;
