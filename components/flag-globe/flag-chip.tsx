"use client";

import { useEffect, useRef } from "react";
import type { Slug } from "./types";
import { flagPainters } from "./flags";

/**
 * A mini flag rendered by the same procedural painter used on the globe, so the
 * rail (FR-8) and the sphere stay visually consistent. Drawn to a canvas at
 * device-pixel resolution.
 */
export function FlagChip({ slug, size = 28 }: { slug: Slug; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(size * 1.5);
    const h = size;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    flagPainters[slug](ctx, w, h);
  }, [slug, size]);

  return (
    <canvas
      ref={ref}
      style={{ width: size * 1.5, height: size, borderRadius: 3, display: "block" }}
      aria-hidden="true"
    />
  );
}
