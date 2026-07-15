"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { PMREMGenerator } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * Procedural PMREM studio environment for the metallic reflections (PRD §9).
 * Generated from three's RoomEnvironment — no HDR fetch, so the component keeps
 * its zero-runtime-network guarantee (§3).
 */
export function StudioEnvironment() {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const envMap = pmrem.fromScene(room, 0.04).texture;
    const prev = scene.environment;
    scene.environment = envMap;
    return () => {
      scene.environment = prev;
      envMap.dispose();
      pmrem.dispose();
      room.dispose?.();
    };
  }, [gl, scene]);

  return null;
}
