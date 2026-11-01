"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { useLocale } from "../LocaleProvider/LocaleProvider";
import { Button } from "@/features/general/components/ui/Button/Button";

export default function PwaManager() {
  const { t } = useLocale();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const pathname = usePathname();

  // Register service worker and handle lifecycle updates.
  // Retries whenever the route changes so a registration that failed
  // (e.g. on /login before sign-in) is retried after navigation.
  const registrationsFailed = useRef(false);
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    if (!("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      })
      .then((registration) => {
        registrationsFailed.current = false;
        // Detect waiting worker on initial load
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setUpdateAvailable(true);
        }

        // Check for incoming updates (property assignment stays idempotent
        // even though this effect re-runs on navigation)
        registration.onupdatefound = () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.onstatechange = () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setUpdateAvailable(true);
              }
            };
          }
        };
      })
      .catch((err) => {
        registrationsFailed.current = true;
        console.error("ServiceWorker registration failed: ", err);
      });

    let refreshing = false;
    const onControllerChange = () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, [pathname]);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    }
    setUpdateAvailable(false);
  };

  return (
    <AnimatePresence>
      {updateAvailable && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="fixed bottom-20 inset-x-4 max-w-sm mx-auto z-important p-4 rounded-container bg-card border border-foreground/20 shadow-2xl flex items-center justify-between gap-sm"
        >
          <div className="flex items-center gap-sm">
            <Sparkles className="size-5 text-foreground shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-foreground">{t("pwa.updateAvailable")}</p>
              <p className="text-foreground/70">{t("pwa.freshVersion")}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={handleUpdate}
            className="h-auto w-auto rounded-container px-sm py-xs text-xs font-semibold transition-colors"
          >
            {t("pwa.refresh")}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
