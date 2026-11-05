"use client";

import {
  forwardRef,
  useRef,
  useState,
  useEffect,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useDragControls,
  type PanInfo,
} from "motion/react";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";
import { useReorder } from "@/features/general/components/ui/ReorderList";
import { cn } from "cn";

const cardViewVariants = cva(
  "w-full flex gap-sm p-sm rounded-component transition-all select-none",
  {
    variants: {
      variant: {
        card: "bg-card",
        "card-thick": "bg-card-thick",
        background: "bg-background",
      },
    },
    defaultVariants: {
      variant: "card",
    },
  },
);

export interface CardViewProps
  extends
    Omit<HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof cardViewVariants> {
  title: ReactNode;
  icon?: ReactNode;
  description?: ReactNode;
  date?: ReactNode;
  dateTime?: ReactNode;
  badge?: ReactNode;
  isHistory?: boolean;
  swipeActions?: ReactNode;
  actions?: ReactNode;
}

const CardView = forwardRef<HTMLDivElement, CardViewProps>(
  (
    {
      title,
      icon,
      description,
      date,
      dateTime,
      badge,
      variant = "card",
      className,
      isHistory,
      swipeActions,
      actions,
      ...props
    },
    ref,
  ) => {
    const cardDate = date ?? dateTime;
    const isInteractive = Boolean(props.onClick);
    const finalSwipeActions = swipeActions ?? actions;

    const { locale } = useLocale();
    const isRtl = locale === "fa";
    const { isReorderActive } = useReorder();

    const containerRef = useRef<HTMLDivElement | null>(null);
    const actionsRef = useRef<HTMLDivElement | null>(null);
    const isDraggingRef = useRef(false);

    const [actionsWidth, setActionsWidth] = useState(80);
    const [isOpen, setIsOpen] = useState(false);

    const x = useMotionValue(0);
    const dragControls = useDragControls();

    // When reordering starts, cancel any active swipe and close the card if open
    useEffect(() => {
      if (isReorderActive) {
        dragControls.cancel();
        if (isOpen) {
          close();
        }
      }
    }, [isReorderActive, isOpen]);

    // Measure the actions container width dynamically
    useEffect(() => {
      if (!finalSwipeActions || !actionsRef.current) return;
      const updateWidth = () => {
        if (actionsRef.current) {
          const rect = actionsRef.current.getBoundingClientRect();
          if (rect.width > 0) {
            setActionsWidth(rect.width);
          }
        }
      };
      updateWidth();
      const observer = new ResizeObserver(updateWidth);
      observer.observe(actionsRef.current);
      return () => observer.disconnect();
    }, [finalSwipeActions]);

    // Close when tapping outside while open
    useEffect(() => {
      if (!isOpen) return;

      const handlePointerDownOutside = (e: PointerEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          animate(x, 0, {
            type: "spring",
            stiffness: 450,
            damping: 35,
          });
          setIsOpen(false);
        }
      };

      window.addEventListener("pointerdown", handlePointerDownOutside);
      return () => {
        window.removeEventListener("pointerdown", handlePointerDownOutside);
      };
    }, [isOpen, x]);

    // Actions entrance animations (opacity and subtle scale)
    const actionsOpacity = useTransform(
      x,
      isRtl
        ? [0, actionsWidth * 0.35, actionsWidth]
        : [0, -actionsWidth * 0.35, -actionsWidth],
      [0, 0.6, 1],
    );

    const actionsScale = useTransform(
      x,
      isRtl ? [0, actionsWidth] : [0, -actionsWidth],
      [0.85, 1],
    );

    const open = () => {
      const target = isRtl ? actionsWidth : -actionsWidth;
      animate(x, target, {
        type: "spring",
        stiffness: 450,
        damping: 35,
      });
      setIsOpen(true);
    };

    const close = () => {
      animate(x, 0, {
        type: "spring",
        stiffness: 450,
        damping: 35,
      });
      setIsOpen(false);
    };

    const handleDragStart = () => {
      isDraggingRef.current = true;
    };

    const handleDragEnd = (
      _event: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo,
    ) => {
      const currentX = x.get();
      const velocity = info.velocity.x;

      if (isRtl) {
        if (isOpen) {
          if (currentX < actionsWidth * 0.65 || velocity < -200) {
            close();
          } else {
            open();
          }
        } else {
          if (currentX > actionsWidth * 0.35 || velocity > 200) {
            open();
          } else {
            close();
          }
        }
      } else {
        if (isOpen) {
          if (currentX > -actionsWidth * 0.65 || velocity > 200) {
            close();
          } else {
            open();
          }
        } else {
          if (currentX < -actionsWidth * 0.35 || velocity < -200) {
            open();
          } else {
            close();
          }
        }
      }

      setTimeout(() => {
        isDraggingRef.current = false;
      }, 50);
    };

    const handleCardClick = (e: React.MouseEvent) => {
      if (isDraggingRef.current) {
        e.stopPropagation();
        e.preventDefault();
        return;
      }
      if (isOpen) {
        e.stopPropagation();
        e.preventDefault();
        close();
        return;
      }
    };

    const cardContent = (
      <>
        {icon && (
          <div
            className={cn(
              "shrink-0 flex items-center justify-center",
              (description || cardDate) && "mt-xs",
            )}>
            {icon}
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="font-bold text-sm truncate leading-snug">{title}</div>

          {description && (
            <div className="sub-text line-clamp-2 mt-xs leading-relaxed">
              {description}
            </div>
          )}

          {cardDate && (
            <div className="sub-text mt-xs flex items-center gap-xs">
              {cardDate}
            </div>
          )}
        </div>

        {badge && (
          <div className="shrink-0 flex items-center self-center">{badge}</div>
        )}
      </>
    );

    // If no swipe actions are provided, render standard card
    if (!finalSwipeActions) {
      return (
        <div
          ref={ref}
          data-card="true"
          className={cn(
            cardViewVariants({ variant }),
            description || cardDate ? "items-start" : "items-center",
            isInteractive && "hover:opacity-90 active:scale-[0.99]",
            isHistory && "history-striped",
            className,
          )}
          {...props}>
          {cardContent}
        </div>
      );
    }

    const assignRef = (node: HTMLDivElement | null) => {
      containerRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    return (
      <div
        ref={assignRef}
        data-card="true"
        className={cn(
          "relative overflow-hidden w-full rounded-component select-none bg-card-thick/40",
          className,
        )}
        {...props}>
        {/* Underneath: Swipe Action Tray */}
        <div
          ref={actionsRef}
          className={cn(
            "absolute inset-y-0 flex items-center gap-xs px-sm z-0",
            isRtl ? "left-0" : "right-0",
          )}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}>
          <motion.div
            className="flex items-center gap-xs"
            style={{ opacity: actionsOpacity, scale: actionsScale }}>
            {finalSwipeActions}
          </motion.div>
        </div>

        {/* Sliding Card Surface */}
        <motion.div
          drag={isReorderActive ? false : "x"}
          dragListener={!isReorderActive}
          dragControls={dragControls}
          dragDirectionLock
          dragMomentum={false}
          dragElastic={0.15}
          dragConstraints={
            isRtl
              ? { left: 0, right: actionsWidth }
              : { left: -actionsWidth, right: 0 }
          }
          style={{ x }}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onClick={handleCardClick}
          className={cn(
            cardViewVariants({ variant }),
            description || cardDate ? "items-start" : "items-center",
            isInteractive && "hover:opacity-90 active:scale-[0.99]",
            isHistory && "history-striped",
            "relative z-10 w-full touch-pan-y transition-none cursor-pointer",
          )}>
          {cardContent}
        </motion.div>
      </div>
    );
  },
);

CardView.displayName = "CardView";

export { CardView, cardViewVariants };
export default CardView;
