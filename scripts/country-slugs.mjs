/**
 * The v1 curated country set (PRD §8). This is the single source of truth for
 * which countries the globe knows about.
 *
 * Matching against Natural Earth is done by NUMERIC ISO id (`isoNum`) — robust
 * against name-spelling drift (Natural Earth calls Türkiye "Turkey", the UK
 * "United Kingdom", the US "United States of America").
 *
 * ADD A COUNTRY:
 *   1. Add a row here ({ slug, isoNum, iso, name }).
 *   2. Run `npm run build:geo`.
 *   3. Add components/flag-globe/flags/<slug>.ts and register it in flags/index.ts.
 * The `Slug` union and the rail update automatically from the generated `order`.
 *
 * Optional per-country overrides:
 *   rdpTolerance  — override the global RDP simplification tolerance (degrees).
 *   minAreaDeg2   — override the sub-threshold island drop area (deg²).
 */
export const COUNTRIES = [
  // Smaller / hero nations get a finer tolerance so the silhouette reads well
  // at globe scale (110m source is already coarse for these).
  { slug: "ghana", isoNum: 288, iso: "GH", name: "Ghana", rdpTolerance: 0.1 },
  { slug: "nigeria", isoNum: 566, iso: "NG", name: "Nigeria", rdpTolerance: 0.2 },
  { slug: "senegal", isoNum: 686, iso: "SN", name: "Senegal", rdpTolerance: 0.15 },
  { slug: "kenya", isoNum: 404, iso: "KE", name: "Kenya", rdpTolerance: 0.2 },
  { slug: "southAfrica", isoNum: 710, iso: "ZA", name: "South Africa", rdpTolerance: 0.3 },
  { slug: "egypt", isoNum: 818, iso: "EG", name: "Egypt", rdpTolerance: 0.3 },
  { slug: "france", isoNum: 250, iso: "FR", name: "France" },
  { slug: "germany", isoNum: 276, iso: "DE", name: "Germany" },
  { slug: "italy", isoNum: 380, iso: "IT", name: "Italy" },
  { slug: "spain", isoNum: 724, iso: "ES", name: "Spain" },
  { slug: "unitedKingdom", isoNum: 826, iso: "GB", name: "United Kingdom" },
  { slug: "turkiye", isoNum: 792, iso: "TR", name: "Türkiye" },
  { slug: "india", isoNum: 356, iso: "IN", name: "India" },
  { slug: "china", isoNum: 156, iso: "CN", name: "China" },
  { slug: "japan", isoNum: 392, iso: "JP", name: "Japan" },
  { slug: "unitedStates", isoNum: 840, iso: "US", name: "United States" },
  { slug: "mexico", isoNum: 484, iso: "MX", name: "Mexico" },
  { slug: "brazil", isoNum: 76, iso: "BR", name: "Brazil" },
  { slug: "argentina", isoNum: 32, iso: "AR", name: "Argentina" },
];

// Global defaults (overridable per-country above).
export const RDP_TOLERANCE = 0.3; // degrees
export const MIN_AREA_DEG2 = 2; // drop rings smaller than this (deg²)
