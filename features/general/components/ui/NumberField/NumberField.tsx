"use client";

import {
  ComponentProps,
  forwardRef,
  ReactNode,
  useId,
} from "react";
import { NumberField as BaseUINumberField } from "@base-ui/react/number-field";
import { MinusIcon, PlusIcon } from "lucide-react";
import { cn } from "cn";

type SizeVariant = "sm" | "md" | "lg";

const sizeClasses: Record<
  SizeVariant,
  {
    group: string;
    button: string;
    input: string;
    icon: string;
  }
> = {
  sm: {
    group: "h-8",
    button: "h-8 w-8",
    input: "h-8 w-12 text-xs",
    icon: "size-3.5",
  },
  md: {
    group: "h-10",
    button: "h-10 w-9",
    input: "h-10 w-14 text-sm",
    icon: "size-4",
  },
  lg: {
    group: "h-12",
    button: "h-12 w-11",
    input: "h-12 w-16 text-base",
    icon: "size-5",
  },
};

type NumberFieldProps = Omit<
  ComponentProps<typeof BaseUINumberField.Root>,
  "children"
> & {
  size?: SizeVariant;
  groupClassName?: string;
  inputClassName?: string;
  stepperClassName?: string;
  decrementClassName?: string;
  incrementClassName?: string;
  decrementIcon?: ReactNode;
  incrementIcon?: ReactNode;
  label?: ReactNode;
  labelClassName?: string;
  showSteppers?: boolean;
  children?: ReactNode;
  inputProps?: Omit<ComponentProps<typeof BaseUINumberField.Input>, "className">;
};

const LocalNumberField = forwardRef<HTMLDivElement, NumberFieldProps>(
  (
    {
      size = "md",
      className,
      groupClassName,
      inputClassName,
      stepperClassName,
      decrementClassName,
      incrementClassName,
      decrementIcon,
      incrementIcon,
      label,
      labelClassName,
      showSteppers = true,
      children,
      inputProps,
      id: propId,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = propId ?? generatedId;
    const currentSize = sizeClasses[size] ?? sizeClasses.md;

    return (
      <BaseUINumberField.Root
        ref={ref}
        id={id}
        className={cn("inline-flex flex-col", className)}
        {...props}
      >
        {label ? (
          <BaseUINumberField.ScrubArea className="mb-xs cursor-ew-resize font-bold select-none">
            <label
              htmlFor={id}
              className={cn(
                "cursor-ew-resize text-sm font-medium",
                labelClassName,
              )}
            >
              {label}
            </label>
          </BaseUINumberField.ScrubArea>
        ) : null}

        {children ? (
          children
        ) : (
          <BaseUINumberField.Group
            className={cn(
              "inline-flex items-center rounded-component bg-card overflow-hidden transition-colors",
              currentSize.group,
              groupClassName,
            )}
          >
            {showSteppers && (
              <BaseUINumberField.Decrement
                className={cn(
                  "flex shrink-0 items-center justify-center bg-card-thick/50 transition-colors select-none",
                  "hover:not-data-disabled:bg-card-thick active:not-data-disabled:bg-foreground/10",
                  "disabled:opacity-40 disabled:cursor-not-allowed data-disabled:opacity-40 data-disabled:cursor-not-allowed",
                  currentSize.button,
                  stepperClassName,
                  decrementClassName,
                )}
              >
                {decrementIcon ?? <MinusIcon />}
              </BaseUINumberField.Decrement>
            )}

            <BaseUINumberField.Input
              className={cn(
                "bg-transparent text-center font-medium tabular-nums select-text",
                currentSize.input,
                inputClassName,
              )}
              {...inputProps}
            />

            {showSteppers && (
              <BaseUINumberField.Increment
                className={cn(
                  "flex shrink-0 items-center justify-center bg-card-thick/50 transition-colors select-none",
                  "hover:not-data-disabled:bg-card-thick active:not-data-disabled:bg-foreground/10",
                  "disabled:opacity-40 disabled:cursor-not-allowed data-disabled:opacity-40 data-disabled:cursor-not-allowed",
                  currentSize.button,
                  stepperClassName,
                  incrementClassName,
                )}
              >
                {incrementIcon ?? <PlusIcon />}
              </BaseUINumberField.Increment>
            )}
          </BaseUINumberField.Group>
        )}
      </BaseUINumberField.Root>
    );
  },
);

LocalNumberField.displayName = "NumberField";

const NumberField = Object.assign(LocalNumberField, {
  Root: BaseUINumberField.Root,
  Group: BaseUINumberField.Group,
  Input: BaseUINumberField.Input,
  Increment: BaseUINumberField.Increment,
  Decrement: BaseUINumberField.Decrement,
  ScrubArea: BaseUINumberField.ScrubArea,
  ScrubAreaCursor: BaseUINumberField.ScrubAreaCursor,
});

export default NumberField;
export { NumberField };
export type { NumberFieldProps };
