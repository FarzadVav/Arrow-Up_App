"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Download,
  Share,
  PlusSquare,
  Sparkles,
  Wifi,
  Zap,
  CheckCircle2,
  MoreVertical,
  Layers,
} from "lucide-react";

import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import TopBar from "@/features/general/components/static/TopBar/TopBar";
import { usePwaInstall } from "@/features/general/hooks/usePwaInstall";
import {
  Button,
  ButtonProps,
} from "@/features/general/components/ui/Button/Button";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";

export default function InstallAppDialog({
  children,
  onClick,
  ...p
}: ButtonProps) {
  const {
    isStandalone,
    isInstallable,
    isIOS,
    isAndroid,
    isMobile,
    installApp,
  } = usePwaInstall();
  const { t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  // Must NOT show in installed standalone PWA
  if (isStandalone) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const accepted = await installApp();
      if (accepted) {
        setInstalledSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
        }, 1200);
      }
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <>
      <Button
        title={t("install.label")}
        aria-label={t("install.aria")}
        onClick={(ev) => {
          setIsOpen(true);
          onClick?.(ev);
        }}
        {...p}>
        {children || <Download />}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex flex-col gap-4 max-w-sm w-full p-1 sm:p-2">
          {/* Header */}
          <div className="flex items-center gap-3.5">
            <Image
              width={52}
              height={52}
              unoptimized
              alt={t("install.title")}
              src="/icon-192x192.png"
              className="size-13 rounded-component object-cover shadow-md shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <Dialog.Title className="title">
                {t("install.label")}
              </Dialog.Title>
              <Dialog.Description className="sub-text line-clamp-2">
                {t("install.subtitle")}
              </Dialog.Description>
            </div>
          </div>

          {/* Value Highlights */}
          <div className="space-y-sm py-2 text-xs sm:text-sm">
            <div className="flex items-start gap-sm">
              <Zap className="shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">
                  {t("install.standaloneTitle")}
                </span>
                <span className=" ml-1">{t("install.standaloneDesc")}</span>
              </div>
            </div>

            <div className="flex items-start gap-sm">
              <Wifi className="shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">{t("install.offlineTitle")}</span>
                <span className=" ml-1">{t("install.offlineDesc")}</span>
              </div>
            </div>

            <div className="flex items-start gap-sm">
              <Sparkles className="shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">{t("install.quickTitle")}</span>
                <span className=" ml-1">{t("install.quickDesc")}</span>
              </div>
            </div>
          </div>

          {/* Device & Browser Specific Instructions / Status */}
          {installedSuccess ? (
            <div className="flex items-center justify-center gap-2 py-sm rounded-component bg-card-thick font-semibold text-xs sm:text-sm">
              <CheckCircle2 className="shrink-0" />
              <span>{t("install.installedSuccess")}</span>
            </div>
          ) : isInstallable ? (
            <div className="rounded-component bg-card-thick/50 p-sm flex items-start gap-sm text-xs">
              <Layers className="shrink-0 mt-0.5" />
              <p>
                {isMobile
                  ? t("install.mobileInstallReady")
                  : t("install.desktopInstallReady")}
              </p>
            </div>
          ) : isIOS ? (
            <div className="rounded-component bg-background/60 p-sm space-y-2 text-xs">
              <p className="font-semibold text-xs">{t("install.iosTitle")}</p>
              <div className="flex items-center gap-sm">
                <span className="size-6 rounded-component bg-foreground/10 flex items-center justify-center shrink-0">
                  <Share />
                </span>
                <span>{t("install.iosStep1")}</span>
              </div>
              <div className="flex items-center gap-sm">
                <span className="size-6 rounded-component bg-foreground/10 flex items-center justify-center shrink-0">
                  <PlusSquare />
                </span>
                <span>{t("install.iosStep2")}</span>
              </div>
            </div>
          ) : isAndroid || isMobile ? (
            <div className="rounded-component bg-background/60 p-sm space-y-2 text-xs">
              <p className="font-semibold text-xs">
                {t("install.androidTitle")}
              </p>
              <div className="flex items-center gap-sm">
                <span className="size-6 rounded-component bg-foreground/10 flex items-center justify-center shrink-0">
                  <MoreVertical />
                </span>
                <span>{t("install.androidStep1")}</span>
              </div>
              <div className="flex items-center gap-sm">
                <span className="size-6 rounded-component bg-foreground/10 flex items-center justify-center shrink-0">
                  <PlusSquare />
                </span>
                <span>{t("install.androidStep2")}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-component bg-background/60 p-sm text-xs">
              <p className="font-semibold mb-1">{t("install.desktopTitle")}</p>
              <p className="leading-relaxed">{t("install.desktopDesc")}</p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-sm pt-1">
            <Dialog.Close
              render={
                <Button
                  type="button"
                  variant="card"
                  className={
                    isInstallable && !installedSuccess ? "flex-1" : "w-full"
                  }
                  onClick={() => setIsOpen(false)}>
                  {installedSuccess
                    ? t("common.close")
                    : isInstallable
                      ? t("install.later")
                      : t("help.gotIt")}
                </Button>
              }
            />

            {isInstallable && !installedSuccess && (
              <Button
                type="button"
                variant="primary"
                className="flex-1 flex items-center justify-center gap-2 font-medium"
                onClick={handleInstall}
                disabled={isInstalling}>
                <span>
                  {isInstalling
                    ? t("install.installing")
                    : t("install.installNow")}
                </span>
                <Download className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
}
