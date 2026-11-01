"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { PropsWithChildren, useEffect, useState } from "react";
import { cn } from "cn";

function SplashScreen({ children }: PropsWithChildren) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    document.body.classList.add("overflow-hidden");

    const timer = setTimeout(() => {
      setShowSplash(false);
      document.body.classList.remove("overflow-hidden");
    }, 1800);

    return () => {
      clearTimeout(timer);
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  return (
    <>
      <div
        className={cn(
          "root w-full min-h-dvh transition-opacity duration-300",
          showSplash
            ? "pointer-events-none select-none opacity-0"
            : "opacity-100",
        )}
      >
        {children}
      </div>

      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            transition={{ duration: 0.3, ease: "easeOut" }}
            initial={{ opacity: 1 }}
            exit={{ scale: 1.05, opacity: 0 }}
            className="fixed inset-0 z-big-overlay flex h-dvh w-screen items-center justify-center flex-col gap-sm bg-background"
          >
            <motion.div
              initial={{ scale: 0.8, translateY: "20%", opacity: 0 }}
              animate={{ scale: 1, translateY: 0, opacity: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <Image
                priority
                width={180}
                height={180}
                unoptimized
                alt="Arrow Up"
                src="/logo.png"
                className="rounded-full shadow-2xl"
              />
            </motion.div>
            <motion.p
              transition={{ delay: 0.15, duration: 0.45, ease: "easeOut" }}
              className="text-3xl font-bold tracking-tight z-front"
              initial={{ scale: 0.85, translateY: "20%", opacity: 0 }}
              animate={{ scale: 1, translateY: 0, opacity: 1 }}
            >
              Arrow Up
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default SplashScreen;
