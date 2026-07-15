"use client";

import { useCallback, useMemo, useState } from "react";
import type { FlagGlobeProps, Slug } from "./types";
import { order, countries as countryData } from "./data/countries";
import { resolveTheme, themeToCssVars } from "./theme";
import { useReducedMotion } from "./use-reduced-motion";
import { SceneLoader } from "./flag-globe.loader";
import { Rail } from "./rail";
import { Hud } from "./hud";

export type { FlagGlobeProps, GlobeTheme, Slug } from "./types";

/**
 * <FlagGlobe> — a 3D globe that masks one country out of a metallic Earth and
 * fills it with its national flag (PRD §7). Controlled via `country` or
 * uncontrolled via `defaultCountry`; every selection animates that country
 * front-and-centre (FR-7) and fires `onSelect` (FR-11).
 */
export function FlagGlobe(props: FlagGlobeProps) {
  const {
    country,
    defaultCountry = "ghana" as Slug,
    countries = "all",
    onSelect,
    autoRotate = true,
    showRail = true,
    showHud = true,
    showAtmosphere = true,
    quality = "high",
    theme,
    className,
    onReady,
    hub,
    events,
  } = props;

  const controlled = country !== undefined;
  const [internal, setInternal] = useState<Slug>(defaultCountry);
  const selected = (controlled ? country : internal) as Slug;

  // Bumped on every selection so the focus animation retriggers even when the
  // same country is chosen again (or re-passed in controlled mode).
  const [nonce, setNonce] = useState(0);

  const handleSelect = useCallback(
    (slug: Slug) => {
      onSelect?.(slug);
      if (!controlled) setInternal(slug);
      setNonce((n) => n + 1);
    },
    [controlled, onSelect]
  );

  const themeKey = theme ? JSON.stringify(theme) : "";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const resolvedTheme = useMemo(() => resolveTheme(theme), [themeKey]);

  const reducedMotion = useReducedMotion();

  const railCountries = useMemo<Slug[]>(
    () => (countries === "all" ? [...order] : countries),
    [countries]
  );

  const data = countryData[selected];
  const selectionKey = `${selected}:${nonce}`;
  const ariaLabel = `Interactive 3D globe. Selected country: ${data.name}.`;

  return (
    <div
      className={["relative isolate h-full w-full overflow-hidden", className]
        .filter(Boolean)
        .join(" ")}
      style={themeToCssVars(resolvedTheme)}
    >
      <SceneLoader
        country={selected}
        quality={quality}
        theme={resolvedTheme}
        autoRotate={autoRotate}
        reducedMotion={reducedMotion}
        showAtmosphere={showAtmosphere}
        selectionKey={selectionKey}
        ariaLabel={ariaLabel}
        onReady={onReady}
        countryName={data.name}
        hub={hub}
        events={events}
      />
      {showHud && <Hud name={data.name} centroid={data.centroid} />}
      {showRail && (
        <Rail countries={railCountries} active={selected} onSelect={handleSelect} />
      )}
    </div>
  );
}

export default FlagGlobe;
