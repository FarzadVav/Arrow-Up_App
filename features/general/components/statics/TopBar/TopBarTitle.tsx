import { HTMLAttributes } from "react";

import { cn } from "cn";

type TopBarTitleProps = HTMLAttributes<HTMLElement> & {
  asTitle?: boolean;
};

function TopBarTitle({ className, asTitle, ...p }: TopBarTitleProps) {
  const Tag = asTitle ? "h1" : "div";

  return (
    <Tag
      className={cn(
        "absolute left-1/2 -translate-x-1/2",
        asTitle ? "title text-center" : "",
        className,
      )}
      {...p}
    />
  );
}

export default TopBarTitle;
