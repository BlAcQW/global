import type { FlagPainter, Slug } from "../types";
import * as africa from "./africa";
import * as europe from "./europe";
import * as asia from "./asia";
import * as americas from "./americas";

/**
 * Procedural flag painter registry, keyed by slug (PRD §8). Each painter fills
 * the rect (0,0)–(w,h); the texture pipeline clips it to the country silhouette.
 *
 * ADD A COUNTRY: write a painter in the matching region file (or a new one),
 * then register it here. The `Record<Slug, …>` type makes a missing painter a
 * compile error, so the set stays complete.
 */
export const flagPainters: Record<Slug, FlagPainter> = {
  ghana: africa.ghana,
  nigeria: africa.nigeria,
  senegal: africa.senegal,
  kenya: africa.kenya,
  southAfrica: africa.southAfrica,
  egypt: africa.egypt,
  france: europe.france,
  germany: europe.germany,
  italy: europe.italy,
  spain: europe.spain,
  unitedKingdom: europe.unitedKingdom,
  turkiye: asia.turkiye,
  india: asia.india,
  china: asia.china,
  japan: asia.japan,
  unitedStates: americas.unitedStates,
  mexico: americas.mexico,
  brazil: americas.brazil,
  argentina: americas.argentina,
};
