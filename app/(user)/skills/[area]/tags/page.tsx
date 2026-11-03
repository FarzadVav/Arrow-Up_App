import { notFound } from "next/navigation";
import SkillTagsList from "@/features/skills/components/modules/SkillTagsList/SkillTagsList";
import { resolveAreaSlug, type AreaRouteParams } from "@/features/general/lib/utils";

export default async function SkillTagsPage({
  params,
}: {
  params: AreaRouteParams;
}) {
  const lifeAreaId = await resolveAreaSlug(params);

  if (lifeAreaId === null) {
    notFound();
  }

  return <SkillTagsList lifeAreaId={lifeAreaId} />;
}
