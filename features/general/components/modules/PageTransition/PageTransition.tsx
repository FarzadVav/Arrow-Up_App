"use client";

import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { PropsWithChildren, useEffect, useRef } from "react";

export function PageTransition({
  children,
}: PropsWithChildren) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  const isAppInitialized = useRef(false);

  useEffect(() => {
    isAppInitialized.current = true;
  }, []);

  return (
    <motion.div
      key={pathname}
      // initial={shouldReduceMotion ? false : { opacity: 0, scale: 1.1 }}
      className={"w-full flex-1 flex flex-col"}
      initial={isAppInitialized ? { opacity: 0, scale: 0.95, filter: "blur(4px)" } : undefined}
      animate={isAppInitialized ? { opacity: 1, scale: 1, filter: "none" } : undefined}
      transition={isAppInitialized ? { duration: 0.25 } : undefined}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
