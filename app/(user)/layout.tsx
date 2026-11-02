import { PropsWithChildren } from "react";
import { redirect } from "next/navigation";

import { getCurrentUserQuery } from "@/features/auth/api/queries";
import Navigation from "@/features/general/components/statics/Navigation/Navigation";

async function UserLayout({ children }: PropsWithChildren) {
  const user = await getCurrentUserQuery();

  if (!user) {
    redirect("/api/auth/clear-session");
  }

  return (
    <>
      {children}
      <Navigation />
    </>
  );
}

export default UserLayout;
