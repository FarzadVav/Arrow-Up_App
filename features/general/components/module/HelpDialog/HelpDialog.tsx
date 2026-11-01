"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  CircleHelpIcon,
  Lightbulb,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import TopBarBtn from "@/features/general/components/static/TopBar/TopBarBtn";
import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import {
  Button,
  ButtonProps,
} from "@/features/general/components/ui/Button/Button";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";

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
        {...p}>
        {children || <CircleHelpIcon />}
      </TopBarBtn>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <div className="space-y-xs">
          <Dialog.Title className="title">{title}</Dialog.Title>
          <Dialog.Description className="sub-text">
            {subtitle}
          </Dialog.Description>
        </div>

        <div className="space-y-xs">
          <div className="flex items-start gap-sm rounded-component bg-background/50 p-sm">
            <Lightbulb className="shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-xs">{tip1Title}</span>
              <span className="sub-text leading-relaxed">{tip1Desc}</span>
            </div>
          </div>

          <div className="flex items-start gap-sm rounded-component bg-background/50 p-sm">
            <CheckCircle2 className="shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-xs">{tip2Title}</span>
              <span className="sub-text leading-relaxed">{tip2Desc}</span>
            </div>
          </div>

          <div className="flex items-start gap-sm rounded-component bg-background/50 p-sm">
            <Sparkles className="shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-xs">{tip3Title}</span>
              <span className="sub-text leading-relaxed">{tip3Desc}</span>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="actions-footer">
          <Dialog.Close
            render={
              <Button
                type="button"
                variant="primary"
                onClick={() => setIsOpen(false)}>
                {t("help.gotIt")}
              </Button>
            }
          />
        </div>
      </Dialog>
    </>
  );
}
