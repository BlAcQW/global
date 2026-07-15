# Atlas Flag Globe

A reusable 3D globe React component (React Three Fiber) that masks one country
out of a dark-metallic Earth and fills it with its national flag — with drag
interaction, focus-to-front selection, a country rail, and a mono lat/long HUD.

Built from `prd.md` (M1). This repo is both the **development/demo app** and the
**copyable module** at `components/flag-globe/`.

## Run

```bash
npm install
npm run build:geo   # generate bundled geo data (committed; re-run when adding a country)
npm run dev         # http://localhost:3000
```

- **`/`** — the public landing page: a full-bleed **live-seminar globe**. The host
  country anchors the sphere; attendees pulse in from around the world and arc to the
  hub, with a "who's joining" feed + attendee counter. Appearance and behaviour are
  driven by the saved admin config.
- **`/admin`** — password-gated dashboard to configure the seminar globe (host/hub,
  seminar title, base attendee count, demo-joins + live-feed toggles, accent theme,
  auto-rotate/atmosphere, quality, and the demo attendee pool). Changes persist to
  `data/globe-config.json` (machine-local, gitignored) and apply to every visitor on
  the next load.

### Feeding real join events

`POST /api/join` records a real attendee; the globe polls and animates it live:

```bash
curl -X POST http://localhost:3000/api/join \
  -H 'Content-Type: application/json' \
  -d '{ "country": "japan", "name": "Kenji" }'
```

`country` must be a known slug (see `scripts/country-slugs.mjs`); `name` is optional.
Joins are kept in a bounded in-memory ring on the node server (not a database), so they
reset on restart. The admin **Demo joins** toggle runs a synthetic loop so the globe
looks alive without real traffic.

### Admin password

The gate reads `ADMIN_PASSWORD`. Set it in `.env.local` before any public deploy:

```bash
# .env.local
ADMIN_PASSWORD=your-strong-password
```

If unset, it falls back to **`admin`** (dev only). The cookie is set over plain HTTP,
so put the site behind TLS (nginx/Caddy) for a real deployment.

## Usage

```tsx
import { FlagGlobe } from "@/components/flag-globe";

// uncontrolled
<FlagGlobe defaultCountry="ghana" />

// controlled
<FlagGlobe country={iso} onSelect={setIso} theme={{ accent: "#2f9e6b" }} />
```

The component fills its parent, so give it a sized container.

### Props (§7)

| Prop | Default | Notes |
|---|---|---|
| `country` | — | controlled selection |
| `defaultCountry` | `'ghana'` | uncontrolled initial |
| `countries` | `'all'` | slugs shown in the rail |
| `onSelect(iso)` | — | fires on any selection change |
| `autoRotate` | `true` | idle auto-rotate (off under reduced-motion) |
| `showRail` / `showHud` / `showAtmosphere` | `true` | overlays / halo |
| `quality` | `'high'` | `high`/`medium`/`low` → segments 128/96/64, texture 2048/1536/1024 |
| `theme` | copper | `Partial<GlobeTheme>` palette override |
| `onReady` | — | called once the scene mounts |

Respects `prefers-reduced-motion` (no float/auto-rotate, focus snaps) and shows a
static fallback when WebGL is unavailable.

## Architecture

- `data/` — bundled geo (Natural Earth 110m, simplified) + generated `slugs.ts`.
- `projection.ts` — the single equirectangular convention (canvas painting AND the
  focus quaternion go through here, keeping the flag and the animation in lockstep).
- `use-globe-textures.ts` — four offscreen canvases (color / roughness / metalness /
  emissive) memoised on selection + quality + theme; never runs per frame.
- `use-orientation.ts` — imperative quaternion controller (drag + inertia, idle
  auto-rotate, `setFromUnitVectors` focus + hold), all state in refs.
- `flag-globe.loader.tsx` — `ssr:false` dynamic import + WebGL probe + fallback.
- `flags/` — procedural canvas painters (no image assets); emblem-heavy flags are
  stylised to read at globe scale (§12).

## Add a country

1. Add a row to `scripts/country-slugs.mjs` (`slug`, numeric `isoNum`, `iso`, `name`).
2. `npm run build:geo` — regenerates `data/countries.json` + `data/slugs.ts`.
3. Add a painter in the matching `components/flag-globe/flags/<region>.ts` and
   register it in `flags/index.ts`.

The `Slug` union, the rail, and the `Record<Slug, FlagPainter>` completeness check
all update from the generated data.
