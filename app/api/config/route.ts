import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readConfig, writeConfig, ConfigPersistenceError } from "@/lib/globe-config";
import { COOKIE_NAME, isAuthed } from "@/lib/auth";

// Uses node:fs, so pin to the Node runtime.
export const runtime = "nodejs";

/** GET → the current globe config (display data; public-safe). */
export async function GET() {
  return NextResponse.json(await readConfig());
}

/** POST → validate + persist the config. Protected by the admin cookie. */
export async function POST(req: Request) {
  const jar = await cookies();
  if (!isAuthed(jar.get(COOKIE_NAME)?.value)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  try {
    const config = await writeConfig(body);
    return NextResponse.json({ ok: true, config });
  } catch (err) {
    if (err instanceof ConfigPersistenceError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 503 });
    }
    return NextResponse.json({ ok: false, error: "Failed to save" }, { status: 500 });
  }
}
