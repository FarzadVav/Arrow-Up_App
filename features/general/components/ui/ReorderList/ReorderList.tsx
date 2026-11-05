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

export type ReorderContextType = {
  isReorderActive: boolean;
};

export const ReorderContext = createContext<ReorderContextType>({
  isReorderActive: false,
});

export function useReorder() {
  return useContext(ReorderContext);
}

type ReorderItemContextType = {
  dragControls: DragControls;
  isHeld: boolean;
};

const ReorderItemContext = createContext<ReorderItemContextType | null>(null);

export function useReorderHandle() {
  return useContext(ReorderItemContext);
}

export type ReorderHandleProps = HTMLAttributes<HTMLDivElement>;

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

function scrollBy(container: HTMLElement | Window, delta: number) {
  if (container === window) {
    window.scrollBy({ top: delta, behavior: "instant" as ScrollBehavior });
  } else {
    (container as HTMLElement).scrollTop += delta;
  }
}

// touch-action is "none" on the items, so vertical finger movement has to move
// the scroll container by hand. This reproduces the flick that native scrolling
// would have given us.
function flickScroll(
  container: HTMLElement | Window,
  velocity: number,
  cancelRef: { current: number | null }
) {
  let last = performance.now();

  const step = (now: number) => {
    const dt = now - last;
    last = now;
    velocity *= Math.pow(0.94, dt / 16);

    if (Math.abs(velocity) < 0.02) {
      cancelRef.current = null;
      return;
    }

    scrollBy(container, velocity * dt);
    cancelRef.current = requestAnimationFrame(step);
  };

  cancelRef.current = requestAnimationFrame(step);
}

function touchPoint(ev: PointerEvent | TouchEvent) {
  if ("touches" in ev) {
    const touch = ev.touches[0] ?? (ev as TouchEvent).changedTouches[0];
    return touch ? { x: touch.clientX, y: touch.clientY } : null;
  }
  const pointer = ev as PointerEvent;
  return { x: pointer.clientX, y: pointer.clientY };
}

function findScrollableParent(
  element: HTMLElement | null
): HTMLElement | Window {
  if (typeof window === "undefined") return null as unknown as Window;

  let current = element;

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
        } else if (distFromBottom < threshold && distFromBottom >= -60) {
          const intensity = Math.min(
            Math.max((threshold - distFromBottom) / threshold, 0),
            1.5
          );
          speed = Math.round(
            maxSpeed * (intensity * 0.35 + intensity * intensity * 0.65)
          );
        }

        if (speed !== 0) {
          scrollBy(container, speed);
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
  onHoldStart: (item: T) => void;
  onDragEnd: (item: T) => void;
  onDragStart: (item: T) => void;
  renderItem: (item: T) => ReactNode;
  updatePointer: (y: number) => void;
  isDraggingAnyRef: React.RefObject<boolean>;
};

