import { cn } from "cn";
import Link from "next/link";
import { ComponentProps, ReactNode } from "react";
import { PlusCircleIcon } from "lucide-react";

import { Button } from "../../ui/Button/Button";

export type EmptyAlertProps = ComponentProps<"div"> & {
  alert?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  href?: string;
  action?: ReactNode;
  alertClassName?: string;
  descriptionClassName?: string;
};

export function EmptyAlert({
  href,
  alert,
  description,
  icon,
  action,
  children,
  className,
  alertClassName,
  descriptionClassName,
  ...props
}: EmptyAlertProps) {
  return (
    <div
      className={cn(
        "w-full flex gap-3 p-6 rounded-container border-2 border-dashed border-foreground/15 flex-col justify-center items-center text-center",
        className,
      )}
      {...props}>
      {icon ? (
        <div className="size-10 rounded-full bg-foreground/5 flex items-center justify-center shrink-0 text-foreground/40 mb-0.5">
          {icon}
        </div>
      ) : null}

      {alert ? (
        <p
          className={cn(
            "title text-sm sm:text-base font-semibold text-foreground/80",
            alertClassName,
          )}>
          {alert}
        </p>
      ) : null}

      {description ? (
        <p
          className={cn(
            "sub-text max-w-xs leading-relaxed text-xs",
            descriptionClassName,
          )}>
          {description}
        </p>
      ) : null}

      {children}

      {action ? (
        action
      ) : href ? (
        <Button
          size={"square"}
          variant={"primary"}
          nativeButton={false}
          render={
            <Link href={href}>
              <PlusCircleIcon />
            </Link>
          }
        />
      ) : null}
    </div>
  );
}

export default EmptyAlert;
