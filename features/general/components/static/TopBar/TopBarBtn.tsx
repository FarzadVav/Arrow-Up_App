"use client";

import { cn } from "cn";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "lucide-react";

import { Button, ButtonProps } from "../../ui/Button/Button";

export type TopBarBackBtnProps = ButtonProps & {
  goBack?: boolean;
  href?: string;
  position?: "left" | "right";
  backIcon?: boolean;
};

function TopBarBtn({
  href,
  goBack,
  onClick,
  children,
  backIcon,
  position,
  className,
  render,
  nativeButton,
  ...p
}: TopBarBackBtnProps) {
  const router = useRouter();

  const handleClick: ButtonProps["onClick"] = (ev) => {
    if (goBack) {
      router.back();
      return;
    }

    onClick?.(ev);
  };

  const computedRender = render ?? (href ? <Link href={href} /> : undefined);
  const computedNativeButton = nativeButton ?? (href ? false : undefined);

  return (
    <Button
      size={"square"}
      variant={"ghost"}
      render={computedRender}
      nativeButton={computedNativeButton}
      onClick={goBack ? handleClick : onClick}
      className={cn(
        position && "absolute",
        position === "left" && "left-0",
        position === "right" && "right-0",
        className,
      )}
      {...p}>
      {backIcon ? (
        <ChevronLeftIcon
          className={position === "left" ? "" : "-scale-x-100"}
        />
      ) : (
        children
      )}
    </Button>
  );
}

export default TopBarBtn;
