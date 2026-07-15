import raw from "./countries.json";
import { SLUGS, type Slug } from "./slugs";
import type { CountryData, LonLat } from "../types";

/**
 * Typed loader over the generated countries.json (PRD §8). Zero network — the
 * data is bundled at build time.
 */
interface GeoData {
  meta: Record<string, unknown>;
  order: string[];
  countries: Record<string, CountryData>;
  land: LonLat[][];
}

const data = raw as unknown as GeoData;

/** Selection order for the rail. */
export const order = SLUGS;

/** Per-country rings + centroids, keyed by slug. */
export const countries = data.countries as Record<Slug, CountryData>;

/** Continent outer rings for the base Earth. */
export const landRings: LonLat[][] = data.land;

export { SLUGS, type Slug };
