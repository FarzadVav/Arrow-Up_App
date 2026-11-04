"use client";

import { usePathname } from "next/navigation";
import { PropsWithChildren, useEffect, useRef } from "react";
import { cn } from "cn";

export interface PageWrapperProps extends PropsWithChildren {
  className?: string;
}

function PageWrapper({ children, className, ...props }: PageWrapperProps) {
  const pathname = usePathname();

  const pageWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const navigationElem = document.getElementById("navigation");
    const pageActionBtnElem =
      document.getElementById("page-action-btn") ||
      document.getElementById("create-btn");

    let minH = 0;
    let pb = 0.75;

    if (navigationElem) {
      minH += 4.5;
    }

    if (pageActionBtnElem) {
      pb += 4;
    }

    if (pageWrapperRef.current) {
      pageWrapperRef.current.style.minHeight = minH
        ? `calc(100dvh - ${minH}rem)`
        : "100dvh";
      pageWrapperRef.current.style.paddingBottom = `${pb}rem`;
    }
  }, [pathname]);

  return (
    <div
      ref={pageWrapperRef}
      className={cn(
        "p-sm pt-md flex flex-col justify-start items-start gap-md",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default PageWrapper;
