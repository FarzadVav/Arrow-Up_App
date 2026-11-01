"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { CircleHelp, Lightbulb, CheckCircle2, Sparkles } from "lucide-react";

import TopBarBtn from "@/features/general/components/static/TopBar/TopBarBtn";
import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import { Button, ButtonProps } from "@/features/general/components/ui/Button/Button";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";
import { cn } from "cn";

type HelpDialogProps = ButtonProps & {
  topic?: string;
  position?: "left" | "right";
};

function resolveTopic(pathname: string | null): string {
  if (!pathname || pathname === "/" || pathname === "/todos") {
    return "todos";
  }
  if (pathname.startsWith("/todos/new")) {
    return "todosNew";
  }
  if (pathname.startsWith("/journals/new")) {
    return "journalsNew";
  }
  if (pathname.startsWith("/journals")) {
    return "journals";
  }
  if (pathname.startsWith("/profile")) {
    return "profile";
  }
  if (pathname.startsWith("/search")) {
    return "search";
  }
  return "default";
}

export default function HelpDialog({
  onClick,
  children,
  topic,
  position,
  className,
  ...p
}: HelpDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLocale();
  const pathname = usePathname();

  const activeTopic = topic || resolveTopic(pathname);

  const title = t(`help.${activeTopic}.title`);
  const subtitle = t(`help.${activeTopic}.subtitle`);

  const tip1Title = t(`help.${activeTopic}.tip1Title`);
  const tip1Desc = t(`help.${activeTopic}.tip1Desc`);

  const tip2Title = t(`help.${activeTopic}.tip2Title`);
  const tip2Desc = t(`help.${activeTopic}.tip2Desc`);

  const tip3Title = t(`help.${activeTopic}.tip3Title`);
  const tip3Desc = t(`help.${activeTopic}.tip3Desc`);

  return (
    <>
      <TopBarBtn
        position={position}
        title={t("help.label")}
        aria-label={t("help.label")}
        onClick={(ev) => {
          setIsOpen(true);
          onClick?.(ev);
        }}
        className={className}
        {...p}
      >
        {children || <CircleHelp />}
      </TopBarBtn>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex flex-col gap-5 max-w-sm w-full p-1">
          {/* Header */}
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-container bg-foreground/10 flex items-center justify-center shrink-0">
              <CircleHelp className="size-6 text-foreground" />
            </div>
            <div className="flex flex-col">
              <Dialog.Title className="title text-foreground">
                {title}
              </Dialog.Title>
              <Dialog.Description className="sub-text">
                {subtitle}
              </Dialog.Description>
            </div>
          </div>

          {/* Help Tips */}
          <div className="space-y-sm py-1 text-sm">
            <div className="flex items-start gap-sm rounded-container border border-foreground/10 bg-background/50 p-sm">
              <Lightbulb className="size-4.5 text-foreground shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-foreground text-xs">
                  {tip1Title}
                </span>
                <span className="sub-text text-xs leading-relaxed">
                  {tip1Desc}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-sm rounded-container border border-foreground/10 bg-background/50 p-sm">
              <CheckCircle2 className="size-4.5 text-foreground shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-foreground text-xs">
                  {tip2Title}
                </span>
                <span className="sub-text text-xs leading-relaxed">
                  {tip2Desc}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-sm rounded-container border border-foreground/10 bg-background/50 p-sm">
              <Sparkles className="size-4.5 text-foreground shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-foreground text-xs">
                  {tip3Title}
                </span>
                <span className="sub-text text-xs leading-relaxed">
                  {tip3Desc}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="flex items-center justify-end">
            <Dialog.Close
              render={
                <Button
                  type="button"
                  variant="primary"
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                >
                  {t("help.gotIt")}
                </Button>
              }
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}
