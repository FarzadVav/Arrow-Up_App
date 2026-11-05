import { cn } from "cn";
import type { Metadata, Viewport } from "next";
import { Geist, Vazirmatn } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";
import { getLocale } from "@/features/general/lib/i18n/server";
import { APP_PROFILE } from "@/features/general/lib/constants";
import { getDictionary } from "@/features/general/lib/i18n/dictionary";
import PwaScript from "@/features/general/components/statics/PwaScript/PwaScript";
import PwaManager from "@/features/general/components/modules/PwaManager/PwaManager";
import SplashScreen from "@/features/general/components/statics/SplashScreen/SplashScreen";
import ThemeProvider from "@/features/general/components/modules/ThemeProvider/ThemeProvider";
import LocaleProvider from "@/features/general/components/modules/LocaleProvider/LocaleProvider";

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  width: "device-width",
  themeColor: APP_PROFILE.themeColor,
};

export const metadata: Metadata = {
  title: {
    default: APP_PROFILE.name,
    template: `%s | ${APP_PROFILE.name}`,
  },
  manifest: "/manifest.webmanifest",
  description: APP_PROFILE.description,
  appleWebApp: {
    capable: true,
    title: APP_PROFILE.name,
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      APP_PROFILE.icons.favicon,
      APP_PROFILE.icons[192],
      APP_PROFILE.icons[512],
    ],
    apple: [APP_PROFILE.icons.apple],
  },
};

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazirmatn",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      dir={locale === "fa" ? "rtl" : "ltr"}
      className={cn("antialiased", geist.variable, vazirmatn.variable)}>
      <head>
        <link
          rel="shortcut icon"
          href={APP_PROFILE.icons.favicon.url}
          type={APP_PROFILE.icons.favicon.type}
        />

        <PwaScript />
      </head>
      <body className="max-w-app-width mx-auto">
        <ThemeProvider>
          <LocaleProvider locale={locale} dictionary={dictionary}>
            <PwaManager />
            <SplashScreen>{children}</SplashScreen>
          </LocaleProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
