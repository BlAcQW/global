"use client";

/**
 * Soft studio lighting (PRD §9): ambient base + key / fill / rim directionals.
 * The PMREM environment carries most of the metallic reflection; these shape
 * the form and add a warm rim.
 */
export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.35} />
      {/* key */}
      <directionalLight position={[3, 2.5, 4]} intensity={2.1} color="#ffffff" />
      {/* fill */}
      <directionalLight position={[-4, -1, 2]} intensity={0.5} color="#9fc4ff" />
      {/* warm rim */}
      <directionalLight position={[-2, 1.5, -4]} intensity={1.1} color="#ffd9b0" />
    </>
  );
}
