"use client";

import Link from "next/link";

import { Button } from "../../ui/Button/Button";
import { NAVIGATION_LINKS } from "@/features/general/lib/constants";
import useMatchPathname from "@/features/general/hooks/useMatchPathname";

function Navigation() {
  const checkIsPathnameMatch = useMatchPathname();

  return (
    <div
      id="navigation"
      className="h-18 px-md bg-linear-to-t from-background from-10% to-transparent flex items-center justify-center z-important sticky bottom-0">
      <nav className="w-full p-1 rounded-component h-12 bg-card-thick flex items-center justify-center gap-1">
        {NAVIGATION_LINKS.map((item) => {
          const isPathnameMatch = checkIsPathnameMatch(item.matchPathname);

          return (
            <Button
              key={item.href}
              nativeButton={false}
              aria-label={item.href}
              render={<Link href={item.href} />}
              className="h-full flex-1 flex-col px-0"
              variant={isPathnameMatch ? "card" : "ghost"}>
              <item.Icon className={isPathnameMatch ? "" : ""} />
            </Button>
          );
        })}
      </nav>
    </div>
  );
}

export default Navigation;
