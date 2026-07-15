import { Vector3 } from "three";
import { lonLatToUnitVector } from "./projection";
import type { LonLat } from "./types";

/** Unit direction (as a Vector3) for a country centroid. */
export function centroidVec(centroid: LonLat): Vector3 {
  const [x, y, z] = lonLatToUnitVector(centroid[0], centroid[1]);
  return new Vector3(x, y, z);
}

/** Spherical interpolation of two unit vectors (great-circle path). */
function slerpUnit(a: Vector3, b: Vector3, t: number, out: Vector3): Vector3 {
  const dot = Math.min(1, Math.max(-1, a.dot(b)));
  const omega = Math.acos(dot);
  if (omega < 1e-4) return out.copy(a);
  const s = Math.sin(omega);
  const wa = Math.sin((1 - t) * omega) / s;
  const wb = Math.sin(t * omega) / s;
  return out.set(
    a.x * wa + b.x * wb,
    a.y * wa + b.y * wb,
    a.z * wa + b.z * wb
  );
}

/**
 * Points of a great-circle arc from `a` to `b` (both unit dirs), lifted above
 * the sphere so it bows outward — apex height scales with the arc's angular
 * length so long-haul arcs rise higher. Returned at `radius` scale.
 */
export function greatCircleArc(
  a: Vector3,
  b: Vector3,
  radius = 1,
  segments = 50,
  liftFactor = 0.6
): Vector3[] {
  const angle = Math.acos(Math.min(1, Math.max(-1, a.dot(b))));
  const lift = liftFactor * (angle / Math.PI); // 0..liftFactor
  const pts: Vector3[] = [];
  const tmp = new Vector3();
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    slerpUnit(a, b, t, tmp).normalize();
    const h = radius * (1 + lift * Math.sin(Math.PI * t));
    pts.push(tmp.clone().multiplyScalar(h));
  }
  return pts;
}
