import SkillTagsList from "@/features/skills/components/modules/SkillTagsList/SkillTagsList";
import { resolveAreaSlug, type AreaRouteParams } from "@/features/general/lib/utils";

export default async function SkillTagsPage({
  params,
}: {
  params: AreaRouteParams;
}) {
  const lifeAreaId = await resolveAreaSlug(params);

  return <SkillTagsList lifeAreaId={lifeAreaId} />;
}
