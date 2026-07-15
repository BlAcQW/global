import { promises as fs } from "node:fs";
import path from "node:path";
import { order } from "@/components/flag-globe/data/countries";
import type { Quality, Slug } from "@/components/flag-globe/types";

/**
 * Server-side persisted configuration for the live-seminar globe. Edited in
 * /admin, saved to data/globe-config.json, read by the landing page each
 * request. Server-only (uses node:fs) — never import from a client component.
 */
export interface GlobeConfig {
  /** Host country: every join arcs toward it and its flag anchors the globe. */
  hub: Slug;
  /** Countries that can appear as attendees in the demo loop. */
  pool: Slug[] | "all";
  /** Label shown in the feed header. */
  seminarTitle: string;
  /** Starting attendee count (the counter builds up from here). */
  baseAttendees: number;
  /** Run the synthetic join loop so the globe looks alive without traffic. */
  demoJoins: boolean;
  /** Show the "who's joining" feed + counter overlay. */
  showFeed: boolean;
  autoRotate: boolean;
  showAtmosphere: boolean;
  quality: Quality;
  /** Accent colour as #rrggbb (arcs, pulses, active UI). */
  accent: string;
}

export const DEFAULT_CONFIG: GlobeConfig = {
  hub: "ghana",
  pool: "all",
  seminarTitle: "Live Seminar",
  baseAttendees: 0,
  demoJoins: true,
  showFeed: true,
  autoRotate: true,
  showAtmosphere: true,
  quality: "high",
  accent: "#c0703a",
};

const CONFIG_PATH = path.join(process.cwd(), "data", "globe-config.json");
const QUALITIES: ReadonlyArray<Quality> = ["high", "medium", "low"];
const SLUG_SET = new Set<string>(order as readonly string[]);
const HEX = /^#[0-9a-fA-F]{6}$/;

const isSlug = (v: unknown): v is Slug => typeof v === "string" && SLUG_SET.has(v);

/**
 * Coerce arbitrary input into a valid GlobeConfig, clamping every field to a
 * known-safe value (§ input validation — never trust the request body).
 */
export function sanitizeConfig(input: unknown): GlobeConfig {
  const o = (input ?? {}) as Record<string, unknown>;
  const d = DEFAULT_CONFIG;

  const hub = isSlug(o.hub) ? o.hub : d.hub;

  let pool: Slug[] | "all";
  if (o.pool === "all" || o.pool === undefined) {
    pool = "all";
  } else if (Array.isArray(o.pool)) {
    const filtered = o.pool.filter(isSlug);
    pool = filtered.length ? filtered : "all";
  } else {
    pool = d.pool;
  }

  const quality = QUALITIES.includes(o.quality as Quality)
    ? (o.quality as Quality)
    : d.quality;

  const accent = typeof o.accent === "string" && HEX.test(o.accent) ? o.accent : d.accent;

  const seminarTitle =
    typeof o.seminarTitle === "string"
      ? o.seminarTitle.replace(/[<>]/g, "").slice(0, 60) || d.seminarTitle
      : d.seminarTitle;

  const baseAttendees =
    typeof o.baseAttendees === "number" && Number.isFinite(o.baseAttendees)
      ? Math.min(10_000_000, Math.max(0, Math.floor(o.baseAttendees)))
      : d.baseAttendees;

  const bool = (v: unknown, fallback: boolean) =>
    typeof v === "boolean" ? v : fallback;

  return {
    hub,
    pool,
    seminarTitle,
    baseAttendees,
    demoJoins: bool(o.demoJoins, d.demoJoins),
    showFeed: bool(o.showFeed, d.showFeed),
    autoRotate: bool(o.autoRotate, d.autoRotate),
    showAtmosphere: bool(o.showAtmosphere, d.showAtmosphere),
    quality,
    accent,
  };
}

/** Read the saved config; returns defaults if the file is missing or invalid. */
export async function readConfig(): Promise<GlobeConfig> {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf8");
    return sanitizeConfig(JSON.parse(raw));
  } catch {
    return DEFAULT_CONFIG;
  }
}

/** Validate then persist the config; returns the sanitized value that was written. */
export async function writeConfig(input: unknown): Promise<GlobeConfig> {
  const clean = sanitizeConfig(input);
  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(clean, null, 2), "utf8");
  return clean;
}
