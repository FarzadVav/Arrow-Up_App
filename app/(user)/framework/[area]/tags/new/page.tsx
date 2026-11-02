import FrameworkTagForm from "@/features/framework/components/modules/FrameworkTagForm/FrameworkTagForm";
import ContentSuspense from "@/features/general/components/modules/ContentSuspense";
import { resolveAreaSlug, type AreaRouteParams } from "@/features/general/lib/utils";

export default async function NewFrameworkTagPage({
  params,
}: {
  params: AreaRouteParams;
}) {
  const lifeAreaId = await resolveAreaSlug(params);

  return (
    <ContentSuspense>
      <FrameworkTagForm lifeAreaId={lifeAreaId} />
    </ContentSuspense>
  );
}
