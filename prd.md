# PRD — Atlas Flag Globe

**Product:** Reusable 3D flag-globe component
**Owner:** IKEGUY / Ikieguy Software Ltd
**Status:** Draft v1 — prototype validated
**Target stack:** Next.js 15 · React Three Fiber · TypeScript · Tailwind
**File chain:** `PRD.md` → `BRIEF.md` → `CLAUDE.md` → `FEATURES.md` → `TASK.md`

---

## 1. Summary

A drop-in React component that renders a realistic 3D globe where one selected country is masked out of the sphere and filled with its national flag, while the rest of the globe stays a neutral dark-metallic Earth. Ships with soft studio lighting, environment-map reflections, an atmosphere halo, drag interaction, and a country selector. Intended for hero sections, product landing pages, and data/geo surfaces across the studio's builds.

The working prototype (single-file HTML + Three r128) is proven. This PRD defines the productised, reusable version.

---

## 2. Problem & context

Marketing and product surfaces need a premium, distinctive geographic hero that isn't a stock map or a flat SVG. Off-the-shelf globes either look like data-viz dashboards or generic Earth textures with no way to spotlight a single nation. We need a component that:

- Highlights one country per view, unmistakably, using its flag as the fill.
- Reads as "premium instrument," not "toy" or "dashboard."
- Reuses across projects (IKEGUY site, client sites, product onboarding) via clean props.

## 3. Goals / Non-goals

**Goals**
- One reusable `<FlagGlobe>` component, controlled or uncontrolled.
- Flag masked to the country's actual silhouette on a metallic Earth.
- 60 fps desktop, graceful degradation on mid-tier mobile.
- Zero runtime network dependency for geo/flag data (bundled).
- Accessible and responsive to phone width.

**Non-goals (v1)**
- Full 195-country coverage (curated set only — see §8).
- Pixel-accurate emblem-heavy flags (stylised is acceptable — see §12).
- Choropleth / multi-country data overlays.
- Server-side rendering of the WebGL canvas (client-only mount).

## 4. Users & use cases

| User | Use case |
|---|---|
| Studio devs | Import into a Next.js page as a hero or section anchor. |
| Client sites | Spotlight a market/HQ country with brand-matched palette. |
| Product onboarding | "Available in your country" moment keyed to user geo. |
| End visitor | Drag the globe, tap a country, see it flip into view with its flag. |

## 5. Scope — what ships

A published internal component (workspace package or copied module) exposing:

- The rendered globe (canvas) with selected-country flag mask.
- Optional country **rail** (tappable flag chips).
- Optional **HUD** readout (country name + centroid lat/long).
- Bundled geo data (borders + landmasses) and flag painters.
- Theme tokens for palette override.

## 6. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | Render a 3D sphere styled as a dark-metallic Earth with visible continents and a faint graticule. | P0 |
| FR-2 | Fill the selected country's real silhouette with its national flag, clipped to shape. | P0 |
| FR-3 | Render a warm accent border/reticle around the selected country. | P0 |
| FR-4 | Selected country is subtly emissive so it reads against the dark globe. | P1 |
| FR-5 | Drag to rotate (pointer + touch), with inertia. | P0 |
| FR-6 | Idle auto-rotate; pauses on interaction and on selection-hold. | P1 |
| FR-7 | Selecting a country animates the globe to bring it front-and-centre, then holds briefly. | P0 |
| FR-8 | Country rail with mini flag chips; active state reflects selection. | P1 |
| FR-9 | HUD shows selected country name + centroid latitude/longitude. | P2 |
| FR-10 | Controlled (`country` prop) and uncontrolled (`defaultCountry`) modes. | P0 |
| FR-11 | `onSelect(iso)` fires on any selection change. | P0 |
| FR-12 | Palette overridable via `theme` prop. | P1 |
| FR-13 | Respect `prefers-reduced-motion` (no float, no auto-rotate). | P0 |
| FR-14 | Graceful fallback message if WebGL is unavailable. | P1 |

## 7. Component API

```tsx
type ISO = 'ghana' | 'nigeria' | /* ...curated set... */ string;

interface FlagGlobeProps {
  country?: ISO;                 // controlled selection
  defaultCountry?: ISO;          // uncontrolled initial (default: 'ghana')
  countries?: ISO[] | 'all';     // which appear in the rail (default: 'all')
  onSelect?: (iso: ISO) => void;

  autoRotate?: boolean;          // default true
  showRail?: boolean;            // default true
  showHud?: boolean;             // default true
  showAtmosphere?: boolean;      // default true

  quality?: 'high' | 'medium' | 'low';  // segments + texture res (default 'high')
  theme?: Partial<GlobeTheme>;
  className?: string;
  onReady?: () => void;
}

interface GlobeTheme {
  background: string;   // stage gradient
  ocean: string;        // base sphere
  land: string;         // continents
  accent: string;       // selection reticle + active UI (default copper #c0703a)
  ink: string; muted: string;
}
```

Behaviour: if `country` is provided, component is controlled and rail selection calls `onSelect` without self-mutating. Selection always triggers the focus-to-front animation.

## 8. Data requirements

Bundled, no network fetch.

