"use client";

import dynamic from "next/dynamic";
import { useWebGLSupport } from "./use-webgl-support";
import { WebGLFallback } from "./webgl-fallback";
import type { GlobeSceneProps } from "./globe-scene";

/**
 * Lazy-loads the WebGL scene with ssr:false so the canvas never renders on the
 * server (§3 client-only mount) and never blocks first paint. The static
 * fallback covers the loading window and the no-WebGL case (FR-14).
 */
const GlobeScene = dynamic(() => import("./globe-scene"), {
  ssr: false,
  loading: () => <WebGLFallback />,
});

export function SceneLoader({
  countryName,
  ...sceneProps
}: GlobeSceneProps & { countryName: string }) {
  const supported = useWebGLSupport();
  // null = still probing, false = unsupported → fallback in both cases.
  if (supported !== true) return <WebGLFallback countryName={countryName} />;
  return <GlobeScene {...sceneProps} />;
}
