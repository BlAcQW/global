import { NextResponse } from "next/server";
import { order } from "@/components/flag-globe/data/countries";
import type { Slug } from "@/components/flag-globe/types";

export const runtime = "nodejs";

interface JoinRecord {
  id: string;
  country: Slug;
  name?: string;
  at: number;
}

// Bounded in-memory ring of recent joins. Kept on globalThis so it survives
// dev hot-reloads and is shared across requests on this single node server.
const MAX = 200;
const store: JoinRecord[] =
  (globalThis as { __joinStore?: JoinRecord[] }).__joinStore ??
  ((globalThis as { __joinStore?: JoinRecord[] }).__joinStore = []);

const SLUGS = new Set<string>(order as readonly string[]);
const isSlug = (v: unknown): v is Slug => typeof v === "string" && SLUGS.has(v);

/** Keep only letters/numbers/space and light name punctuation, capped length. */
function cleanName(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.replace(/[^\p{L}\p{N} .'-]/gu, "").trim().slice(0, 40);
  return s.length ? s : undefined;
}

/** GET /api/join?since=<ms> → recent join events after `since`. */
export function GET(req: Request) {
  const since = Number(new URL(req.url).searchParams.get("since") ?? 0) || 0;
  const events = store.filter((e) => e.at > since).slice(-50);
  return NextResponse.json({ events, now: Date.now() });
}

/** POST /api/join { country, name? } → records a join (public — no secrets). */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    country?: unknown;
    name?: unknown;
  };
  if (!isSlug(body.country)) {
    return NextResponse.json({ ok: false, error: "Unknown country" }, { status: 400 });
  }
  const event: JoinRecord = {
    id: crypto.randomUUID(),
    country: body.country,
    name: cleanName(body.name),
    at: Date.now(),
  };
  store.push(event);
  if (store.length > MAX) store.splice(0, store.length - MAX);
  return NextResponse.json({ ok: true, event });
}
