"use client";

import { useSearchParams } from "next/navigation";
import { STATIC_JOURNAL_CATEGORIES } from "@/features/journals/lib/constants";
import { useJournals } from "@/features/journals/hooks";
import JournalCard from "@/features/journals/components/modules/JournalCard/JournalCard";
import SlideTabs, {
  SlideTabItem,
} from "@/features/general/components/ui/SlideTabs";
import EmptyAlert from "@/features/general/components/statics/EmptyAlert";
import Skeleton from "@/features/general/components/ui/Skeleton";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";

function JournalsTabs() {
  const sp = useSearchParams();
  const tab = sp.get("tab");
  const activeTab = (tab || "all").toLowerCase();

  const {
    journals: currentJournals,
    isLoading,
    mutate: revalidateJournals,
  } = useJournals(activeTab);
  const { t, locale } = useLocale();

  const tabs: SlideTabItem[] = [
    {
      id: "all",
      label: t("common.all"),
      href: "?tab=all",
    },
    ...STATIC_JOURNAL_CATEGORIES.map((cat) => ({
      id: cat.slug,
      label:
        locale === "fa"
          ? cat.nameFa
          : cat.nameEn || t(`journals.categories.${cat.slug}`),
      href: `?tab=${encodeURIComponent(cat.slug)}`,
    })),
  ];

  return (
    <SlideTabs
      tabs={tabs}
      activeId={activeTab}
      headerClassName="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-xs gap-xs"
      tabClassName="shrink-0 flex-none">
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
