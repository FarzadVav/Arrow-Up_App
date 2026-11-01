import { cn } from "cn";
import Link from "next/link";
import { ComponentProps, ReactNode } from "react";
import { PlusCircleIcon } from "lucide-react";

import { Button } from "../../ui/Button/Button";

export type EmptyAlertProps = ComponentProps<"div"> & {
  alert?: ReactNode;
  description?: ReactNode;
  href?: string;
  action?: ReactNode;
  alertClassName?: string;
  descriptionClassName?: string;
};

export function EmptyAlert({
  href,
  alert,
  description,
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
        "w-full flex gap-sm p-sm rounded-container border-2 border-dashed flex-col justify-center items-center text-center",
        className,
      )}
      {...props}>
      {alert ? (
        <p
          className={cn(
            "title",
            alertClassName,
          )}>
          {alert}
        </p>
      ) : null}

      {description ? (
        <p
          className={cn(
            "sub-text",
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
          variant={"card"}
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
