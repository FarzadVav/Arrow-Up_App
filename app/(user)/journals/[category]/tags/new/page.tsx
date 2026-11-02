import ContentSuspense from "@/features/general/components/modules/ContentSuspense";
import { JournalTagForm } from "@/features/journals/components/modules/JournalTagForm/JournalTagForm";
import {
  resolveJournalCategory,
  type JournalCategoryRouteParams,
} from "@/features/journals/api/queries";

export default async function NewJournalTagPage({
  params,
}: {
  params: JournalCategoryRouteParams;
}) {
  const { category, title } = await resolveJournalCategory(params);

  return (
    <ContentSuspense>
      <JournalTagForm
        category={category.name}
        categoryTitle={title}
      />
    </ContentSuspense>
  );
}
