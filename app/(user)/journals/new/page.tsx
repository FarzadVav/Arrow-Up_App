import ContentSuspense from "@/features/general/components/modules/ContentSuspense";
import JournalForm from "@/features/journals/components/modules/JournalForm/JournalForm";

export default function NewJournalPage() {
  return (
    <ContentSuspense>
      <JournalForm />
    </ContentSuspense>
  );
}
