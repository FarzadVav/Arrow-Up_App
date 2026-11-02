import SkillTagForm from "@/features/skills/components/modules/SkillTagForm/SkillTagForm";
import ContentSuspense from "@/features/general/components/modules/ContentSuspense";
import { resolveAreaSlug, type AreaRouteParams } from "@/features/general/lib/utils";

export default async function NewSkillTagPage({
  params,
}: {
  params: AreaRouteParams;
}) {
  const lifeAreaId = await resolveAreaSlug(params);

  return (
    <ContentSuspense>
      <SkillTagForm lifeAreaId={lifeAreaId} />
    </ContentSuspense>
  );
}
