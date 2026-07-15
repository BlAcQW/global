"use client";

import { useEffect, useState } from "react";

/**
 * Tracks `prefers-reduced-motion: reduce` (FR-13). Starts false so SSR/first
 * paint is deterministic; resolves after mount and updates live if the user
 * toggles the OS setting.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
