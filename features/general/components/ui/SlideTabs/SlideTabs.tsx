"use client";

import { ReactNode, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, type Transition } from "motion/react";
import { cn } from "cn";

import { Button } from "../Button/Button";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";

export type SlideTabItem = {
  id: string;
  label: ReactNode;
  badge?: ReactNode;
  icon?: ReactNode;
  href?: string;
  disabled?: boolean;
  content?: ReactNode;
  onClick?: () => void;
  className?: string;
};

export type SlideTabsProps = {
  tabs: SlideTabItem[];
  activeId?: string;
  onTabChange?: (id: string, index: number) => void;
  /** Content rendered between the tab header buttons and the sliding content panel */
  between?: ReactNode;
  /** Content to render inside the sliding panel (if not using tab.content) */
  children?:
    | ReactNode
    | ((activeTab: SlideTabItem, index: number) => ReactNode);
  className?: string;
  headerClassName?: string;
  tabClassName?: string;
  panelClassName?: string;
  isRtl?: boolean;
  offset?: string;
  transition?: Transition;
  mode?: "wait" | "popLayout" | "sync";
};

export function getSlideX(
  type: "enter" | "exit",
  direction: number,
  isRtl: boolean,
  offset: string = "100%",
): string {
  if (direction === 0) return "0%";

  // In LTR:
  // Forward (direction > 0): enter from right (+offset), exit to left (-offset)
  // Backward (direction < 0): enter from left (-offset), exit to right (+offset)
  // In RTL, this is reversed because tabs are visually oriented from right to left.
  const sign = isRtl ? -1 : 1;
  const isForward = direction * sign > 0;

  if (type === "enter") {
    return isForward ? offset : `-${offset}`;
  } else {
    return isForward ? `-${offset}` : offset;
  }
}

export function SlideTabs({
  tabs,
  activeId: activeIdProp,
  onTabChange,
  between,
  children,
  className,
  headerClassName,
  tabClassName,
  panelClassName,
  isRtl: isRtlProp,
  offset = "100%",
  transition,
  mode = "wait",
}: SlideTabsProps) {
  const { locale } = useLocale();

  const effectiveIsRtl =
    isRtlProp !== undefined
      ? isRtlProp
      : locale === "fa" ||
        (typeof document !== "undefined" &&
          document.documentElement.dir === "rtl");

  const [internalActiveId, setInternalActiveId] = useState<string>(
    activeIdProp || tabs[0]?.id || "",
  );
  const activeId = activeIdProp !== undefined ? activeIdProp : internalActiveId;

  const currentIndex = useMemo(() => {
    const idx = tabs.findIndex((t) => t.id === activeId);
    return idx >= 0 ? idx : 0;
  }, [tabs, activeId]);

  // Track previous index and direction synchronously during render
  const [state, setState] = useState({
    activeId,
    prevIndex: currentIndex,
    direction: 0,
  });

  if (state.activeId !== activeId) {
    const dir =
      currentIndex > state.prevIndex
        ? 1
        : currentIndex < state.prevIndex
          ? -1
          : 0;
    setState({
      activeId,
      prevIndex: currentIndex,
      direction: dir,
    });
  }

  const direction = state.direction;
  const activeTab = tabs[currentIndex] || tabs[0];

  const slideVariants = useMemo(
    () => ({
      enter: (custom: { direction: number; isRtl: boolean }) => ({
        x: getSlideX("enter", custom.direction, custom.isRtl, offset),
        opacity: 0,
        filter: "blur(4px)",
      }),
      center: {
        x: "0%",
        opacity: 1,
        filter: "none",
      },
      exit: (custom: { direction: number; isRtl: boolean }) => ({
        x: getSlideX("exit", custom.direction, custom.isRtl, offset),
        opacity: 0,
        filter: "blur(4px)",
      }),
    }),
    [offset],
  );

  const renderedContent = useMemo(() => {
    if (typeof children === "function") {
      return children(activeTab, currentIndex);
    }
    if (children !== undefined && children !== null) {
      return children;
    }
    return activeTab?.content;
  }, [children, activeTab, currentIndex]);

  return (
    <div className={cn("w-full space-y-sm", className)}>
      {/* Tab Buttons Header */}
      <div className={cn("flex items-center gap-xs", headerClassName)}>
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeId;

          const buttonContent = (
            <>
              {tab.icon ? <span className="shrink-0">{tab.icon}</span> : null}
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge !== null ? (
                <span>{tab.badge}</span>
              ) : null}
            </>
          );

          if (tab.href) {
            return (
              <Button
                key={tab.id}
                nativeButton={false}
                className={cn("flex-1", tabClassName, tab.className)}
                render={<Link href={tab.href} scroll={false} />}
                variant={isActive ? "primary" : "card"}
                disabled={tab.disabled}
                onClick={tab.onClick}>
                {buttonContent}
              </Button>
            );
          }

          return (
            <Button
              key={tab.id}
              type="button"
              className={cn("flex-1", tabClassName, tab.className)}
              variant={isActive ? "primary" : "card"}
              disabled={tab.disabled}
              onClick={() => {
                if (activeIdProp === undefined) {
                  setInternalActiveId(tab.id);
                }
                onTabChange?.(tab.id, index);
                tab.onClick?.();
              }}>
              {buttonContent}
            </Button>
          );
        })}
      </div>

      {/* Optional between section (e.g. progress bar) */}
      {between}

      {/* Animated Sliding Panels */}
      <div className={cn("overflow-hidden rounded-component", panelClassName)}>
        <AnimatePresence
          mode={mode}
          initial={false}
          custom={{ direction, isRtl: effectiveIsRtl }}>
          <motion.div
            key={activeId}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-sm"
            variants={slideVariants}
            custom={{ direction, isRtl: effectiveIsRtl }}
            transition={
              transition || {
                duration: 0.22,
                ease: [0.25, 1, 0.5, 1],
              }
            }>
            {renderedContent}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default SlideTabs;
