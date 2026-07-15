"use client";

import type { ReactNode } from "react";

const ACCENT = "#c0703a";

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-black/10 bg-white/70 p-4">
      {title && (
        <h2 className="mb-3 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-[#5b6b7d]">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

export function Toggle({
  label,
  on,
  onChange,
}: {
  label: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex w-full items-center justify-between gap-4 rounded-lg border border-black/10 bg-white/60 px-3 py-2 text-left transition hover:border-black/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c0703a]"
    >
      <span className="font-mono text-[0.72rem] uppercase tracking-wider text-[#3a4655]">
        {label}
      </span>
      <span
        className="relative inline-block h-4 w-8 shrink-0 rounded-full transition"
        style={{ background: on ? ACCENT : "rgba(0,0,0,0.15)" }}
      >
        <span
          className="absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all"
          style={{ left: on ? 18 : 2 }}
        />
      </span>
    </button>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1.5">
      {options.map((o) => {
        const active = o === value;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className="flex-1 rounded-lg border px-2 py-1.5 font-mono text-[0.7rem] uppercase tracking-wider transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c0703a]"
            style={
              active
                ? { borderColor: ACCENT, color: ACCENT, background: "rgba(192,112,58,0.1)" }
                : { borderColor: "rgba(0,0,0,0.1)", color: "#5b6b7d" }
            }
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
