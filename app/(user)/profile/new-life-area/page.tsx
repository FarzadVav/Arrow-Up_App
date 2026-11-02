import ContentSuspense from "@/features/general/components/modules/ContentSuspense";
import { LifeAreaForm } from "@/features/life-areas/components";

export default function ProfileNewLifeAreaPage() {
  return (
    <ContentSuspense>
      <LifeAreaForm />
    </ContentSuspense>
  );
}
