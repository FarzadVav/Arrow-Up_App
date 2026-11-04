import FrameworkAreaView from "@/features/framework/components/modules/FrameworkAreaView/FrameworkAreaView";
import ContentSuspense from "@/features/general/components/modules/ContentSuspense";
import { resolveAreaSlug, type AreaRouteParams } from "@/features/general/lib/utils";

export default async function FrameworkAreaPage({
  params,
  searchParams,
}: {
  params: AreaRouteParams;
  searchParams?: Promise<{ history?: string }>;
}) {
  const [lifeAreaId, sp] = await Promise.all([
    resolveAreaSlug(params),
    searchParams,
  ]);
  const isHistory = sp?.history === "true";

  return (
    <ContentSuspense>
      <FrameworkAreaView lifeAreaId={lifeAreaId} isHistory={isHistory} />
    </ContentSuspense>
  );
}
