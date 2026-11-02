import ContentSuspense from "@/features/general/components/modules/ContentSuspense";
import { SkillForm } from "@/features/skills/components";

export default function NewSkillPage() {
  return (
    <ContentSuspense>
      <SkillForm />
    </ContentSuspense>
  );
}
