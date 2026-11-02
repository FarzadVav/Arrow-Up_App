import FrameworkTagsList from "@/features/framework/components/modules/FrameworkTagsList/FrameworkTagsList";
import { resolveAreaSlug, type AreaRouteParams } from "@/features/general/lib/utils";

export default async function FrameworkTagsPage({
  params,
}: {
  params: AreaRouteParams;
}) {
  const lifeAreaId = await resolveAreaSlug(params);

  return <FrameworkTagsList lifeAreaId={lifeAreaId} />;
}
