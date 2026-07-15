"use client";

import { useMemo, useRef } from "react";
import { Group } from "three";
import type { GlobeTheme, JoinEvent, Quality, Slug } from "./types";
import { countries } from "./data/countries";
import { lonLatToUnitVector } from "./projection";
import { useGlobeTextures } from "./use-globe-textures";
import { useOrientation } from "./use-orientation";
import { EventsLayer } from "./events-layer";

const SEGMENTS: Record<Quality, number> = { high: 128, medium: 96, low: 64 };

interface GlobeMeshProps {
  country: Slug;
  quality: Quality;
  theme: GlobeTheme;
  autoRotate: boolean;
  reducedMotion: boolean;
  selectionKey: string;
  hub?: Slug;
  events?: JoinEvent[];
}

export function GlobeMesh({
  country,
  quality,
  theme,
  autoRotate,
  reducedMotion,
  selectionKey,
  hub,
  events,
}: GlobeMeshProps) {
  const groupRef = useRef<Group>(null);

  // Mask the hub, the focused country, and every currently-active joiner, so all
  // the countries taking part show their flags at once. Sorted so the texture
  // only rebuilds when the SET of countries changes, not on every reorder.
  const maskCountries = useMemo<Slug[]>(() => {
    const set = new Set<Slug>();
    if (hub) set.add(hub);
    set.add(country);
    if (events) for (const e of events) set.add(e.country);
    return [...set].sort();
  }, [hub, country, events]);
  const textures = useGlobeTextures(maskCountries, quality, theme);

  const focusDir = useMemo<[number, number, number]>(() => {
    const [lon, lat] = countries[country].centroid;
    return lonLatToUnitVector(lon, lat);
  }, [country]);

  useOrientation(groupRef, { autoRotate, reducedMotion, focusDir, selectionKey });

  const segments = SEGMENTS[quality];

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[1, segments, segments]} />
        <meshStandardMaterial
          map={textures.color}
          roughnessMap={textures.roughness}
          metalnessMap={textures.metalness}
          emissiveMap={textures.emissive}
          emissive="#ffffff"
          emissiveIntensity={0.4}
          metalness={1}
          roughness={1}
          envMapIntensity={0.8}
        />
      </mesh>
      {hub && (
        <EventsLayer hub={hub} events={events ?? []} accent={theme.accent} />
      )}
    </group>
  );
}
