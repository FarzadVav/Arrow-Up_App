"use client";

import { cn } from "cn";
import { Reorder, useDragControls, type DragControls } from "motion/react";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  HTMLAttributes,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";

import type { ReorderEntity } from "@/app/api/reorder/route";

type ReorderItemContextType = {
  dragControls: DragControls;
};

const ReorderItemContext = createContext<ReorderItemContextType | null>(null);

export function useReorderHandle() {
  return useContext(ReorderItemContext);
}

export type ReorderHandleProps = HTMLAttributes<HTMLDivElement>

export const ReorderHandle = forwardRef<HTMLDivElement, ReorderHandleProps>(
  ({ className, onPointerDown, ...p }, ref) => {
    const ctx = useContext(ReorderItemContext);

    return (
      <div
        ref={ref}
        data-reorder-handle="true"
        style={{ touchAction: "none" }}
        className={cn(
          "cursor-grab active:cursor-grabbing select-none touch-none",
          className
        )}
        onPointerDown={(e) => {
          onPointerDown?.(e);
          if (e.isDefaultPrevented()) return;
          if (ctx) {
            e.stopPropagation();
            ctx.dragControls.start(e);
          }
        }}
        {...p}
      />
    );
  }
);
ReorderHandle.displayName = "ReorderHandle";

export type ReorderListProps<T extends { id: number }> = {
  items: T[];
  className?: string;
  entity: ReorderEntity;
  holdDelayMs?: number;
  revalidate?: () => void;
  autoScrollMaxSpeed?: number;
  autoScrollThreshold?: number;
  renderItem: (item: T) => ReactNode;
};

function isInteractiveControl(el: HTMLElement | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    el.isContentEditable ||
    Boolean(
      el.closest(
        "input, textarea, select, [contenteditable='true'], [data-no-drag]"
      )
    )
  );
}

function findScrollableParent(
  element: HTMLElement | null
): HTMLElement | Window {
  if (typeof window === "undefined") return null as unknown as Window;

  let current = element?.parentElement;

  while (
    current &&
    current !== document.body &&
    current !== document.documentElement
  ) {
    const style = window.getComputedStyle(current);
    const overflowY = style.overflowY;

    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      current.scrollHeight > current.clientHeight
    ) {
      return current;
    }

    current = current.parentElement;
  }

  return window;
}

