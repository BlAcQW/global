"use client";

import { useEffect, useMemo } from "react";
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";
import type { GlobeTheme, Quality, Slug } from "./types";
import { countries, landRings } from "./data/countries";
import { flagPainters } from "./flags";
import { addRingToPath, ringBBox, ringToPath2D } from "./projection";

/** Texture resolution per quality tier (PRD §10). */
const RES: Record<Quality, number> = { high: 2048, medium: 1536, low: 1024 };

export interface GlobeTextures {
  color: CanvasTexture;
  roughness: CanvasTexture;
  metalness: CanvasTexture;
  emissive: CanvasTexture;
}

// ---- small colour utils ----------------------------------------------------
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(hex: string, target: [number, number, number], t: number): string {
  const [r, g, b] = hexToRgb(hex);
  const m = (a: number, c: number) => Math.round(a + (c - a) * t);
  return `rgb(${m(r, target[0])},${m(g, target[1])},${m(b, target[2])})`;
}
const BLACK: [number, number, number] = [0, 0, 0];
const WHITE: [number, number, number] = [255, 255, 255];

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  return [c, ctx];
}

function toTexture(canvas: HTMLCanvasElement, srgb: boolean): CanvasTexture {
  const tex = new CanvasTexture(canvas);
  tex.wrapS = RepeatWrapping; // wrap across the antimeridian seam
  if (srgb) tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/** Fill every land ring (drawn ±W to cover the seam) with `style`. */
function fillLand(ctx: CanvasRenderingContext2D, w: number, h: number, style: string) {
  ctx.fillStyle = style;
  for (const ring of landRings) {
    for (const dx of [-w, 0, w]) {
      const path = new Path2D();
      addRingToPath(path, ring, w, h, dx);
      ctx.fill(path);
    }
  }
}

function drawGraticule(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.14;
  ctx.lineWidth = Math.max(1, w / 2048);
  for (let lon = -180; lon <= 180; lon += 15) {
    const x = ((lon + 180) / 360) * w;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let lat = -75; lat <= 75; lat += 15) {
    const y = ((90 - lat) / 180) * h;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

interface Mask {
  path: Path2D;
  bb: { x: number; y: number; w: number; h: number };
  painter: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
}

// ---- the pipeline ----------------------------------------------------------
// Masks EVERY country in `slugs` with its flag (the hub plus any featured
// joiner), so multiple flags can appear on the globe at once.
function buildTextures(slugs: Slug[], quality: Quality, theme: GlobeTheme): GlobeTextures {
  const w = RES[quality];
  const h = w / 2;
  const masks: Mask[] = slugs.map((s) => ({
    path: ringToPath2D(countries[s].ring, w, h),
    bb: ringBBox(countries[s].ring, w, h),
    painter: flagPainters[s],
  }));

  // --- COLOR ---
  const [colorCanvas, cc] = makeCanvas(w, h);
  const grad = cc.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, mix(theme.ocean, BLACK, 0.35));
  grad.addColorStop(0.5, theme.ocean);
  grad.addColorStop(1, mix(theme.ocean, BLACK, 0.35));
  cc.fillStyle = grad;
  cc.fillRect(0, 0, w, h);
  fillLand(cc, w, h, theme.land);
  drawGraticule(cc, w, h, theme.graticule);
  for (const m of masks) {
    // flag clipped to the country silhouette
    cc.save();
    cc.clip(m.path);
    cc.translate(m.bb.x, m.bb.y);
    m.painter(cc, m.bb.w, m.bb.h);
    cc.restore();
    // accent reticle
    cc.save();
    cc.strokeStyle = theme.accent;
    cc.lineWidth = Math.max(2, w / 640);
    cc.shadowColor = theme.accent;
    cc.shadowBlur = w / 160;
    cc.stroke(m.path);
    cc.restore();
  }

  // --- ROUGHNESS --- (white = rough/matte, black = smooth/glossy)
  const [roughCanvas, rc] = makeCanvas(w, h);
  rc.fillStyle = "#2a2a2a"; // glossy oceans
  rc.fillRect(0, 0, w, h);
  fillLand(rc, w, h, "#d0d0d0"); // matte land
  for (const m of masks) {
    rc.save();
    rc.clip(m.path);
    rc.fillStyle = "#8a8a8a"; // semi-gloss flag region
    rc.fillRect(m.bb.x, m.bb.y, m.bb.w, m.bb.h);
    rc.restore();
  }

  // --- METALNESS --- (white = metallic, black = dielectric)
  const [metalCanvas, mc] = makeCanvas(w, h);
  mc.fillStyle = "#e0e0e0"; // metallic oceans
  mc.fillRect(0, 0, w, h);
  fillLand(mc, w, h, "#1a1a1a"); // dielectric land
  for (const m of masks) {
    mc.save();
    mc.clip(m.path);
    mc.fillStyle = "#303030";
    mc.fillRect(m.bb.x, m.bb.y, m.bb.w, m.bb.h);
    mc.restore();
  }

  // --- EMISSIVE --- (dim flag copy inside each country only; FR-4)
  const [emitCanvas, ec] = makeCanvas(w, h);
  ec.fillStyle = "#000000";
  ec.fillRect(0, 0, w, h);
  for (const m of masks) {
    ec.save();
    ec.clip(m.path);
    ec.translate(m.bb.x, m.bb.y);
    m.painter(ec, m.bb.w, m.bb.h);
    ec.restore();
    ec.save();
    ec.clip(m.path);
    ec.fillStyle = "rgba(0,0,0,0.62)"; // dim it
    ec.fillRect(m.bb.x, m.bb.y, m.bb.w, m.bb.h);
    ec.restore();
    ec.save();
    ec.strokeStyle = mix(theme.accent, WHITE, 0.1);
    ec.lineWidth = Math.max(2, w / 640);
    ec.stroke(m.path);
    ec.restore();
  }

  return {
    color: toTexture(colorCanvas, true),
    roughness: toTexture(roughCanvas, false),
    metalness: toTexture(metalCanvas, false),
    emissive: toTexture(emitCanvas, true),
  };
}

/**
 * Builds the four equirectangular material maps, memoised on the mask set +
 * quality + theme. Never runs per frame; disposes GPU textures when inputs
 * change or on unmount (PRD §9 — keeps texture cost off the render loop).
 */
export function useGlobeTextures(
  slugs: Slug[],
  quality: Quality,
  theme: GlobeTheme
): GlobeTextures {
  const slugKey = slugs.join(",");
  const themeKey = `${theme.ocean}|${theme.land}|${theme.accent}|${theme.graticule}`;
  const textures = useMemo(
    () => buildTextures(slugs, quality, theme),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slugKey, quality, themeKey]
  );

  useEffect(
    () => () => {
      textures.color.dispose();
      textures.roughness.dispose();
      textures.metalness.dispose();
      textures.emissive.dispose();
    },
    [textures]
  );

  return textures;
}
