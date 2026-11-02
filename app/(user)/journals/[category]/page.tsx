import JournalCategoryView from "@/features/journals/components/modules/JournalCategoryView/JournalCategoryView";
import {
  resolveJournalCategory,
  type JournalCategoryRouteParams,
} from "@/features/journals/api/queries";

export default async function JournalCategoryPage({
  params,
}: {
  params: JournalCategoryRouteParams;
}) {
  const { category, title } = await resolveJournalCategory(params);

  return <JournalCategoryView category={category} title={title} />;
}
