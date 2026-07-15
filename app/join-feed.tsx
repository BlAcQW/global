"use client";

import { FlagChip } from "@/components/flag-globe/flag-chip";
import { countries } from "@/components/flag-globe/data/countries";
import type { FeedItem } from "./use-join-events";

/**
 * "Who's joining" overlay for the live seminar: a running attendee counter plus
 * a rolling list of the latest arrivals. Non-interactive so globe drag passes
 * through it.
 */
export function JoinFeed({
  title,
  hubName,
  total,
  countryCount,
  feed,
}: {
  title: string;
  hubName: string;
  total: number;
  countryCount: number;
  feed: FeedItem[];
}) {
  return (
    <div className="pointer-events-none absolute left-4 top-4 w-[260px] max-w-[70vw]">
      <div className="rounded-2xl border border-black/10 bg-white/55 p-4 shadow-[0_20px_40px_-28px_rgba(0,0,0,0.6)] backdrop-blur-md">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-[var(--globe-muted)]">
          {title}
        </p>
        <p className="mt-0.5 font-display text-base font-semibold leading-tight text-[var(--globe-ink)]">
          Broadcasting from {hubName}
        </p>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-mono text-2xl font-bold tabular-nums text-[var(--globe-accent)]">
            {total.toLocaleString()}
          </span>
          <span className="font-mono text-[0.68rem] text-[var(--globe-muted)]">
            attending · {countryCount} {countryCount === 1 ? "country" : "countries"}
          </span>
        </div>

        <ul className="mt-3 flex flex-col gap-1.5">
          {feed.map((f) => (
            <li key={f.id} className="join-feed-item flex items-center gap-2">
              <FlagChip slug={f.country} size={15} />
              <span className="truncate font-mono text-[0.72rem] text-[var(--globe-ink)]">
                {f.name ?? "New attendee"}
                <span className="text-[var(--globe-muted)]"> · {countries[f.country].name}</span>
              </span>
            </li>
          ))}
          {feed.length === 0 && (
            <li className="font-mono text-[0.7rem] text-[var(--globe-muted)]">
              Waiting for attendees…
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
