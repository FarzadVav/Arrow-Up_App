"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Brain,
  Heart,
  PenLine,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

import { STATIC_JOURNAL_CATEGORIES } from "@/features/journals/lib/constants";
import { useJournals } from "@/features/journals/hooks";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";
import CardView from "@/features/general/components/ui/CardView/CardView";
import EmptyAlert from "@/features/general/components/statics/EmptyAlert";
import Skeleton from "@/features/general/components/ui/Skeleton";

const CATEGORY_META: Record<
  string,
  {
    icon: LucideIcon;
    descriptionKey: string;
  }
> = {
  logs: {
    icon: ScrollText,
    descriptionKey: "journals.categoryDesc.logs",
  },
  thoughts: {
    icon: Brain,
    descriptionKey: "journals.categoryDesc.thoughts",
  },
  feelings: {
    icon: Heart,
    descriptionKey: "journals.categoryDesc.feelings",
  },
  notes: {
    icon: PenLine,
    descriptionKey: "journals.categoryDesc.notes",
  },
};

export interface JournalsCategoryListProps {
  isHistory?: boolean;
}

export function JournalsCategoryList({
  isHistory = false,
}: JournalsCategoryListProps) {
  const { t, locale } = useLocale();
  const { journals: historyJournals, isLoading } = useJournals(
    "all",
    undefined,
    { isHistory },
  );

  const countByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    historyJournals.forEach((journal) => {
      const catSlug =
        journal.category?.slug?.toLowerCase() ||
        journal.type?.toLowerCase() ||
        "logs";
      counts.set(catSlug, (counts.get(catSlug) ?? 0) + 1);
    });
    return counts;
  }, [historyJournals]);

  if (isLoading && isHistory && historyJournals.length === 0) {
    return (
      <div className="w-full space-y-sm">
        <Skeleton count={3} />
      </div>
    );
  }

  if (isHistory && historyJournals.length === 0) {
    return <EmptyAlert alert={t("history.empty")} className="p-md" />;
  }

  return (
    <div className="w-full flex flex-col gap-sm">
      {STATIC_JOURNAL_CATEGORIES.map((cat) => {
        const meta = CATEGORY_META[cat.slug] ?? {
          icon: ScrollText,
          descriptionKey: `journals.categoryDesc.${cat.slug}`,
        };
        const Icon = meta.icon;
        const label =
          locale === "fa"
            ? cat.nameFa
            : cat.nameEn || t(`journals.categories.${cat.slug}`);
        const desc = t(meta.descriptionKey);
        const count = countByCategory.get(cat.slug) ?? 0;

        const href = isHistory
          ? `/journals/history/${cat.slug}`
          : `/journals/${cat.slug}`;

        return (
          <Link key={cat.slug} href={href} className="block">
            <CardView
              isHistory={isHistory}
              icon={
                <div className="size-10 rounded-full bg-foreground/5 flex items-center justify-center shrink-0">
                  <Icon />
                </div>
              }
              title={label}
              description={desc}
              date={
                isHistory ? (
                  <span>
                    {count} {t("profile.total")}
                  </span>
                ) : undefined
              }
            />
          </Link>
        );
      })}
    </div>
  );
}

export default JournalsCategoryList;
