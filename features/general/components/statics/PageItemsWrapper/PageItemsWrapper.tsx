import { cn } from "cn";
import { ComponentProps } from "react";

function PageItemsWrapper({ className, ...p }: ComponentProps<"div">) {
  return (
    <div
      className={cn("w-full flex flex-col justify-start items-start flex-1 gap-md", className)}
      {...p}
    />
  );
}

export default PageItemsWrapper;
