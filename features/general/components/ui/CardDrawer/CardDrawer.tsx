"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import Drawer from "@/features/general/components/ui/Drawer/Drawer";
import { Button } from "@/features/general/components/ui/Button/Button";
import CardView from "@/features/general/components/ui/CardView/CardView";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";
import { cn } from "cn";

export interface CardDrawerProps {
  title: string;
  content: ReactNode;
  editHref?: string;
  icon?: ReactNode;
  description?: ReactNode;
  date?: ReactNode;
  dateTime?: ReactNode;
  badge?: ReactNode;
  variant?: "card" | "card-thick" | "background";
  cardClassName?: string;
  actions?: ReactNode;
  children?: ReactNode;
  drawerContentClassName?: string;
}

export function CardDrawer({
  title,
  content,
  editHref,
  icon,
  description,
  date,
  dateTime,
  badge,
  variant = "card",
  cardClassName,
  actions,
  children,
  drawerContentClassName,
}: CardDrawerProps) {
  const { t } = useLocale();

  return (
    <Drawer
      nativeButton={false}
      trigger={
        <CardView
          variant={variant}
          icon={icon}
          title={title}
          description={description}
          date={date ?? dateTime}
          badge={badge}
          className={cardClassName}
        />
      }
    >
      <Drawer.Title className="title">{title}</Drawer.Title>

      <div className={cn("space-y-sm", drawerContentClassName)}>
        {content}
        {children}
      </div>

      <div className="flex items-center gap-xs pt-xs">
        {actions}

        <Drawer.Close
          render={
            <Button
              type="button"
              variant="card"
              className="flex-1 justify-center"
            >
              {t("common.close")}
            </Button>
          }
        />

        {editHref && (
          <Drawer.Close
            nativeButton={false}
            render={
              <Button
                type="button"
                variant="primary"
                nativeButton={false}
                className="flex-1 justify-center"
                render={
                  <Link
                    className="flex flex-1 items-center justify-center gap-xs"
                    href={editHref}
                  >
                    <span>{t("common.edit")}</span>
                  </Link>
                }
              />
            }
          />
        )}
      </div>
    </Drawer>
  );
}

export default CardDrawer;
