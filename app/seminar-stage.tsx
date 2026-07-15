"use client";

import { FlagGlobe } from "@/components/flag-globe";
import { useReducedMotion } from "@/components/flag-globe/use-reduced-motion";
import { resolveTheme, themeToCssVars } from "@/components/flag-globe/theme";
import { countries } from "@/components/flag-globe/data/countries";
import type { GlobeConfig } from "@/lib/globe-config";
import { useJoinEvents } from "./use-join-events";
import { JoinFeed } from "./join-feed";

/**
 * The live-seminar globe: the host country anchors the sphere, attendees pulse
 * in from around the world and arc to the hub. Joins are revealed one at a time
 * by the sequencer in useJoinEvents — the globe turns to each attendee in turn
 * (showing its flag alongside the host's), then eases back to the host when
 * things go quiet. Used on the landing and admin preview.
 */
export function SeminarStage({ config }: { config: GlobeConfig }) {
  const reducedMotion = useReducedMotion();
  const { active, feed, total, countryCount, featured } = useJoinEvents({
    hub: config.hub,
    pool: config.pool,
    demo: config.demoJoins,
    base: config.baseAttendees,
    end: config.endAttendees,
    reducedMotion,
  });

  const theme = resolveTheme({ accent: config.accent });

  return (
    <div className="relative h-full w-full" style={themeToCssVars(theme)}>
      <FlagGlobe
        country={featured ?? config.hub}
        hub={config.hub}
        events={active}
        autoRotate={config.autoRotate}
        showAtmosphere={config.showAtmosphere}
        showRail={false}
        showHud={false}
        quality={config.quality}
        theme={{ accent: config.accent }}
      />
      {config.showFeed && (
        <JoinFeed
          title={config.seminarTitle}
          hubName={countries[config.hub].name}
          total={total}
          countryCount={countryCount}
          feed={feed}
        />
      )}
    </div>
  );
}
