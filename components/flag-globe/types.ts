import type { Slug } from "./data/slugs";

/**
 * `Slug` is derived from the generated data (scripts/country-slugs.mjs →
 * data/slugs.ts) — add a country, rebuild, and the union widens automatically.
 */
export type { Slug };

/** A [lon, lat] pair. */
export type LonLat = [number, number];

export interface CountryData {
  name: string;
  iso: string;
  isoNum: number;
  centroid: LonLat;
  ring: LonLat[];
}

/** Procedural flag painter — fills the rect (0,0)–(w,h). No image assets. */
export type FlagPainter = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
) => void;

export interface GlobeTheme {
  /** Stage gradient behind the globe. */
  background: string;
  /** Base sphere / oceans. */
  ocean: string;
  /** Continents. */
  land: string;
  /** Selection reticle + active UI (default copper #c0703a). */
  accent: string;
  /** Graticule line colour. */
  graticule: string;
  ink: string;
  muted: string;
}

export type Quality = "high" | "medium" | "low";

/**
 * A "someone joined" event for the live-seminar layer. Each one draws a pulse at
 * `country` and (when a `hub` is set) an arc from that country to the hub.
 */
export interface JoinEvent {
  id: string;
  country: Slug;
  /** Optional attendee label shown in the feed (e.g. a name). */
  name?: string;
  /** Client timestamp (ms) when the animation should start. */
  at: number;
}

export interface FlagGlobeProps {
  /** Controlled selection. When set, the component does not self-mutate. */
  country?: Slug;
  /** Uncontrolled initial selection (default: 'ghana'). */
  defaultCountry?: Slug;
  /** Which countries appear in the rail (default: 'all'). */
  countries?: Slug[] | "all";
  /** Fires on any selection change. */
  onSelect?: (iso: Slug) => void;

  autoRotate?: boolean; // default true
  showRail?: boolean; // default true
  showHud?: boolean; // default true
  showAtmosphere?: boolean; // default true

  /** Segments + texture resolution tier (default 'high'). */
  quality?: Quality;
  /** Palette override (merged over the default theme). */
  theme?: Partial<GlobeTheme>;
  className?: string;
  /** Called once the 3D scene has mounted. */
  onReady?: () => void;

  /** Live-seminar hub: every join event arcs from its country to this one. */
  hub?: Slug;
  /** Active join events to animate (pulse + arc). Managed by the caller. */
  events?: JoinEvent[];
}
