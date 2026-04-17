import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { guestRegex, isDevelopmentEnvironment } from "./lib/constants";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/ping")) {
    return new Response("pong", { status: 200 });
  }

  if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/webhooks") || pathname.startsWith("/api/cron")) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: !isDevelopmentEnvironment,
  });

  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  // Public pages - no auth needed
  if (pathname === "/" || ["/login", "/register"].includes(pathname)) {
    return NextResponse.next();
  }

  // /demo and all app routes require auth - auto guest if not logged in
  if (!token) {
    if (pathname.startsWith("/demo")) {
      return NextResponse.redirect(
        new URL(`${base}/api/auth/guest?redirectUrl=${encodeURIComponent(pathname)}`, request.url)
      );
    }
    // Other protected routes redirect to register
    return NextResponse.redirect(new URL(`${base}/register`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/demo/:path*",
    "/chat/:id",
    "/api/:path*",
    "/login",
    "/register",
    "/settings",
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
