/**
 * Static fallback shown when WebGL is unavailable (FR-14), and as the loading
 * placeholder while the 3D bundle streams in. Pure CSS/SVG — paints instantly,
 * still communicates "globe" and the selected country name.
 */
export function WebGLFallback({ countryName }: { countryName?: string }) {
  return (
    <div
      className="absolute inset-0 grid place-items-center overflow-hidden"
      role="img"
      aria-label={
        countryName
          ? `Globe showing ${countryName} (3D rendering unavailable)`
          : "Globe (3D rendering unavailable)"
      }
      style={{
        background:
          "radial-gradient(120% 120% at 50% 30%, var(--globe-bg) 0%, var(--globe-bg-2, #dfe4ec) 100%)",
      }}
    >
      <svg viewBox="0 0 200 200" className="h-3/5 w-3/5 max-h-64 max-w-64" aria-hidden="true">
        <defs>
          <radialGradient id="ocean" cx="42%" cy="38%" r="70%">
            <stop offset="0%" stopColor="#16375c" />
            <stop offset="100%" stopColor="#061422" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="78" fill="url(#ocean)" />
        {/* graticule */}
        {[30, 55, 78].map((r) => (
          <ellipse key={r} cx="100" cy="100" rx={r} ry="78" fill="none" stroke="var(--globe-graticule,#4d6a86)" strokeOpacity="0.35" />
        ))}
        {[-52, -26, 0, 26, 52].map((dy) => (
          <line key={dy} x1="22" y1={100 + dy} x2="178" y2={100 + dy} stroke="var(--globe-graticule,#4d6a86)" strokeOpacity="0.25" />
        ))}
        {/* accent reticle */}
        <circle cx="118" cy="86" r="16" fill="none" stroke="var(--globe-accent,#c0703a)" strokeWidth="2.5" />
      </svg>
      {countryName && (
        <p className="absolute bottom-4 font-mono text-caption tracking-wide text-[var(--globe-muted)]">
          {countryName} · 3D unavailable
        </p>
      )}
    </div>
  );
}
