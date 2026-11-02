"use client";

import { useSearchParams } from "next/navigation";
import SlideTabs, { SlideTabItem } from "@/features/general/components/ui/SlideTabs";
import Skeleton from "@/features/general/components/ui/Skeleton";
import EmptyAlert from "@/features/general/components/statics/EmptyAlert";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";
import { useHistory } from "@/features/general/hooks/useHistory";
import HistoryCard from "../HistoryCard/HistoryCard";

const VALID_TABS = ["daily", "upcoming", "missions", "framework", "skills", "journals"] as const;
type HistoryTabType = typeof VALID_TABS[number];

export function HistoryTabs() {
  const searchParams = useSearchParams();
  const rawTab = (searchParams.get("tab") || "daily").toLowerCase() as HistoryTabType;
  const activeTab: HistoryTabType = VALID_TABS.includes(rawTab) ? rawTab : "daily";

  const { items, isLoading, mutate } = useHistory(activeTab);
  const { t } = useLocale();

  const tabs: SlideTabItem[] = [
    {
      id: "daily",
      label: t("history.tabs.daily"),
      href: "?tab=daily",
    },
    {
      id: "upcoming",
      label: t("history.tabs.upcoming"),
      href: "?tab=upcoming",
    },
    {
      id: "missions",
      label: t("history.tabs.missions"),
      href: "?tab=missions",
    },
    {
      id: "framework",
      label: t("history.tabs.framework"),
      href: "?tab=framework",
    },
    {
      id: "skills",
      label: t("history.tabs.skills"),
      href: "?tab=skills",
    },
    {
      id: "journals",
      label: t("history.tabs.journals"),
      href: "?tab=journals",
    },
  ];

  return (
    <SlideTabs
      tabs={tabs}
      activeId={activeTab}
      headerClassName="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-xs gap-xs"
      tabClassName="shrink-0 flex-none"
    >
      <div className="w-full space-y-sm">
        {isLoading && items.length === 0 ? (
          <Skeleton count={3} />
        ) : items.length === 0 ? (
          <EmptyAlert alert={t("history.empty")} />
        ) : (
          items.map((item) => (
            <HistoryCard
              key={`${activeTab}-${item.id}`}
              item={item}
              type={activeTab}
              onMutated={mutate}
            />
          ))
        )}
      </div>
    </SlideTabs>
  );
}

export default HistoryTabs;
