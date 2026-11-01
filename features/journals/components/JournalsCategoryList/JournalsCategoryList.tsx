"use client";

import Link from "next/link";
import {
  Brain,
  Heart,
  Lightbulb,
  PenLine,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

import { JOURNAL_CATEGORIES, JournalType } from "../../types";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";
import CardView from "@/features/general/components/ui/CardView/CardView";

const CATEGORY_META: Record<
  JournalType,
  {
    icon: LucideIcon;
    descriptionKey: string;
  }
> = {
  Logs: {
    icon: ScrollText,
    descriptionKey: "journals.categoryDesc.logs",
  },
  Thoughts: {
    icon: Brain,
    descriptionKey: "journals.categoryDesc.thoughts",
  },
  Feelings: {
    icon: Heart,
    descriptionKey: "journals.categoryDesc.feelings",
  },
  Ideas: {
    icon: Lightbulb,
    descriptionKey: "journals.categoryDesc.ideas",
  },
  Notes: {
    icon: PenLine,
    descriptionKey: "journals.categoryDesc.notes",
  },
};

export default function JournalsCategoryList() {
  const { t } = useLocale();

  return (
    <div className="w-full flex flex-col gap-sm">
      {JOURNAL_CATEGORIES.map((cat) => {
        const categoryName = cat.name;
        const meta = CATEGORY_META[categoryName];
        const Icon = meta.icon;
        const label = t(`journals.categories.${categoryName.toLowerCase()}`);
        const desc = t(meta.descriptionKey);

        return (
          <Link
            key={categoryName}
            href={`/journals/${categoryName.toLowerCase()}`}
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
