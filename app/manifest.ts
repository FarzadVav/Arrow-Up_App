import type { MetadataRoute } from "next";
import { APP_PROFILE } from "@/features/general/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    scope: "/",
    name: APP_PROFILE.name,
    start_url: "/profile",
    short_name: APP_PROFILE.name.replace(/\s+/g, ""),
    display: "standalone",
    theme_color: APP_PROFILE.themeColor,
    background_color: APP_PROFILE.themeColor,
    orientation: "portrait-primary",
    description: APP_PROFILE.description,
    icons: [
      {
        src: APP_PROFILE.icons[192].url,
        sizes: APP_PROFILE.icons[192].sizes,
        type: APP_PROFILE.icons[192].type,
        purpose: "any",
      },
      {
        src: APP_PROFILE.icons[512].url,
        sizes: APP_PROFILE.icons[512].sizes,
        type: APP_PROFILE.icons[512].type,
        purpose: "any",
      },
      {
        src: "/icon-maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "New Todo",
        url: "/todos/new",
        short_name: "Todo",
        description: "Create a new todo or mission",
        icons: [
          {
            src: APP_PROFILE.icons[192].url,
            sizes: APP_PROFILE.icons[192].sizes,
          },
        ],
      },
      {
        name: "New Journal",
        url: "/journals/new",
        short_name: "Journal",
        description: "Write a new journal entry",
        icons: [
          {
            src: APP_PROFILE.icons[192].url,
            sizes: APP_PROFILE.icons[192].sizes,
          },
        ],
      },
    ],
  };
}
