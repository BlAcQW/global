"use client";

import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ACESFilmicToneMapping } from "three";
import type { GlobeTheme, JoinEvent, Quality, Slug } from "./types";
import { GlobeMesh } from "./globe-mesh";
import { Lighting } from "./lighting";
import { Atmosphere } from "./atmosphere";
import { StudioEnvironment } from "./environment";

export interface GlobeSceneProps {
  country: Slug;
  quality: Quality;
  theme: GlobeTheme;
  autoRotate: boolean;
  reducedMotion: boolean;
  showAtmosphere: boolean;
  selectionKey: string;
  ariaLabel: string;
  onReady?: () => void;
  hub?: Slug;
  events?: JoinEvent[];
}

/** Pulls the camera back on narrow viewports so the globe never crops (§10). */
function ResponsiveCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    const z = size.width < 480 ? 3.5 : size.width < 768 ? 3.0 : 2.6;
    camera.position.set(0, 0, z);
    camera.updateProjectionMatrix();
  }, [camera, size.width]);
  return null;
}

/** Keeps the WebGL canvas's aria-label in sync with the selected country. */
function CanvasA11y({ label }: { label: string }) {
  const { gl } = useThree();
  useEffect(() => {
    gl.domElement.setAttribute("role", "img");
    gl.domElement.setAttribute("aria-label", label);
  }, [gl, label]);
  return null;
}

export default function GlobeScene({
  country,
  quality,
  theme,
  autoRotate,
  reducedMotion,
  showAtmosphere,
  selectionKey,
  ariaLabel,
  onReady,
  hub,
  events,
}: GlobeSceneProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 2.6], fov: 42 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ touchAction: "none" }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        onReady?.();
      }}
    >
      <ResponsiveCamera />
      <CanvasA11y label={ariaLabel} />
      <StudioEnvironment />
      <Lighting />
      <GlobeMesh
        country={country}
        quality={quality}
        theme={theme}
        autoRotate={autoRotate}
        reducedMotion={reducedMotion}
        selectionKey={selectionKey}
        hub={hub}
        events={events}
      />
      {showAtmosphere && <Atmosphere color={theme.graticule} />}
    </Canvas>
  );
}
