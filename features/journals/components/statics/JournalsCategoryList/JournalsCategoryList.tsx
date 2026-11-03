"use client";

import Link from "next/link";
import {
  Brain,
  Heart,
  PenLine,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

import { STATIC_JOURNAL_CATEGORIES } from "@/features/journals/lib/constants";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";
import CardView from "@/features/general/components/ui/CardView/CardView";

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

export default function JournalsCategoryList() {
  const { t, locale } = useLocale();

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

        return (
          <Link
            key={cat.slug}
            href={`/journals/${cat.slug}`}
            className="block"
          >
            <CardView
              icon={
                <div className="size-10 rounded-full bg-foreground/5 flex items-center justify-center shrink-0">
                  <Icon />
                </div>
              }
              title={label}
              description={desc}
            />
          </Link>
        );
      })}
    </div>
  );
}
