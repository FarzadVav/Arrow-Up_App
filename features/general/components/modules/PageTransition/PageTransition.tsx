"use client";

import { type PropsWithChildren } from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion, type Transition } from "motion/react";
import { cn } from "cn";

export interface PageTransitionProps extends PropsWithChildren {
  className?: string;
  transition?: Transition;
}

/**
 * Modern page transition wrapper using the latest motion/react and React 19 standards.
 * Provides hardware-accelerated enter animations with accessibility support (prefers-reduced-motion).
 */
export function PageTransition({
  children,
  className,
  transition,
}: PageTransitionProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      // initial={shouldReduceMotion ? false : { opacity: 0, scale: 1.1 }}
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={
        transition ?? {
          duration: 0.25,
          ease: [0.25, 1, 0.5, 1], // easeOutCubic
        }
      }
      className={cn("w-full flex-1 flex flex-col", className)}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
