"use client";

import { useSearchParams } from "next/navigation";
import PageActionBtn from "@/features/general/components/module/PageActionBtn/PageActionBtn";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";

function TodosActionBtn() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const isMission = tab === "missions";
  const isUpcoming = tab === "upcoming";

  const href = `/todos/new?type=${
    isMission ? "mission" : isUpcoming ? "upcoming" : "daily"
  }`;

  const label = isMission
    ? t("missions.new")
    : isUpcoming
      ? t("todos.newUpcoming")
      : t("todos.new");

  return <PageActionBtn href={href}>{label}</PageActionBtn>;
}

export default TodosActionBtn;
