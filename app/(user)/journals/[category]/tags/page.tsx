import { JournalTagsList } from "@/features/journals/components/modules/JournalTagsList/JournalTagsList";
import {
  resolveJournalCategory,
  type JournalCategoryRouteParams,
} from "@/features/journals/api/queries";

export default async function JournalTagsPage({
  params,
}: {
  params: JournalCategoryRouteParams;
}) {
  const { category, title } = await resolveJournalCategory(params);

  return (
    <JournalTagsList
      category={category.name}
      categoryTitle={title}
    />
  );
}
