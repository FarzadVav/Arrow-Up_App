import FrameworkAreaView from "@/features/framework/components/modules/FrameworkAreaView/FrameworkAreaView";
import ContentSuspense from "@/features/general/components/modules/ContentSuspense";
import { resolveAreaSlug, type AreaRouteParams } from "@/features/general/lib/utils";

export default async function FrameworkAreaPage({
  params,
}: {
  params: AreaRouteParams;
}) {
  const lifeAreaId = await resolveAreaSlug(params);

  return (
    <ContentSuspense>
      <FrameworkAreaView lifeAreaId={lifeAreaId} />
    </ContentSuspense>
  );
}
