import { NextResponse } from "next/server";
import { COOKIE_NAME, getAdminSecret } from "@/lib/auth";

const WEEK = 60 * 60 * 24 * 7;

/** POST { password } → sets the admin cookie on success, 401 otherwise. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { password?: unknown };
  if (typeof body.password !== "string" || body.password !== getAdminSecret()) {
    return NextResponse.json({ ok: false, error: "Invalid password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, getAdminSecret(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: WEEK,
    // secure:false so the cookie also works over plain http on a self-hosted port.
    secure: false,
  });
  return res;
}
