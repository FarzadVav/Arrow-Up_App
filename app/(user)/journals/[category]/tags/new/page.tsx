import { redirect } from "next/navigation";
import {
  resolveJournalCategory,
  type JournalCategoryRouteParams,
} from "@/features/journals/api/queries";

export default async function NewJournalTagPage({
  params,
}: {
  params: JournalCategoryRouteParams;
}) {
  const { category } = await resolveJournalCategory(params);
  redirect(`/journals/${category.slug || category.name.toLowerCase()}`);
}
