import { PropsWithChildren } from "react";
import PageTransition from "@/features/general/components/modules/PageTransition/PageTransition";

export default function OfflineTemplate({ children }: PropsWithChildren) {
  return <PageTransition>{children}</PageTransition>;
}
