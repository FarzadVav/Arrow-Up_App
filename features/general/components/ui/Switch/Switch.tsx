"use client";

import { ComponentProps } from "react";
import { Switch as BaseUISwitch } from "@base-ui/react/switch";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const switchTrackVariants = cva(
  [
    "group inline-flex shrink-0 items-center rounded-container transition-colors duration-200 ease-in-out select-none",
    "bg-card-thick",
    "data-checked:bg-foreground",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      size: {
        sm: "h-5 w-9 p-0.5",
        md: "h-6 w-11 p-0.5",
        lg: "h-7 w-13 p-0.5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const switchThumbVariants = cva(
  [
    "pointer-events-none block rounded-container transition-all duration-200 ease-in-out",
    "bg-foreground/70 shadow-sm",
    "data-checked:bg-background",
  ],
  {
    variants: {
      size: {
        sm: "size-3.5 data-checked:translate-x-4",
        md: "size-4.5 data-checked:translate-x-5",
        lg: "size-5.5 data-checked:translate-x-6",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

type SwitchProps = ComponentProps<typeof BaseUISwitch.Root> &
  VariantProps<typeof switchTrackVariants> & {
    thumbClassName?: string;
  };

function LocalSwitch({
  size = "md",
  className,
  thumbClassName,
  children,
  ...props
}: SwitchProps) {
  return (
    <BaseUISwitch.Root
      className={cn(switchTrackVariants({ size }), className)}
      {...props}
    >
      {children ? (
        children
      ) : (
        <BaseUISwitch.Thumb
          className={cn(switchThumbVariants({ size }), thumbClassName)}
        />
      )}
    </BaseUISwitch.Root>
  );
}

const Switch = Object.assign(LocalSwitch, {
  Root: BaseUISwitch.Root,
  Thumb: BaseUISwitch.Thumb,
});

export default Switch;
export { Switch, switchTrackVariants, switchThumbVariants };
export type { SwitchProps };
