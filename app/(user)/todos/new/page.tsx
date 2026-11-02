import { Suspense } from "react";
import { getTranslations } from "@/features/general/lib/i18n/server";
import ConnectivityFallback from "@/features/general/components/modules/ConnectivityFallback/ConnectivityFallback";
import TodoForm from "@/features/todos/components/modules/TodoForm/TodoForm";

export default async function NewTodoPage() {
  const { t } = await getTranslations();

  return (
    <Suspense
      fallback={<ConnectivityFallback message={t("common.loading")} />}
    >
      <TodoForm />
    </Suspense>
  );
}
