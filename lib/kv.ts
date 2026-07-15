/**
 * Tiny KV client over the Upstash / Vercel KV REST API — used so config can
 * persist on serverless (Vercel), where the filesystem is read-only.
 *
 * Enabled automatically when the platform injects the REST env vars (Vercel KV:
 * KV_REST_API_URL/TOKEN, or Upstash: UPSTASH_REDIS_REST_URL/TOKEN). No SDK
 * dependency — just fetch against the REST endpoint.
 */
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const kvEnabled = Boolean(URL_ && TOKEN);

async function command(args: string[]): Promise<unknown> {
  const res = await fetch(URL_ as string, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`KV request failed: ${res.status}`);
  const data = (await res.json()) as { result?: unknown };
  return data.result ?? null;
}

export async function kvGet(key: string): Promise<string | null> {
  const result = await command(["GET", key]);
  return typeof result === "string" ? result : null;
}

export async function kvSet(key: string, value: string): Promise<void> {
  await command(["SET", key, value]);
}
