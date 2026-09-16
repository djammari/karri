import { NextRequest, NextResponse } from "next/server";
import { readSessionValue, SESSION_COOKIE } from "@/lib/auth";

const PUBLIC_PREFIXES = [
  "/innskraning",
  "/api/webhooks",
  "/api/auth/login",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const session = readSessionValue(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/innskraning";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (session && pathname === "/innskraning") {
    const url = request.nextUrl.clone();
    url.pathname = "/yfirlit";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
