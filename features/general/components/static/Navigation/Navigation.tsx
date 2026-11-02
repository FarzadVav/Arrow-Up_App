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
      className="h-18 px-sm bg-linear-to-t from-background from-10% to-transparent flex items-center justify-center z-important sticky bottom-0">
      <nav className="w-full p-xs rounded-component h-12 bg-card-thick flex items-center justify-center gap-xs">
        {NAVIGATION_LINKS.map((item) => {
          const isPathnameMatch = checkIsPathnameMatch(item.matchPathname);

          return (
            <Button
              key={item.href}
              nativeButton={false}
              aria-label={item.href}
              className="h-full flex-1 px-0"
              render={<Link href={item.href} />}
              variant={isPathnameMatch ? "card" : "ghost"}>
              <item.Icon />
            </Button>
          );
        })}
      </nav>
    </div>
  );
}

export default Navigation;
