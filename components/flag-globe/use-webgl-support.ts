"use client";

import { useEffect, useState } from "react";

/**
 * Probes WebGL support after mount (FR-14). Unlike a hero decoration, the globe
 * IS the content, so we only fall back when WebGL is genuinely unavailable — we
 * do NOT disable it on mobile (the PRD wants graceful degradation there, §10).
 *
 * Returns null while probing, then true/false.
 */
export function useWebGLSupport(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      setSupported(Boolean(gl));
    } catch {
      setSupported(false);
    }
  }, []);

  return supported;
}
