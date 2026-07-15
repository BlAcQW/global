"use client";

import { useMemo } from "react";
import { AdditiveBlending, BackSide, Color } from "three";

const vertexShader = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vPositionW;
  void main() {
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vPositionW = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPower;
  uniform float uIntensity;
  varying vec3 vNormalW;
  varying vec3 vPositionW;
  void main() {
    vec3 viewDir = normalize(cameraPosition - vPositionW);
    float fres = pow(1.0 - abs(dot(viewDir, normalize(vNormalW))), uPower);
    gl_FragColor = vec4(uColor, fres * uIntensity);
  }
`;

/**
 * Back-side fresnel halo (PRD §9, FR — atmosphere). Rendered outside the
 * rotating globe group so the glow stays a steady rim rather than spinning.
 */
export function Atmosphere({ color, radius = 1 }: { color: string; radius?: number }) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new Color(color) },
      uPower: { value: 3.2 },
      uIntensity: { value: 0.9 },
    }),
    [color]
  );

  return (
    <mesh scale={radius * 1.18}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        blending={AdditiveBlending}
        side={BackSide}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
