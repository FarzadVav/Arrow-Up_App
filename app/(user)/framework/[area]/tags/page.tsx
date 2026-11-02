import { notFound } from "next/navigation";

import FrameworkTagsList from "@/features/framework/components/modules/FrameworkTagsList/FrameworkTagsList";
import { parseLifeAreaSlug } from "@/features/general/lib/utils";

type PageProps = {
  params: Promise<{ area: string }>;
};

export default async function FrameworkTagsPage({ params }: PageProps) {
  const { area: rawSlug } = await params;
  const lifeAreaId = parseLifeAreaSlug(rawSlug);

  if (lifeAreaId === undefined) {
    notFound();
  }

  return <FrameworkTagsList lifeAreaId={lifeAreaId} />;
}
