import ContentSuspense from "@/features/general/components/modules/ContentSuspense";
import TodoForm from "@/features/todos/components/modules/TodoForm/TodoForm";

export default function NewTodoPage() {
  return (
    <ContentSuspense>
      <TodoForm />
    </ContentSuspense>
  );
}
