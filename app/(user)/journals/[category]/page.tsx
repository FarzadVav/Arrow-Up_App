import { notFound } from "next/navigation";
import { JOURNAL_CATEGORIES } from "@/features/journals/lib/constants";
import { getTranslations } from "@/features/general/lib/i18n/server";
import JournalCategoryView from "@/features/journals/components/modules/JournalCategoryView/JournalCategoryView";

type PageProps = {
  params: Promise<{ category: string }>;
};

export default async function JournalCategoryPage({ params }: PageProps) {
  const { category: rawSlug } = await params;

  if (!rawSlug) {
    notFound();
  }

  const matchedCategory = JOURNAL_CATEGORIES.find(
    (c) => c.name.toLowerCase() === rawSlug.toLowerCase(),
  );

  if (!matchedCategory) {
    notFound();
  }

  const { t } = await getTranslations();
  const title =
    t(`journals.categories.${matchedCategory.name.toLowerCase()}`) ||
    matchedCategory.name;

  return (
    <JournalCategoryView category={matchedCategory} title={title} />
  );
}
