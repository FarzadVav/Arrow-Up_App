"use client";

import { cn } from "cn";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { ComponentProps, ReactNode } from "react";

import { Button } from "../../ui/Button/Button";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";

export type EmptyAlertProps = ComponentProps<"div"> & {
  alert: ReactNode;
  description?: ReactNode;
  href?: string;
  action?: ReactNode;
  alertClassName?: string;
  descriptionClassName?: string;
};

export function EmptyAlert({
  href,
  alert,
  action,
  children,
  className,
  description,
  alertClassName,
  descriptionClassName,
  ...props
}: EmptyAlertProps) {
  const { t } = useLocale();

  return (
    <div
      className={cn(
        "w-full flex gap-sm p-sm rounded-component border-2 border-dashed flex-col justify-center items-center text-center",
        className,
      )}
      {...props}>
      {alert ? <p className={cn("title", alertClassName)}>{alert}</p> : null}

      {description ? (
        <p className={cn("sub-text", descriptionClassName)}>{description}</p>
      ) : null}

      {children}

      {action ? (
        action
      ) : href ? (
        <Button
          variant={"card"}
          nativeButton={false}
          render={
            <Link href={href}>
              <span>{t("common.addFirst")}</span>
              <PlusIcon />
            </Link>
          }
        />
      ) : null}
    </div>
  );
}

export default EmptyAlert;