- **Borders:** per-country outer rings as `[lon, lat]` arrays, keyed by ISO, plus a `centroid`. Source: `world-atlas` (Natural Earth), simplified via Ramer–Douglas–Peucker. Rings crossing the antimeridian and sub-threshold islands are dropped for clean silhouettes.
- **Landmasses:** continent rings (land-110m simplified) for the base Earth.
- **Flags:** procedural canvas painters per country (geometric fills, no image assets).

**v1 country set (19):** Ghana (default), Nigeria, Senegal, Kenya, South Africa, Egypt, France, Germany, Italy, Spain, United Kingdom, Türkiye, India, China, Japan, United States, Mexico, Brazil, Argentina.

Data budget: ~25 KB borders+land JSON, gzipped smaller. Adding a country = add its rings + centroid + a flag painter.

## 9. Technical architecture

**Rendering:** single WebGL context, one `SphereGeometry` + `MeshStandardMaterial`, plus a back-side fresnel halo mesh. Lighting = ambient + key/fill/rim directionals + a procedural PMREM studio environment for reflections. ACES tone mapping, sRGB output.

**Texture pipeline (equirectangular, `lon→x`, `lat→y`):** four canvases drive the material —
- **color:** ocean gradient + steel continents + graticule; selected country flag clipped to its `Path2D`; accent reticle stroke.
- **roughnessMap:** glossy oceans / matte land; flag region semi-gloss.
- **metalnessMap:** metallic oceans / dielectric land.
- **emissiveMap:** dim flag copy inside the country only.

Textures regenerate only on selection change (not per frame).

**Interaction:** quaternion-based orientation. Drag applies world-axis delta quaternions with inertia. Selection computes a target quaternion via `setFromUnitVectors(centroidDir, +Z)` and slerps to it. Auto-rotate premultiplies a small yaw when idle.

**R3F port:** wrap the above in a `<Canvas>`; move texture builders into a `useMemo`/effect keyed on `country` + `quality`; keep the imperative quaternion loop in a `useFrame`. Rail/HUD are plain React/Tailwind DOM overlaid on the canvas.

## 10. Non-functional requirements

- **Performance:** 60 fps desktop; ≥30 fps mid-tier mobile. `quality` scales sphere segments (128/96/64) and texture res (2048/1536/1024). `pixelRatio` capped at 2.
- **Bundle:** component + data + Three usage under a reasonable hero budget; Three imported once (peer dep or shared).
- **Accessibility:** rail is keyboard-operable (tab + arrows), `aria-current` on active, visible focus rings, WCAG-AA text contrast; canvas carries an `aria-label` and the HUD provides a text alternative; reduced-motion honoured.
- **Responsive:** works down to ~360 px; camera pulls back and UI compacts on narrow widths.
- **Browser support:** evergreen Chrome/Safari/Firefox/Edge; WebGL2 with WebGL1 fallback; fallback panel if unsupported.

## 11. Visual & design spec

- **Single accent:** copper `#c0703a` (reticle + active pill) against the cold navy globe — the one deliberate risk; keep everything else quiet.
- **Globe:** ocean `#0b2038`-range gradient, continents `#16375c`, cyan-slate graticule at low alpha.
- **Stage:** clean cool-paper radial gradient, contact shadow, gentle float.
- **Type:** Space Grotesk display (wordmark), IBM Plex Mono for the HUD coordinate readout (the instrument signature), system fallbacks.
- **Signature element:** the mono lat/long HUD — the globe reads as a navigation instrument, not a toy.

## 12. Known limitations → accepted for v1

- Flag fill stretches to the country bounding box, so discs/emblems distort on small or elongated nations (Japan disc, etc.). Inherent to masking a rectangular flag into an irregular silhouette. **Accepted.**
- Emblem-heavy flags (South Africa Y, Kenya shield, India chakra, Argentina sun) are stylised approximations tuned to read at globe scale. **Accepted.**
- Curated 19-country set, not full world. **Accepted; expandable.**

## 13. Out of scope (v1)

Full country coverage · data/choropleth overlays · country search/typeahead · SSR of canvas · image-based (raster) flags · label pins / tooltips per country.

## 14. Open decisions

1. **Delivery:** shared workspace package vs. copied module per repo?
2. **Country set per deployment:** expose all 19 or subset via `countries` prop per site?
3. **Default country:** per-deployment (Ghana for studio; client HQ for client sites)?
4. **Geo-aware default:** auto-select visitor's country when available? (needs IP/geo source)
5. **Three delivery:** peer dependency vs. bundled, to avoid duplicate Three instances.
6. **Flag accuracy tier:** keep procedural, or add optional raster flag mode for accuracy where needed?

## 15. Milestones

- **M0 — Prototype (done):** single-file globe, 19 countries, interaction, HUD.
- **M1 — R3F component:** props API (§7), controlled/uncontrolled, theme, quality tiers.
- **M2 — Hardening:** a11y pass, reduced-motion, WebGL fallback, mobile perf tuning.
- **M3 — Packaging:** data/flag registry documented, "add a country" recipe, integration into one live surface (IKEGUY site hero).

---

**Next file:** `BRIEF.md` (implementation brief for Claude Code) once §14 decisions 1, 2, 3, 5 are locked.