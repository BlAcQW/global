"use client";

import { useEffect, useRef, useState } from "react";
import type { Slug } from "./types";
import { countries as countryData } from "./data/countries";
import { FlagChip } from "./flag-chip";

interface RailProps {
  countries: Slug[];
  active: Slug;
  onSelect: (slug: Slug) => void;
}

/**
 * Country rail of flag chips (FR-8). Keyboard-operable per §10: Tab reaches the
 * active chip, arrow keys move a roving focus, Enter/Space selects. The active
 * chip carries aria-current and the accent ring.
 */
export function Rail({ countries, active, onSelect }: RailProps) {
  const activeIndex = Math.max(0, countries.indexOf(active));
  const [focusIndex, setFocusIndex] = useState(activeIndex);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => setFocusIndex(activeIndex), [activeIndex]);

  const move = (next: number) => {
    const n = countries.length;
    const i = ((next % n) + n) % n;
    setFocusIndex(i);
    btnRefs.current[i]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        move(focusIndex + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        move(focusIndex - 1);
        break;
      case "Home":
        e.preventDefault();
        move(0);
        break;
      case "End":
        e.preventDefault();
        move(countries.length - 1);
        break;
    }
  };

  return (
    <div
      role="group"
      aria-label="Country selector"
      onKeyDown={onKeyDown}
      className="pointer-events-auto absolute inset-x-0 bottom-0 flex gap-2 overflow-x-auto px-4 py-3"
      style={{ scrollbarWidth: "thin" }}
    >
      {countries.map((slug, i) => {
        const isActive = slug === active;
        return (
          <button
            key={slug}
            ref={(el) => {
              btnRefs.current[i] = el;
            }}
            type="button"
            tabIndex={i === focusIndex ? 0 : -1}
            aria-current={isActive ? "true" : undefined}
            onClick={() => onSelect(slug)}
            title={countryData[slug].name}
            className={[
              "group flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1.5 transition",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--globe-accent)] focus-visible:ring-offset-1",
              isActive
                ? "border-[var(--globe-accent)] bg-[color:var(--globe-accent)]/10"
                : "border-transparent bg-black/5 hover:bg-black/10",
            ].join(" ")}
          >
            <FlagChip slug={slug} size={20} />
            <span
              className={[
                "font-mono text-[0.7rem] tracking-wide",
                isActive ? "text-[var(--globe-accent)]" : "text-[var(--globe-muted)]",
              ].join(" ")}
            >
              {countryData[slug].iso}
            </span>
          </button>
        );
      })}
    </div>
  );
}
