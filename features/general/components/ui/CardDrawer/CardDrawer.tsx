"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { PencilIcon } from "lucide-react";
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
  isHistory?: boolean;
  swipeActions?: ReactNode;
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
  isHistory,
  swipeActions,
}: CardDrawerProps) {
  const { t } = useLocale();

  const renderedSwipeActions =
    actions || editHref || swipeActions ? (
      <div className="flex items-center gap-xs">
        {editHref && (
          <Button
            nativeButton={false}
            variant="card"
            size="square"
            isHistory={isHistory}
            className="size-10 justify-center"
            aria-label={t("common.edit")}
            title={t("common.edit")}
            render={
              <Link
                href={editHref}
                className="flex items-center justify-center">
                <PencilIcon className="size-4" />
              </Link>
            }
          />
        )}
        {actions}
        {swipeActions}
      </div>
    ) : undefined;

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
          isHistory={isHistory}
          className={cardClassName}
          swipeActions={renderedSwipeActions}
        />
      }>
      <Drawer.Title className="title">{title}</Drawer.Title>

      <div className={cn("space-y-sm", drawerContentClassName)}>
        {content}
        {children}
      </div>
    </Drawer>
  );
}

export default CardDrawer;
