import SkillAreaView from "@/features/skills/components/modules/SkillAreaView/SkillAreaView";
import ContentSuspense from "@/features/general/components/modules/ContentSuspense";
import { resolveAreaSlug, type AreaRouteParams } from "@/features/general/lib/utils";

export default async function SkillAreaPage({
  params,
}: {
  params: AreaRouteParams;
}) {
  const lifeAreaId = await resolveAreaSlug(params);

  return (
    <ContentSuspense>
      <SkillAreaView lifeAreaId={lifeAreaId} />
    </ContentSuspense>
  );
}
