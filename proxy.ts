import { NextRequest, NextResponse } from "next/server";

import { decrypt } from "@/features/auth/lib/utils";

const publicRoutes = ["/login", "/offline", "/language"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);

  const session = await decrypt(req.cookies.get("session")?.value);

  if (!isPublicRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isPublicRoute && session?.userId && path === "/login") {
    return NextResponse.redirect(new URL("/profile", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|sw.js|manifest.webmanifest|favicon.ico|.*\\.(?:png|jpe?g|svg|webp|ico|gif|avif|woff2?|ttf|otf|css|txt|xml)$).*)",
  ],
};
