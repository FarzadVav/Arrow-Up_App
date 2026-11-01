import { ComponentProps } from "react";

import { cn } from "cn";

type TopBarRootProps = ComponentProps<"header">;

function TopBarRoot({ className, ...p }: TopBarRootProps) {
  return (
    <header
      className={cn(
        "flex py-sm items-center justify-between relative w-full",
        className,
      )}
      {...p}
    />
  );
}

export default TopBarRoot;
