import type { CSSProperties } from "react";
import type { GlobeTheme } from "./types";

/**
 * Default GlobeTheme (PRD §11). The one deliberate risk is the copper accent
 * against the cold navy globe; everything else stays quiet.
 */
export const DEFAULT_THEME: GlobeTheme = {
  background: "#eef1f5",
  ocean: "#0b2038",
  land: "#16375c",
  accent: "#c0703a",
  graticule: "#4d6a86",
  ink: "#0d1622",
  muted: "#5b6b7d",
};

/** Merge a partial override over the default palette (FR-12). */
export function resolveTheme(override?: Partial<GlobeTheme>): GlobeTheme {
  return override ? { ...DEFAULT_THEME, ...override } : DEFAULT_THEME;
}

/**
 * Theme → CSS custom properties for the DOM overlay (rail/HUD), so the overlay
 * recolours in one place alongside the WebGL material.
 */
export function themeToCssVars(theme: GlobeTheme): CSSProperties {
  return {
    "--globe-bg": theme.background,
    "--globe-ocean": theme.ocean,
    "--globe-land": theme.land,
    "--globe-accent": theme.accent,
    "--globe-graticule": theme.graticule,
    "--globe-ink": theme.ink,
    "--globe-muted": theme.muted,
  } as CSSProperties;
}
