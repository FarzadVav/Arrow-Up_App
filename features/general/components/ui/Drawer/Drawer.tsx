"use client";

import { PropsWithChildren, ReactElement } from "react";
import { Drawer as BaseUIDrawer } from "@base-ui/react";

type LocalDrawerProps = PropsWithChildren & {
  trigger: ReactElement;
  nativeButton?: boolean;
};

function LocalDrawer({ children, trigger, nativeButton }: LocalDrawerProps) {
  return (
    <BaseUIDrawer.Root>
      <BaseUIDrawer.Trigger render={trigger} nativeButton={nativeButton} />
      <BaseUIDrawer.Portal>
        <BaseUIDrawer.Backdrop className="[--backdrop-opacity:0.9] [--bleed:3rem] fixed inset-0 min-h-dvh bg-background opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] transition-opacity duration-300 data-swiping:duration-0 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute z-big-overlay" />

        <BaseUIDrawer.Viewport className="fixed inset-0 flex items-end justify-center z-big-overlay">
          <BaseUIDrawer.Popup className="-mb-12 w-full max-h-[calc(100dvh-3rem)] p-sm pb-[calc(1.5rem+env(safe-area-inset-bottom,0px)+3rem)] overflow-y-auto overscroll-contain touch-auto transform-[translateY(var(--drawer-swipe-movement-y))] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:select-none data-ending-style:transform-[translateY(calc(100%-3rem+2px))] data-starting-style:transform-[translateY(calc(100%-3rem+2px))] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] bg-card">
            <div className="mx-auto mb-md h-1 w-16 rounded-component bg-card-thick" />

            <BaseUIDrawer.Content className="mx-auto w-full max-w-3xl space-y-md">
              {children}
            </BaseUIDrawer.Content>
          </BaseUIDrawer.Popup>
        </BaseUIDrawer.Viewport>
      </BaseUIDrawer.Portal>
    </BaseUIDrawer.Root>
  );
}

const Drawer = Object.assign(LocalDrawer, {
  Title: BaseUIDrawer.Title,
  Description: BaseUIDrawer.Description,
  Close: BaseUIDrawer.Close,
});

export default Drawer;
