import {
  PenLineIcon,
  UserIcon,
  FrameIcon,
  CircleCheckBig,
} from "lucide-react";

import { NavigationLink } from "./types";

export const APP_PROFILE = {
  name: "Arrow Up",
  themeColor: "#101010",
  description:
    "Personal operating system for moving up and managing the land of the mind",
  icons: {
    favicon: {
      sizes: "32x32",
      type: "image/png",
      url: "/icon-fav.png",
    },
    apple: {
      sizes: "180x180",
      type: "image/png",
      url: "/icon-apple-touch.png",
    },
    192: {
      sizes: "192x192",
      type: "image/png",
      url: "/icon-192x192.png",
    },
    512: {
      sizes: "512x512",
      type: "image/png",
      url: "/icon-512x512.png",
    },
  },
};

export const NAVIGATION_LINKS: NavigationLink[] = [
  {
    href: "/profile",
    matchPathname: "/profile",
    Icon: UserIcon,
  },
  {
    href: "/todos",
    matchPathname: "/todos",
    Icon: CircleCheckBig,
  },
  {
    href: "/framework",
    matchPathname: "/framework",
    Icon: FrameIcon,
  },
  {
    href: "/journals",
    matchPathname: "/journals",
    Icon: PenLineIcon,
  },
];