function ReorderListItem<T extends { id: number }>({
  item,
  onHoldStart,
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
  const gestureCleanupRef = useRef<(() => void) | null>(null);
  const inertiaRef = useRef<number | null>(null);
  const isHeldRef = useRef(false);

  const [isHeld, setIsHeld] = useState(false);

  const stopInertia = useCallback(() => {
    if (inertiaRef.current !== null) {
      cancelAnimationFrame(inertiaRef.current);
      inertiaRef.current = null;
    }
  }, []);

  const endGesture = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    gestureCleanupRef.current?.();
    gestureCleanupRef.current = null;

    if (isHeldRef.current) {
      isHeldRef.current = false;
      setIsHeld(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      endGesture();
      stopInertia();
    };
  }, [endGesture, stopInertia]);

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

    const isControl = isInteractiveControl(target);
    const isHandle = Boolean(target?.closest("[data-reorder-handle]"));
    const isTouch = e.pointerType === "touch";

    // Controls keep their own gestures, but under touch-action: none they still
    // need us to move the scroll container by hand.
    if ((isControl || isHandle) && !isTouch) return;

    endGesture();
    stopInertia();

    const startX = e.clientX;
    const startY = e.clientY;
    const scrollContainer = isTouch
      ? findScrollableParent(target ?? itemRef.current)
      : null;

    let ended = false;
    let axis: "y" | "swipe" | null = null;
    let lastY = startY;
    const samples: { t: number; y: number }[] = [{ t: e.timeStamp, y: startY }];

    const releaseHold = () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    };

    const handleMove = (ev: Event) => {
      if (ended) return;

      const point = touchPoint(ev as TouchEvent);
      if (!point) return;

      // The reorder drag owns the gesture now; motion drives it.
      if (isHeldRef.current) return;

      if (axis !== null) {
        if (axis === "y" && scrollContainer) {
          scrollBy(scrollContainer, -(point.y - lastY));
          lastY = point.y;
          samples.push({ t: ev.timeStamp, y: point.y });
          while (samples.length > 2 && ev.timeStamp - samples[0].t > 90) {
            samples.shift();
          }
        }
        return;
      }

      const deltaX = Math.abs(point.x - startX);
      const deltaY = Math.abs(point.y - startY);

      // Moving before the hold completes means the user wants to scroll the page
      // or swipe the card, so drop the hold and only take over vertical motion.
      if (deltaX + deltaY > 10) {
        axis = deltaX > deltaY ? "swipe" : "y";
        lastY = point.y;
        releaseHold();

        // A horizontal swipe belongs to the card's own drag handlers.
        if (axis === "swipe") endGesture();
      }
    };

    const handleEnd = () => {
      if (ended) return;
      ended = true;

      releaseHold();
      endGesture();

      if (axis !== "y" || !scrollContainer || samples.length < 2) return;

      const first = samples[0];
      const last = samples[samples.length - 1];
      const duration = last.t - first.t;
      if (duration <= 0) return;

      flickScroll(scrollContainer, -(last.y - first.y) / duration, inertiaRef);
    };

    const moveEvent: "pointermove" | "touchmove" = isTouch
      ? "touchmove"
      : "pointermove";
    const endEvents: (
      | "pointerup"
      | "pointercancel"
      | "touchend"
      | "touchcancel"
    )[] = isTouch
      ? ["touchend", "touchcancel", "pointercancel"]
      : ["pointerup", "pointercancel"];

    for (const type of [moveEvent, ...endEvents]) {
      window.addEventListener(type, handleMove, { passive: true });
    }
    for (const type of endEvents) {
      window.addEventListener(type, handleEnd, { once: true, passive: true });
    }

    gestureCleanupRef.current = () => {
      window.removeEventListener(moveEvent, handleMove);
      for (const type of endEvents) {
        window.removeEventListener(type, handleMove);
        window.removeEventListener(type, handleEnd);
      }
    };

    if (isControl || isHandle) return;

    holdTimerRef.current = setTimeout(() => {
      holdTimerRef.current = null;
      endGesture();

      isHeldRef.current = true;
      setIsHeld(true);
      isDraggingAnyRef.current = true;
      onHoldStart(item);

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(20);
        } catch {}
      }

      controls.start(e.nativeEvent);
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
    <ReorderItemContext.Provider value={{ dragControls: controls, isHeld }}>
      <Reorder.Item
        as="div"
        ref={itemRef}
        value={item.id}
        data-reorder="item"
        dragListener={false}
        dragControls={controls}
        className="w-full select-none touch-none"
        style={{ touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onClickCapture={handleClickCapture}
        animate={
          isHeld
            ? { scale: 0.95, filter: "blur(2px)" }
            : { scale: 1, filter: "blur(0px)" }
        }
        whileDrag={{
          scale: 0.95,
          filter: "blur(2px)",
          zIndex: 50,
        }}
        transition={{
          scale: { duration: 0.2, ease: "easeOut" },
          filter: { duration: 0.2, ease: "easeOut" },
        }}
        onDragStart={() => {
          setIsHeld(true);
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
          endGesture();
          stopInertia();
          onDragEnd(item);
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
  holdDelayMs = 1000,
  autoScrollThreshold = 100,
  autoScrollMaxSpeed = 24,
}: ReorderListProps<T>) {
  const [order, setOrder] = useState<number[]>(() => items.map((i) => i.id));
  const orderRef = useRef(order);
  const initialOrderRef = useRef<number[]>([]);
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

    const handlePointerMove = (e: PointerEvent) => {
      updatePointer(e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        updatePointer(e.touches[0].clientY);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isDragging, updatePointer]);

  const handleHoldStart = () => {
    initialOrderRef.current = [...orderRef.current];
    setIsDragging(true);
    isDraggingAnyRef.current = true;
    startAutoScroll(groupRef.current);
  };

  const handleDragStart = () => {
    if (!isDragging) {
      initialOrderRef.current = [...orderRef.current];
      setIsDragging(true);
      isDraggingAnyRef.current = true;
      startAutoScroll(groupRef.current);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    stopAutoScroll();

    const hasChanged =
      orderRef.current.length !== initialOrderRef.current.length ||
      orderRef.current.some((id, idx) => id !== initialOrderRef.current[idx]);

    if (hasChanged) {
      persistOrder();
    }

    setTimeout(() => {
      isDraggingAnyRef.current = false;
    }, 120);
  };

  const itemById = new Map(items.map((i) => [i.id, i]));
  const orderedItems = order
    .map((id) => itemById.get(id))
    .filter((i): i is T => Boolean(i));

  return (
    <ReorderContext.Provider value={{ isReorderActive: isDragging }}>
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
            onHoldStart={handleHoldStart}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            updatePointer={updatePointer}
            isDraggingAnyRef={isDraggingAnyRef}
          />
        ))}
      </Reorder.Group>
    </ReorderContext.Provider>
  );
}

const ReorderList = Object.assign(ReorderListComponent, {
  Handle: ReorderHandle,
});

export default ReorderList;
export { ReorderList };
