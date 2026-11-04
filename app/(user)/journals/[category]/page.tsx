import JournalCategoryView from "@/features/journals/components/modules/JournalCategoryView/JournalCategoryView";
import {
  resolveJournalCategory,
  type JournalCategoryRouteParams,
} from "@/features/journals/api/queries";

export default async function JournalCategoryPage({
  params,
  searchParams,
}: {
  params: JournalCategoryRouteParams;
  searchParams?: Promise<{ history?: string }>;
}) {
  const [{ category, title }, sp] = await Promise.all([
    resolveJournalCategory(params),
    searchParams,
  ]);
  const isHistory = sp?.history === "true";

  return (
    <JournalCategoryView
      category={category}
      title={title}
      isHistory={isHistory}
    />
  );
}
