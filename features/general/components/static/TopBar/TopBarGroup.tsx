import { ComponentProps } from "react";
import { cn } from "cn";

export type TopBarGroupProps = ComponentProps<"div"> & {
  position?: "left" | "right";
};

function TopBarGroup({ position, className, ...props }: TopBarGroupProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-xs z-10",
        position === "left" && "mr-auto",
        position === "right" && "ms-auto",
        className,
      )}
      {...props}
    />
  );
}

export default TopBarGroup;
