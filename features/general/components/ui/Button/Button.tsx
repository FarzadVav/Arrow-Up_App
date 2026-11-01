"use client";

import { cn } from "cn";
import { ComponentProps } from "react";
import { Button as BaseUIButton } from "@base-ui/react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  [
    "relative h-10 shrink-0 rounded-component px-sm",
    "inline-flex items-center justify-center gap-xs",
    "transition-all disabled:pointer-events-none disabled:opacity-50",
    "whitespace-nowrap",
    "active:rounded-[calc(var(--spacing)*10)] focus-visible:rounded-[calc(var(--spacing)*10)] focus-visible:active:rounded-component active:scale-x-98 origin-center",
  ],
  {
    variants: {
      variant: {
        primary: ["bg-foreground", "text-background", "hover:bg-foreground/90"],
        ghost: ["hover:bg-foreground/5"],
        outline: ["border-2 hover:bg-foreground/5"],
        card: [
          "bg-card [.bg-card_&]:bg-card-thick [.card_&]:bg-card-thick",
          "hover:bg-card/90 [.bg-card_&]:hover:bg-card-thick/90 [.card_&]:hover:bg-card-thick/90",
        ],
      },
      size: {
        default: "",
        square: "w-10 px-0",
        full: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

type ButtonProps = ComponentProps<typeof BaseUIButton> &
  VariantProps<typeof buttonVariants>;

function Button({
  size,
  variant,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <BaseUIButton
      type={type}
      className={cn(
        buttonVariants({
          variant,
          size,
        }),
        className,
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
