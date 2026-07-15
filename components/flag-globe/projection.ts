import type { LonLat } from "./types";

/**
 * The single projection convention for the whole component. Everything —
 * texture painting AND the focus animation — goes through here, so the flag on
 * the sphere and the quaternion that brings a country front-and-centre stay in
 * lockstep (PRD §9, the #1 risk area).
 *
 * Equirectangular, 2:1 canvas (H = W/2):
 *   x = (lon + 180) / 360 * W        lon -180 → x=0,  +180 → x=W
 *   y = (90 - lat) / 180  * H        lat  +90 → y=0,  -90  → y=H
 *
 * This matches THREE.SphereGeometry's default UVs sampled by a CanvasTexture
 * with flipY=true:
 *   - canvas top (y=0, lat=+90) → texture V=1 → sphere north pole
 *   - canvas x=0 (lon=-180)     → texture U=0 → geometry phi=0
 * from which the local-space direction for a lon/lat is derived analytically
 * (see lonLatToUnitVector). Verified against Ghana in the demo (focus centres).
 */

export function lonLatToCanvas(
  lon: number,
  lat: number,
  w: number,
  h: number
): [number, number] {
  return [((lon + 180) / 360) * w, ((90 - lat) / 180) * h];
}

/**
 * Local-space unit direction of a lon/lat on the textured sphere.
 * Derived from SphereGeometry UVs + flipY:  phi = lonRad + π, theta = π/2 − latRad
 *   x =  cos(lat)·cos(lon)
 *   y =  sin(lat)
 *   z = −cos(lat)·sin(lon)
 * (lon=0 faces +X, north faces +Y, antimeridian faces −X.)
 */
export function lonLatToUnitVector(lon: number, lat: number): [number, number, number] {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180;
  const cl = Math.cos(la);
  return [cl * Math.cos(lo), Math.sin(la), -cl * Math.sin(lo)];
}

/** Add a [lon,lat] ring to a Path2D in canvas space (optionally x-shifted). */
export function addRingToPath(
  path: Path2D,
  ring: LonLat[],
  w: number,
  h: number,
  offsetX = 0
): void {
  for (let i = 0; i < ring.length; i++) {
    const [x, y] = lonLatToCanvas(ring[i][0], ring[i][1], w, h);
    if (i === 0) path.moveTo(x + offsetX, y);
    else path.lineTo(x + offsetX, y);
  }
  path.closePath();
}

/** Build a Path2D for a single ring. */
export function ringToPath2D(ring: LonLat[], w: number, h: number): Path2D {
  const path = new Path2D();
  addRingToPath(path, ring, w, h);
  return path;
}

export interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Canvas-space bounding box of a ring (used to fit the flag into the shape). */
export function ringBBox(ring: LonLat[], w: number, h: number): BBox {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [lon, lat] of ring) {
    const [x, y] = lonLatToCanvas(lon, lat, w, h);
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}
