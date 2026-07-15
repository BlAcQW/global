"use client";

import type { LonLat } from "./types";

function fmtCoord(lat: number, lon: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lonDir = lon >= 0 ? "E" : "W";
  const pad = (n: number) => Math.abs(n).toFixed(1).padStart(4, "0");
  return `${pad(lat)}°${latDir}  ${pad(lon)}°${lonDir}`;
}

/**
 * The instrument-signature readout (PRD §11, FR-9): selected country name +
 * centroid lat/long in mono. It's live text, so it doubles as the screen-reader
 * alternative for the visual coordinate (§10).
 */
export function Hud({ name, centroid }: { name: string; centroid: LonLat }) {
  const [lon, lat] = centroid;
  return (
    <div
      className="pointer-events-none absolute left-4 top-4 select-none"
      aria-live="polite"
    >
      <div className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[var(--globe-muted)]">
        Atlas · Selection
      </div>
      <div className="mt-1 font-display text-lg font-medium text-[var(--globe-ink)]">
        {name}
      </div>
      <div className="mt-0.5 font-mono text-[0.8rem] tracking-wide text-[var(--globe-accent)]">
        {fmtCoord(lat, lon)}
      </div>
    </div>
  );
}
