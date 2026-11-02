"use client";

import { useSearchParams } from "next/navigation";
import PageActionBtn from "@/features/general/components/modules/PageActionBtn/PageActionBtn";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";

function JournalsActionBtn() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const activeTab = tab || "all";

  const href =
    activeTab && activeTab !== "all"
      ? `/journals/new?category=${encodeURIComponent(activeTab)}`
      : "/journals/new";

  return <PageActionBtn href={href}>{t("journals.new")}</PageActionBtn>;
}

export default JournalsActionBtn;
