import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, isAuthed } from "@/lib/auth";

/**
 * Guards /admin (except the login page). Unauthenticated requests are bounced to
 * /admin/login with a `from` hint so we can return them after sign-in.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  if (!isAuthed(cookie)) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
