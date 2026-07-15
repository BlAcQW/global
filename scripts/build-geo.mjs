/**
 * build-geo.mjs — generates the bundled geo data for FlagGlobe (PRD §8).
 *
 * Pipeline:
 *   1. Read Natural Earth 110m country + land topojson (world-atlas).
 *   2. Convert to GeoJSON (topojson-client).
 *   3. For each of the curated 19 countries (matched by numeric ISO id):
 *        - pick the largest polygon by spherical area (metropolitan France,
 *          contiguous US) so islands/exclaves don't muddy the silhouette;
 *        - take that polygon's outer ring;
 *        - Ramer–Douglas–Peucker simplify (simplify-js, highQuality = RDP);
 *        - centroid via d3.geoCentroid of the chosen polygon.
 *   4. Extract simplified land rings for the base Earth (Antarctica + tiny
 *      islands dropped; antimeridian-crossing rings dropped for clean fills).
 *   5. Emit components/flag-globe/data/countries.json (~25 KB target).
 *
 * Run: npm run build:geo
 */
import { createRequire } from "node:module";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { feature } from "topojson-client";
import { geoArea, geoCentroid } from "d3-geo";
import simplify from "simplify-js";
import {
  COUNTRIES,
  RDP_TOLERANCE,
  MIN_AREA_DEG2,
} from "./country-slugs.mjs";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

const countriesTopo = require("world-atlas/countries-110m.json");
const landTopo = require("world-atlas/land-110m.json");

const OUT = resolve(__dirname, "../components/flag-globe/data/countries.json");
const SLUGS_OUT = resolve(__dirname, "../components/flag-globe/data/slugs.ts");

// deg² threshold under which a land polygon is dropped (keeps size down while
// still showing recognisable islands: Japan, UK, Iceland, Indonesia, NZ, ...).
const LAND_MIN_AREA_DEG2 = 4;
// steradian → deg² factor (1 sr = (180/π)² deg²).
const SR_TO_DEG2 = (180 / Math.PI) ** 2;

const round = (n) => Math.round(n * 100) / 100; // 2dp ≈ 1.1km, plenty at 110m

/** True if consecutive vertices jump >180° in longitude (antimeridian cross). */
function crossesAntimeridian(ring) {
  for (let i = 1; i < ring.length; i++) {
    if (Math.abs(ring[i][0] - ring[i - 1][0]) > 180) return true;
  }
  return false;
}

/**
 * Unwrap longitudes so a ring crossing the antimeridian stays continuous
 * (e.g. Afro-Eurasia via Russia's Chukotka). Coordinates may exceed ±180; the
 * texture draws land at x and x±W, so the wrapped part still renders.
 */
function unwrapRing(ring) {
  const out = [ring[0].slice()];
  for (let i = 1; i < ring.length; i++) {
    let lon = ring[i][0];
    const prev = out[i - 1][0];
    while (lon - prev > 180) lon -= 360;
    while (lon - prev < -180) lon += 360;
    out.push([lon, ring[i][1]]);
  }
  return out;
}

/** RDP-simplify a [lon,lat] ring; returns rounded [lon,lat][] (closed). */
function simplifyRing(ring, tolerance) {
  const pts = ring.map(([x, y]) => ({ x, y }));
  const simplified = simplify(pts, tolerance, true).map(({ x, y }) => [
    round(x),
    round(y),
  ]);
  // ensure closed
  const first = simplified[0];
  const last = simplified[simplified.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) simplified.push(first);
  return simplified;
}

/** Pick the largest polygon (by spherical area) from a GeoJSON geometry. */
function largestPolygon(geometry) {
  if (geometry.type === "Polygon") return geometry.coordinates;
  // MultiPolygon: score each polygon by area, return the biggest.
  let best = null;
  let bestArea = -1;
  for (const poly of geometry.coordinates) {
    const area = geoArea({ type: "Polygon", coordinates: poly });
    if (area > bestArea) {
      bestArea = area;
      best = poly;
    }
  }
  return best; // [outerRing, ...holes]
}

// ---- countries -------------------------------------------------------------
const countryFC = feature(countriesTopo, countriesTopo.objects.countries);
const byId = new Map(countryFC.features.map((f) => [Number(f.id), f]));

const order = [];
const countries = {};
let warnings = 0;

for (const c of COUNTRIES) {
  const f = byId.get(c.isoNum);
  if (!f) {
    console.warn(`⚠  no Natural Earth feature for ${c.slug} (id ${c.isoNum})`);
    warnings++;
    continue;
  }
  const poly = largestPolygon(f.geometry);
  const outer = poly[0];
  const chosenGeom = { type: "Polygon", coordinates: poly };
  const tol = c.rdpTolerance ?? RDP_TOLERANCE;
  const ring = simplifyRing(outer, tol);

  if (crossesAntimeridian(ring)) {
    console.warn(`⚠  ${c.slug} main ring crosses the antimeridian`);
    warnings++;
  }

  const [clon, clat] = geoCentroid(chosenGeom);
  order.push(c.slug);
  countries[c.slug] = {
    name: c.name,
    iso: c.iso,
    isoNum: c.isoNum,
    centroid: [round(clon), round(clat)],
    ring,
  };
}

// ---- land (base Earth) -----------------------------------------------------
const landFC = feature(landTopo, landTopo.objects.land);
const land = [];

for (const f of landFC.features) {
  const polys =
    f.geometry.type === "Polygon"
      ? [f.geometry.coordinates]
      : f.geometry.coordinates;
  for (const poly of polys) {
    const outer = poly[0];
    const geom = { type: "Polygon", coordinates: poly };
    const areaDeg2 = geoArea(geom) * SR_TO_DEG2;
    if (areaDeg2 < LAND_MIN_AREA_DEG2) continue; // drop tiny islands
    const centroidLat = geoCentroid(geom)[1];
    if (centroidLat < -58) continue; // drop Antarctica (smears at the pole)
    // Keep seam-crossing landmasses (Afro-Eurasia!) by unwrapping longitudes.
    const ring = crossesAntimeridian(outer) ? unwrapRing(outer) : outer;
    land.push(simplifyRing(ring, RDP_TOLERANCE));
  }
}

// ---- emit ------------------------------------------------------------------
const out = {
  meta: {
    source: "Natural Earth 110m via world-atlas",
    rdpTolerance: RDP_TOLERANCE,
    minAreaDeg2: MIN_AREA_DEG2,
    landMinAreaDeg2: LAND_MIN_AREA_DEG2,
  },
  order,
  countries,
  land,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out));

// Emit the Slug literal union so component types stay derived from the data.
const slugsTs =
  `// AUTO-GENERATED by scripts/build-geo.mjs — do not edit.\n` +
  `export const SLUGS = [\n` +
  order.map((s) => `  "${s}",`).join("\n") +
  `\n] as const;\n\n` +
  `export type Slug = (typeof SLUGS)[number];\n`;
writeFileSync(SLUGS_OUT, slugsTs);

const bytes = Buffer.byteLength(JSON.stringify(out));
const countryPts = Object.values(countries).reduce(
  (n, c) => n + c.ring.length,
  0
);
const landPts = land.reduce((n, r) => n + r.length, 0);
console.log(
  `✔ wrote ${OUT}\n  countries: ${order.length} (${countryPts} pts)` +
    `\n  land rings: ${land.length} (${landPts} pts)` +
    `\n  size: ${(bytes / 1024).toFixed(1)} KB${warnings ? `  · ${warnings} warning(s)` : ""}`
);