function useAutoScroll({
  threshold = 100,
  maxSpeed = 24,
}: {
  threshold?: number;
  maxSpeed?: number;
} = {}) {
  const isScrollingRef = useRef(false);
  const pointerYRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLElement | Window | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const stopAutoScroll = useCallback(() => {
    isScrollingRef.current = false;
    pointerYRef.current = null;
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const startAutoScroll = useCallback(
    (groupEl: HTMLElement | null) => {
      stopAutoScroll();
      containerRef.current = findScrollableParent(groupEl);
      isScrollingRef.current = true;

      const loop = () => {
        if (!isScrollingRef.current) {
          rafIdRef.current = null;
          return;
        }

        const container = containerRef.current;
        const y = pointerYRef.current;

        if (!container || y === null) {
          rafIdRef.current = requestAnimationFrame(loop);
          return;
        }

        const isWin = container === window;
        let topBound = 0;
        let bottomBound = window.innerHeight;

        if (!isWin && (container as HTMLElement).getBoundingClientRect) {
          const rect = (container as HTMLElement).getBoundingClientRect();
          topBound = rect.top;
          bottomBound = rect.bottom;
        }

        const distFromTop = y - topBound;
        const distFromBottom = bottomBound - y;

        let speed = 0;

        if (distFromTop < threshold && distFromTop >= -60) {
          const intensity = Math.min(
            Math.max((threshold - distFromTop) / threshold, 0),
            1.5
          );
          speed = -Math.round(
            maxSpeed * (intensity * 0.35 + intensity * intensity * 0.65)
          );
        }
        else if (distFromBottom < threshold && distFromBottom >= -60) {
          const intensity = Math.min(
            Math.max((threshold - distFromBottom) / threshold, 0),
            1.5
          );
          speed = Math.round(
            maxSpeed * (intensity * 0.35 + intensity * intensity * 0.65)
          );
        }

        if (speed !== 0) {
          if (isWin) {
            window.scrollBy({ top: speed, behavior: "instant" as ScrollBehavior });
          } else {
            (container as HTMLElement).scrollTop += speed;
          }
        }

        rafIdRef.current = requestAnimationFrame(loop);
      };

      rafIdRef.current = requestAnimationFrame(loop);
    },
    [maxSpeed, stopAutoScroll, threshold]
  );

  const updatePointer = useCallback((y: number) => {
    pointerYRef.current = y;
  }, []);

  useEffect(() => {
    return () => {
      stopAutoScroll();
    };
  }, [stopAutoScroll]);

  return { startAutoScroll, stopAutoScroll, updatePointer };
}

type ReorderListItemProps<T extends { id: number }> = {
  item: T;
  holdDelayMs: number;
  onDragEnd: (item: T) => void;
  onDragStart: (item: T) => void;
  renderItem: (item: T) => ReactNode;
  updatePointer: (y: number) => void;
  isDraggingAnyRef: React.RefObject<boolean>;
};

function ReorderListItem<T extends { id: number }>({
  item,
  onDragEnd,
  renderItem,
  holdDelayMs,
  onDragStart,
  updatePointer,
  isDraggingAnyRef,
}: ReorderListItemProps<T>) {
  const controls = useDragControls();
  const itemRef = useRef<HTMLDivElement>(null);

  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const savedPointerEventRef = useRef<PointerEvent | null>(null);
  const touchPreventCleanupRef = useRef<(() => void) | null>(null);
  const holdListenersCleanupRef = useRef<(() => void) | null>(null);

  const [isHeld, setIsHeld] = useState(false);

  const cleanupTouchPrevent = useCallback(() => {
    if (touchPreventCleanupRef.current) {
      touchPreventCleanupRef.current();
      touchPreventCleanupRef.current = null;
    }
  }, []);

  const clearHoldListeners = useCallback(() => {
    if (holdListenersCleanupRef.current) {
      holdListenersCleanupRef.current();
      holdListenersCleanupRef.current = null;
    }
  }, []);

  const clearHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    clearHoldListeners();
    startPosRef.current = null;
    savedPointerEventRef.current = null;
    setIsHeld(false);
  }, [clearHoldListeners]);

  useEffect(() => {
    return () => {
      clearHold();
      cleanupTouchPrevent();
    };
  }, [clearHold, cleanupTouchPrevent]);

  useEffect(() => {
    const el = itemRef.current;
    if (!el) return;

    const handleNativeClick = (e: MouseEvent) => {
      if (isDraggingAnyRef.current) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setTimeout(() => {
          isDraggingAnyRef.current = false;
        }, 50);
      }
    };

    el.addEventListener("click", handleNativeClick, { capture: true });
    return () => {
      el.removeEventListener("click", handleNativeClick, { capture: true });
    };
  }, [isDraggingAnyRef]);

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;

    const target = e.target as HTMLElement | null;

    if (isInteractiveControl(target)) return;

    if (target?.closest("[data-reorder-handle]")) return;

    if (e.pointerType === "mouse") {
      controls.start(e);
      return;
    }

    clearHold();
    cleanupTouchPrevent();

    startPosRef.current = { x: e.clientX, y: e.clientY };
    savedPointerEventRef.current = e.nativeEvent;

    const handleMoveDuringHold = (ev: TouchEvent | PointerEvent) => {
      if (!startPosRef.current) return;
      const clientX =
        "touches" in ev ? ev.touches[0]?.clientX : (ev as PointerEvent).clientX;
      const clientY =
        "touches" in ev ? ev.touches[0]?.clientY : (ev as PointerEvent).clientY;

      if (clientX === undefined || clientY === undefined) return;

      const dist = Math.hypot(
        clientX - startPosRef.current.x,
        clientY - startPosRef.current.y
      );

      if (dist > 14) {
        clearHold();
      }
    };

    const handleCancelDuringHold = () => {
      clearHold();
    };

    window.addEventListener("pointermove", handleMoveDuringHold, { passive: true });
    window.addEventListener("touchmove", handleMoveDuringHold, { passive: true });
    window.addEventListener("pointerup", handleCancelDuringHold, { once: true });
    window.addEventListener("pointercancel", handleCancelDuringHold, { once: true });
    window.addEventListener("touchend", handleCancelDuringHold, { once: true });

    holdListenersCleanupRef.current = () => {
      window.removeEventListener("pointermove", handleMoveDuringHold);
      window.removeEventListener("touchmove", handleMoveDuringHold);
      window.removeEventListener("pointerup", handleCancelDuringHold);
      window.removeEventListener("pointercancel", handleCancelDuringHold);
      window.removeEventListener("touchend", handleCancelDuringHold);
    };

    holdTimerRef.current = setTimeout(() => {
      clearHoldListeners();

      setIsHeld(true);
      isDraggingAnyRef.current = true;

      const preventTouchScroll = (te: TouchEvent) => {
        if (te.cancelable) {
          te.preventDefault();
        }
      };

      window.addEventListener("touchmove", preventTouchScroll, { passive: false });
      touchPreventCleanupRef.current = () => {
        window.removeEventListener("touchmove", preventTouchScroll);
      };

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(20);
        } catch { }
      }

      if (savedPointerEventRef.current) {
        controls.start(savedPointerEventRef.current);
      }
    }, holdDelayMs);
  };

  const handleClickCapture = (e: ReactMouseEvent) => {
    if (isDraggingAnyRef.current) {
      e.preventDefault();
      e.stopPropagation();
      setTimeout(() => {
        isDraggingAnyRef.current = false;
      }, 50);
    }
  };

  return (
    <ReorderItemContext.Provider value={{ dragControls: controls }}>
      <Reorder.Item
        as="div"
        ref={itemRef}
        value={item.id}
        data-reorder="item"
        dragListener={false}
        dragControls={controls}
        className="touch-pan-y"
        style={{ touchAction: "pan-y" }}
        onPointerDown={handlePointerDown}
        onClickCapture={handleClickCapture}
        animate={isHeld ? { scale: 1.03 } : { scale: 1 }}
        onDragStart={() => {
          clearHold();
          isDraggingAnyRef.current = true;
          onDragStart(item);
        }}
        onDrag={(event, info) => {
          const clientY =
            (event as PointerEvent)?.clientY ??
            (info?.point?.y !== undefined
              ? info.point.y - window.scrollY
              : null);
          if (clientY !== null) {
            updatePointer(clientY);
          }
        }}
        onDragEnd={() => {
          clearHold();
          cleanupTouchPrevent();
          onDragEnd(item);
        }}
        whileDrag={{
          scale: 1.03,
          opacity: 0.94,
          zIndex: 50,
          boxShadow:
            "0 12px 28px -4px rgba(0, 0, 0, 0.16), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        }}
      >
        {renderItem(item)}
      </Reorder.Item>
    </ReorderItemContext.Provider>
  );
}

function ReorderListComponent<T extends { id: number }>({
  items,
  entity,
  renderItem,
  revalidate,
  className,
  holdDelayMs = 220,
  autoScrollThreshold = 100,
  autoScrollMaxSpeed = 24,
}: ReorderListProps<T>) {
  const [order, setOrder] = useState<number[]>(() => items.map((i) => i.id));
  const orderRef = useRef(order);
  const groupRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const isDraggingAnyRef = useRef(false);

  const { startAutoScroll, stopAutoScroll, updatePointer } = useAutoScroll({
    threshold: autoScrollThreshold,
    maxSpeed: autoScrollMaxSpeed,
  });

  const handleReorder = (next: number[]) => {
    orderRef.current = next;
    setOrder(next);
  };

  useEffect(() => {
    if (isDraggingAnyRef.current) return;

    const serverIds = items.map((i) => i.id);
    if (
      orderRef.current.length === serverIds.length &&
      serverIds.every((id) => orderRef.current.includes(id))
    ) {
      return;
    }

    orderRef.current = serverIds;
    setOrder(serverIds);
  }, [items]);

  const persistOrder = () => {
    fetch("/api/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity, ids: orderRef.current }),
    }).then((res) => {
      if (!res.ok) revalidate?.();
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleWindowPointerMove = (e: PointerEvent) => {
      updatePointer(e.clientY);
    };

    window.addEventListener("pointermove", handleWindowPointerMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
    };
  }, [isDragging, updatePointer]);

  const handleDragStart = () => {
    setIsDragging(true);
    isDraggingAnyRef.current = true;
    startAutoScroll(groupRef.current);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    stopAutoScroll();
    persistOrder();

    setTimeout(() => {
      isDraggingAnyRef.current = false;
    }, 120);
  };

  const itemById = new Map(items.map((i) => [i.id, i]));
  const orderedItems = order
    .map((id) => itemById.get(id))
    .filter((i): i is T => Boolean(i));

  return (
    <Reorder.Group
      as="div"
      axis="y"
      ref={groupRef}
      values={order}
      data-reorder="group"
      onReorder={handleReorder}
      className={cn("w-full space-y-sm", className)}
    >
      {orderedItems.map((item) => (
        <ReorderListItem
          item={item}
          key={item.id}
          renderItem={renderItem}
          holdDelayMs={holdDelayMs}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          updatePointer={updatePointer}
          isDraggingAnyRef={isDraggingAnyRef}
        />
      ))}
    </Reorder.Group>
  );
}

const ReorderList = Object.assign(ReorderListComponent, {
  Handle: ReorderHandle,
});

export default ReorderList;
export { ReorderList };
