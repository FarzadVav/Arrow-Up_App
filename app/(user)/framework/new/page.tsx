import ContentSuspense from "@/features/general/components/modules/ContentSuspense";
import { FrameworkForm } from "@/features/framework/components";

export default function NewFrameworkPage() {
  return (
    <ContentSuspense>
      <FrameworkForm />
    </ContentSuspense>
  );
}
