"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
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
      ...props
    },
    ref,
  ) => {
    const cardDate = date ?? dateTime;
    const isInteractive = Boolean(props.onClick);

    return (
      <div
        ref={ref}
        className={cn(
          cardViewVariants({ variant }),
          description || cardDate ? "items-start" : "items-center",
          isInteractive && "hover:opacity-90 active:scale-[0.99]",
          className,
        )}
        {...props}>
        {icon && (
          <div
            className={cn(
              "shrink-0 flex items-center justify-center",
              (description || cardDate) && "mt-0.5",
            )}>
            {icon}
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="font-bold text-sm truncate leading-snug">{title}</div>

          {description && (
            <div className="sub-text line-clamp-2 mt-0.5 leading-relaxed">
              {description}
            </div>
          )}

          {cardDate && (
            <div className="sub-text mt-1 flex items-center gap-xs">
              {cardDate}
            </div>
          )}
        </div>

        {badge && (
          <div className="shrink-0 flex items-center self-center">{badge}</div>
        )}
      </div>
    );
  },
);

CardView.displayName = "CardView";

export { CardView, cardViewVariants };
export default CardView;
