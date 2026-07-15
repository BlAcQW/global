"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  Vector3,
} from "three";
import { countries } from "./data/countries";
import type { JoinEvent, Slug } from "./types";
import { centroidVec, greatCircleArc } from "./arc";

const Z = new Vector3(0, 0, 1);
const SURF = 1.006; // sit markers just above the sphere surface
const ARC_DRAW = 1.1; // s to draw the arc head to the hub
const ARC_LIFE = 3.2; // s total arc lifetime
const PULSE_LIFE = 1.6; // s pulse ripple lifetime
const HUB_COLOR = "#ffd59e";

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Great-circle arc from a joiner's country to the hub, drawn head-first. */
function JoinArc({ country, hub, color }: { country: Slug; hub: Slug; color: string }) {
  const startRef = useRef<number | null>(null);
  const travelerRef = useRef<Mesh>(null);

  const { line, points } = useMemo(() => {
    const src = centroidVec(countries[country].centroid);
    const dst = centroidVec(countries[hub].centroid);
    const pts = greatCircleArc(src, dst, SURF, 54, 0.6);
    const arr = new Float32Array(pts.length * 3);
    pts.forEach((p, i) => {
      arr[i * 3] = p.x;
      arr[i * 3 + 1] = p.y;
      arr[i * 3 + 2] = p.z;
    });
    const geom = new BufferGeometry();
    geom.setAttribute("position", new BufferAttribute(arr, 3));
    geom.setDrawRange(0, 0);
    const mat = new LineBasicMaterial({
      color: new Color(color),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    return { line: new Line(geom, mat), points: pts };
  }, [country, hub, color]);

  useEffect(
    () => () => {
      line.geometry.dispose();
      (line.material as LineBasicMaterial).dispose();
    },
    [line]
  );

  useFrame((state) => {
    if (startRef.current === null) startRef.current = state.clock.elapsedTime;
    const life = state.clock.elapsedTime - startRef.current;
    const drawn = easeOut(clamp01(life / ARC_DRAW));
    const count = Math.max(2, Math.floor(drawn * points.length));
    line.geometry.setDrawRange(0, count);
    const mat = line.material as LineBasicMaterial;
    mat.opacity = 0.8 * Math.min(clamp01(life / 0.3), clamp01((ARC_LIFE - life) / 0.9));

    const tr = travelerRef.current;
    if (tr) {
      const p = points[Math.min(points.length - 1, count - 1)];
      tr.position.copy(p);
      tr.scale.setScalar(0.85 + 0.25 * Math.sin(life * 22));
      const vis = drawn < 1 ? 1 : clamp01((ARC_LIFE - life) / 0.5);
      (tr.material as MeshBasicMaterial).opacity = vis;
      tr.visible = vis > 0.02;
    }
  });

  return (
    <>
      <primitive object={line} />
      <mesh ref={travelerRef}>
        <sphereGeometry args={[0.014, 12, 12]} />
        <meshBasicMaterial
          color={color}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
    </>
  );
}

/** Expanding ripple + bright core at a joining country. */
function Pulse({ country, color }: { country: Slug; color: string }) {
  const startRef = useRef<number | null>(null);
  const ringRef = useRef<Mesh>(null);
  const coreRef = useRef<Mesh>(null);

  const { pos, quat } = useMemo(() => {
    const dir = centroidVec(countries[country].centroid);
    return {
      pos: dir.clone().multiplyScalar(SURF),
      quat: new Quaternion().setFromUnitVectors(Z, dir.clone().normalize()),
    };
  }, [country]);

  useFrame((state) => {
    if (startRef.current === null) startRef.current = state.clock.elapsedTime;
    const t = clamp01((state.clock.elapsedTime - startRef.current) / PULSE_LIFE);
    const ring = ringRef.current;
    if (ring) {
      ring.scale.setScalar(0.02 + easeOut(t) * 0.13);
      (ring.material as MeshBasicMaterial).opacity = (1 - t) * 0.85;
      ring.visible = t < 1;
    }
    const core = coreRef.current;
    if (core) {
      (core.material as MeshBasicMaterial).opacity = (1 - t) * 0.9;
      core.visible = t < 1;
    }
  });

  return (
    <group>
      <mesh ref={coreRef} position={pos}>
        <sphereGeometry args={[0.016, 12, 12]} />
        <meshBasicMaterial color={color} transparent depthWrite={false} blending={AdditiveBlending} />
      </mesh>
      <mesh ref={ringRef} position={pos} quaternion={quat}>
        <ringGeometry args={[0.68, 1, 40]} />
        <meshBasicMaterial
          color={color}
          transparent
          side={DoubleSide}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/** Persistent glowing pin at the seminar hub with a slow looping ripple. */
function HubMarker({ hub, color }: { hub: Slug; color: string }) {
  const ringRef = useRef<Mesh>(null);
  const { pos, quat } = useMemo(() => {
    const dir = centroidVec(countries[hub].centroid);
    return {
      pos: dir.clone().multiplyScalar(SURF),
      quat: new Quaternion().setFromUnitVectors(Z, dir.clone().normalize()),
    };
  }, [hub]);

  useFrame((state) => {
    const t = (state.clock.elapsedTime % 2.2) / 2.2;
    const ring = ringRef.current;
    if (ring) {
      ring.scale.setScalar(0.03 + easeOut(t) * 0.16);
      (ring.material as MeshBasicMaterial).opacity = (1 - t) * 0.55;
    }
  });

  return (
    <group>
      <mesh position={pos}>
        <sphereGeometry args={[0.022, 16, 16]} />
        <meshBasicMaterial color={color} transparent depthWrite={false} blending={AdditiveBlending} />
      </mesh>
      <mesh ref={ringRef} position={pos} quaternion={quat}>
        <ringGeometry args={[0.72, 1, 48]} />
        <meshBasicMaterial
          color={color}
          transparent
          side={DoubleSide}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/**
 * The live-seminar layer: a hub pin plus a pulse + arc for each active join
 * event. Sits inside the rotating globe group so everything stays glued to
 * geography as the globe turns.
 */
export function EventsLayer({
  hub,
  events,
  accent,
}: {
  hub: Slug;
  events: JoinEvent[];
  accent: string;
}) {
  return (
    <group>
      <HubMarker hub={hub} color={HUB_COLOR} />
      {events.map((e) => (
        <group key={e.id}>
          <Pulse country={e.country} color={accent} />
          <JoinArc country={e.country} hub={hub} color={accent} />
        </group>
      ))}
    </group>
  );
}
